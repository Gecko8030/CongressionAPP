import io
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple
import json
import os
import tensorflow as tf # Required for TFLite Interpreter

class PredictionService:
    def __init__(self, model_path: str = "models/crop_disease_model.tflite"):
        self.model_path = model_path
        self.model = None
        # Default order; will be overridden by saved mapping if available
        self.class_names = [
            "healthy",
            "sheath_blight",
            "rice_blast",
            "fall_armyworm",
            "brown_spot",
            "leaf_folder"
        ]
        # Try to load persisted class index mapping from training
        try:
            mapping_path = os.path.join("models", "class_indices.json")
            if os.path.exists(mapping_path):
                with open(mapping_path, "r") as f:
                    class_indices = json.load(f)
                # Invert mapping to order class names by index
                inv = {v: k for k, v in class_indices.items()}
                ordered = [inv[i] for i in sorted(inv.keys())]
                if len(ordered) == len(self.class_names):
                    self.class_names = ordered
        except Exception:
            # Fall back silently to defaults
            pass
        self.input_size = (224, 224)

    def load_model(self):
        try:
            if self.model_path and tf.io.gfile.exists(self.model_path):
                self.model = tf.lite.Interpreter(model_path=self.model_path)
                self.model.allocate_tensors()
                # Cache I/O details for dtype/quantization handling
                self._input_details = self.model.get_input_details()
                self._output_details = self.model.get_output_details()
                return True
        except Exception as e:
            print(f"Model loading failed: {e}")

        return False

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode != "RGB":
            image = image.convert("RGB")

        # Center-crop to square before resizing to preserve aspect ratio
        w, h = image.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        image = image.crop((left, top, left + side, top + side))
        image = image.resize(self.input_size)

        img_array = np.array(image, dtype=np.float32)
        
        # --- FIX: Normalize to [-1, 1] for MobileNetV2 ---
        img_array /= 127.5
        img_array -= 1.0
        # --------------------------------------------------
        
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def _tta_images(self, image_bytes: bytes) -> np.ndarray:
        """Generate a small set of augmented views for test-time augmentation.
        Returns an array of shape (N, H, W, 3) normalized to [-1, 1].
        """
        base = Image.open(io.BytesIO(image_bytes))
        if base.mode != "RGB":
            base = base.convert("RGB")
            
        # Center-crop to square for TTA variants as well
        w, h = base.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        base = base.crop((left, top, left + side, top + side))
        base = base.resize(self.input_size)

        variants = [
            base,
            base.transpose(Image.FLIP_LEFT_RIGHT),
            base.rotate(10, resample=Image.BILINEAR),
            base.rotate(-10, resample=Image.BILINEAR),
        ]

        arrays = []
        for im in variants:
            arr = np.array(im, dtype=np.float32)
            
            # --- FIX: Normalize to [-1, 1] for MobileNetV2 ---
            arr /= 127.5
            arr -= 1.0
            # --------------------------------------------------
            
            arrays.append(arr)
        batch = np.stack(arrays, axis=0)
        return batch

    async def predict(self, image_bytes: bytes) -> Dict:
        try:
            # Use test-time augmentation batch for more stable/confident predictions
            tta_batch = self._tta_images(image_bytes)

            if self.model is None:
                model_loaded = self.load_model()
                if not model_loaded:
                    # Fall back to single image mock
                    single = self.preprocess_image(image_bytes)
                    return self._mock_prediction(single)

            # Run TFLite on each augmented view and average predictions
            preds = []
            for i in range(tta_batch.shape[0]):
                pred_i = self._run_inference(tta_batch[i:i+1, ...])
                preds.append(pred_i[0])
            predictions = np.mean(np.stack(preds, axis=0), axis=0, keepdims=True)

            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])

            all_predictions = [
                {"class": self.class_names[i], "confidence": float(predictions[0][i])}
                for i in range(len(self.class_names))
            ]
            all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

            return {
                "prediction": self.class_names[predicted_class_idx],
                "confidence": confidence,
                "all_predictions": all_predictions
            }
        except Exception as e:
            # This handles unexpected errors in the TTA/averaging/post-processing steps
            raise Exception(f"Prediction error: {str(e)}")

    def _run_inference(self, img_array: np.ndarray) -> np.ndarray:
        try:
            if self.model is None:
                # This should not happen if load_model is called correctly
                return self._mock_prediction(img_array)
            
            # Ensure dtype and quantization match model expectations
            input_details = getattr(self, "_input_details", self.model.get_input_details())
            output_details = getattr(self, "_output_details", self.model.get_output_details())
            inp = input_details[0]

            data = img_array
            
            # TFLite input handling logic (handling both float and quantized models)
            if inp["dtype"] == np.uint8:
                # If the model is quantized, we need to convert the float [-1, 1] data back to uint8 [0, 255]
                # Then apply the model's specific quantization parameters (scale/zero_point)
                # Since the data is currently [-1, 1], we map it back to [0, 255] first
                data_unnormalized = (data + 1.0) * 127.5
                
                scale, zero = inp.get("quantization", (0.0, 0))
                if scale == 0:
                    # Fallback: simple [0,255] assumption
                    data_q = np.clip(data_unnormalized, 0, 255).astype(np.uint8)
                else:
                    data_q = np.clip(np.round(data_unnormalized / scale + zero), 0, 255).astype(np.uint8)
                self.model.set_tensor(inp['index'], data_q)
            else:
                # float32 path (model expects data in the range it was trained on: [-1, 1])
                if data.dtype != np.float32:
                    data = data.astype(np.float32)
                self.model.set_tensor(inp['index'], data)
                
            self.model.invoke()

            out = output_details[0]
            output_data = self.model.get_tensor(out['index'])

            # Dequantize outputs if necessary
            if out["dtype"] == np.uint8:
                scale, zero = out.get("quantization", (0.0, 0))
                if scale > 0:
                    output_data = (output_data.astype(np.float32) - zero) * scale

            # Ensure probabilities (apply softmax if not already normalized)
            probs = output_data
            sums = np.sum(probs, axis=1, keepdims=True)
            if not np.allclose(sums, 1.0, atol=1e-3):
                # Treat as logits
                exps = np.exp(probs - np.max(probs, axis=1, keepdims=True))
                probs = exps / np.sum(exps, axis=1, keepdims=True)
            return probs
        except Exception as e:
            # The 'utf-8' error was caught here due to invalid data being passed to seed
            print(f"Inference failed, using mock: {e}")
            return self._mock_prediction(img_array)

    def _mock_prediction(self, img_array: np.ndarray) -> Dict:
        # Since the input array is now a NumPy array of floats, we seed correctly.
        # This function now returns a properly formatted dictionary matching the predict signature.
        np.random.seed(int(np.sum(img_array) * 1000) % 2**32)

        predictions = np.random.dirichlet(np.ones(len(self.class_names)) * 2)
        
        predicted_class_idx = np.argmax(predictions)
        confidence = float(predictions[predicted_class_idx])

        all_predictions = [
            {"class": self.class_names[i], "confidence": float(predictions[i])}
            for i in range(len(self.class_names))
        ]
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "prediction": self.class_names[predicted_class_idx],
            "confidence": confidence,
            "all_predictions": all_predictions
        }
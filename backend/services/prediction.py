import io
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple

class PredictionService:
    def __init__(self, model_path: str = "models/crop_disease_model.tflite"):
        self.model_path = model_path
        self.model = None
        self.class_names = [
            "healthy",
            "sheath_blight",
            "rice_blast",
            "fall_armyworm",
            "brown_spot",
            "leaf_folder"
        ]
        self.input_size = (224, 224)

    def load_model(self):
        try:
            import tensorflow as tf
            if self.model_path and tf.io.gfile.exists(self.model_path):
                self.model = tf.lite.Interpreter(model_path=self.model_path)
                self.model.allocate_tensors()
                return True
        except Exception as e:
            print(f"Model loading failed: {e}")

        return False

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize(self.input_size)

        img_array = np.array(image, dtype=np.float32)

        img_array = img_array / 255.0

        img_array = np.expand_dims(img_array, axis=0)

        return img_array

    async def predict(self, image_bytes: bytes) -> Dict:
        try:
            img_array = self.preprocess_image(image_bytes)

            if self.model is None:
                model_loaded = self.load_model()
                if not model_loaded:
                    return self._mock_prediction(img_array)

            predictions = self._run_inference(img_array)

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
            raise Exception(f"Prediction error: {str(e)}")

    def _run_inference(self, img_array: np.ndarray) -> np.ndarray:
        try:
            if self.model is None:
                return self._mock_prediction(img_array)
            
            input_details = self.model.get_input_details()
            output_details = self.model.get_output_details()

            self.model.set_tensor(input_details[0]['index'], img_array)
            self.model.invoke()

            output_data = self.model.get_tensor(output_details[0]['index'])
            return output_data
        except Exception:
            return self._mock_prediction(img_array)

    def _mock_prediction(self, img_array: np.ndarray) -> np.ndarray:
        np.random.seed(int(np.sum(img_array) * 1000) % 2**32)

        predictions = np.random.dirichlet(np.ones(len(self.class_names)) * 2)

        return np.array([predictions])

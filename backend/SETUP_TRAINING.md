# Quick Setup for Model Training

## 1. Install TensorFlow

The training script requires TensorFlow. Install it with:

```bash
pip install tensorflow
```

For Apple Silicon (M1/M2/M3 Macs), you may want to use:
```bash
pip install tensorflow-macos
```

## 2. Install Additional Dependencies

```bash
pip install matplotlib
```

## 3. Download Sample Data (Optional)

To test the training pipeline without collecting your own data, you can:

1. Download the PlantVillage dataset (public domain):
   - Rice diseases: https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
   - Or search for "crop disease dataset" on Kaggle

2. Create a minimal test dataset:
   ```bash
   mkdir -p backend/data/{train,val,test}/{healthy,sheath_blight}
   # Add 10-20 images to each folder for testing
   ```

## 4. Run Training

```bash
cd backend
python train_model.py
```

## 5. Deploy the Trained Model

Once training completes, the model will be saved as:
- `backend/models/crop_disease_model.tflite`

The prediction service will automatically load it on the next restart.

## Note

The current backend is running without TensorFlow, using mock predictions. After you train a model and install TensorFlow, the predictions will use your trained model instead.

## Quick Test Without Full Training

If you just want to verify the setup works, create a small test dataset:

```bash
mkdir -p backend/data/{train,val,test}/{healthy,disease}
# Add a few test images to each folder
python train_model.py
```

This will run through the training pipeline even with minimal data (useful for debugging).

## Understanding the Model

The trained model uses **MobileNetV3-Small**, which is:
- Lightweight (optimized for mobile devices)
- Fast inference (<1 second)
- Good accuracy on crop disease detection

The model predicts 6 classes:
1. healthy
2. sheath_blight (rice)
3. rice_blast (rice)
4. fall_armyworm (rice, soy, cotton)
5. brown_spot (rice, soy)
6. leaf_folder (rice)




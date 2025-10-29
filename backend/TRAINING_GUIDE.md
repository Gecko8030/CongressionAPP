# Crop Disease Detection Model Training Guide

This guide will walk you through training a custom crop disease detection model for the Congressional App.

## 📋 Prerequisites

1. **Python 3.9+** installed
2. **TensorFlow 2.x** installed
3. **Training data** for crop diseases

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
pip install tensorflow tensorflow-lite pillow matplotlib numpy
```

### Step 2: Organize Your Data

Create the following directory structure:

```
backend/data/
├── train/
│   ├── healthy/          # Put healthy crop images here
│   ├── sheath_blight/    # Sheath blight disease images
│   ├── rice_blast/       # Rice blast disease images
│   ├── fall_armyworm/    # Fall armyworm damage images
│   ├── brown_spot/       # Brown spot disease images
│   └── leaf_folder/      # Leaf folder pest damage images
├── val/                  # Validation set (same subdirectories)
└── test/                 # Test set (same subdirectories)
```

**Recommended split:**
- Training: 70%
- Validation: 15%
- Test: 15%

### Step 3: Collect Training Images

You'll need to collect and label images for each disease class:

#### **Healthy Crops**
- Images of healthy rice, soybean, and cotton plants
- Clear leaves without disease symptoms
- Good lighting and focus

#### **Sheath Blight (Rice)**
- Look for: Oval lesions with gray-green centers
- Common in rice crops
- Target: 200+ images per class

#### **Rice Blast**
- Look for: Diamond-shaped lesions with brown margins
- Target: 200+ images per class

#### **Fall Armyworm**
- Look for: Defoliation and whorl damage
- Affects rice, soy, and cotton
- Target: 200+ images per class

#### **Brown Spot**
- Look for: Brown spots on leaves
- Common in rice and soybeans
- Target: 200+ images per class

#### **Leaf Folder**
- Look for: Rolled/folded leaves with feeding damage
- Target: 200+ images per class

### Step 4: Run Training

```bash
cd backend
python train_model.py
```

The script will:
1. Load and augment your training data
2. Build a MobileNetV3-Small based model
3. Train for 50 epochs (with early stopping)
4. Fine-tune the model
5. Save the model as `models/crop_disease_model.h5`
6. Convert to TensorFlow Lite format for mobile deployment

## 📊 Training Parameters

You can modify these in `train_model.py`:

```python
IMAGE_SIZE = (224, 224)    # Input image size
BATCH_SIZE = 32           # Training batch size
EPOCHS = 50                # Maximum training epochs
LEARNING_RATE = 0.001      # Initial learning rate
```

## 📈 Expected Results

With good data (1000+ images per class):
- **Accuracy**: 85%+
- **Top-3 Accuracy**: 95%+
- **Inference time**: <1 second on CPU

## 🔍 Model Architecture

The model uses **MobileNetV3-Small** as the base architecture:
- Lightweight and mobile-optimized
- Pre-trained on ImageNet
- Custom classification head for 6 classes
- Transfer learning for crop disease detection

## 📁 Output Files

After training, you'll get:
1. `models/crop_disease_model.h5` - Full Keras model
2. `models/crop_disease_model.tflite` - TensorFlow Lite model (for deployment)
3. `training_history.png` - Training curves

## 🎯 Data Collection Tips

1. **Diversity**: Collect images from different:
   - Angles (top, side, close-up)
   - Lighting conditions
   - Growth stages
   - Locations/fields

2. **Quality**: Use high-resolution images (at least 224x224)

3. **Balance**: Try to have similar number of images per class

4. **Labeling**: Be consistent with disease identification

## 🔧 Troubleshooting

### "Out of memory" error
- Reduce `BATCH_SIZE` to 16 or 8
- Use fewer images per class

### Low accuracy
- Collect more training data
- Check image quality and labeling
- Try data augmentation parameters

### TensorFlow not found
```bash
pip install tensorflow
```

## 📚 Data Sources

You can collect images from:
- University extension services
- Agricultural research stations
- Field photography
- Online agricultural databases (with proper licensing)
- Your own farm photography

## 🎓 Next Steps

1. Test the trained model with new images
2. Deploy the `.tflite` model to the backend
3. Update the prediction service to use your model
4. Continue collecting data to improve accuracy

## 📞 Support

For questions or issues, refer to:
- TensorFlow documentation: https://www.tensorflow.org/
- MobileNetV3 paper: https://arxiv.org/abs/1905.02244
- Crop disease identification guides from your local extension office




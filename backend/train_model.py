"""
Crop Disease Detection Model Training Script

This script trains a MobileNetV3-Small based model to detect crop diseases
in images of rice, soybeans, and cotton.

Dataset Structure:
data/
├── train/
│   ├── healthy/
│   ├── sheath_blight/
│   ├── rice_blast/
│   ├── fall_armyworm/
│   ├── brown_spot/
│   └── leaf_folder/
├── val/
│   └── (same structure as train/)
└── test/
    └── (same structure as train/)
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt
from pathlib import Path

# Configuration
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
DATA_DIR = "data"
MODEL_SAVE_PATH = "models/crop_disease_model.h5"
TFLITE_SAVE_PATH = "models/crop_disease_model.tflite"

# Class names (matching prediction service)
CLASS_NAMES = [
    "healthy",
    "sheath_blight",
    "rice_blast", 
    "fall_armyworm",
    "brown_spot",
    "leaf_folder"
]

def create_data_generators(data_dir):
    """Create data generators for training and validation."""
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescale for validation
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')
    test_dir = os.path.join(data_dir, 'test')
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True,
        seed=42
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    test_generator = val_datagen.flow_from_directory(
        test_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator, test_generator

def build_model(num_classes=6):
    """Build the MobileNetV3-Small based model."""
    
    # Load MobileNetV3-Small; try ImageNet weights, fall back to random init if offline
    try:
        base_model = MobileNetV3Small(
            input_shape=(*IMAGE_SIZE, 3),
            include_top=False,
            weights='imagenet',
            pooling='avg'
        )
    except Exception as e:
        print("Could not load ImageNet weights (likely offline). Using random initialization.")
        base_model = MobileNetV3Small(
            input_shape=(*IMAGE_SIZE, 3),
            include_top=False,
            weights=None,
            pooling='avg'
        )
    
    # Allow training on the last blocks from the start for more capacity
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    # Add custom classification head
    inputs = keras.Input(shape=(*IMAGE_SIZE, 3))
    x = base_model(inputs, training=False)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    
    return model

def train_model():
    """Train the crop disease detection model."""
    
    print("=" * 60)
    print("Crop Disease Detection Model Training")
    print("=" * 60)
    
    # Check if data directory exists
    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory '{DATA_DIR}' not found!")
        print("\nPlease create the following directory structure:")
        print(f"{DATA_DIR}/")
        print("├── train/")
        for class_name in CLASS_NAMES:
            print(f"│   ├── {class_name}/")
        print("├── val/")
        for class_name in CLASS_NAMES:
            print(f"│   ├── {class_name}/")
        print("└── test/")
        for class_name in CLASS_NAMES:
            print(f"    ├── {class_name}/")
        return
    
    # Create data generators
    print("\n[1/5] Loading and preparing data...")
    train_gen, val_gen, test_gen = create_data_generators(DATA_DIR)
    
    print(f"Train samples: {train_gen.samples}")
    print(f"Validation samples: {val_gen.samples}")
    print(f"Test samples: {test_gen.samples}")
    
    # Build model
    print("\n[2/5] Building model...")
    model = build_model(num_classes=len(CLASS_NAMES))
    model.summary()
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Callbacks (simplify LR scheduling initially)
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        ),
        keras.callbacks.ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
    ]
    
    # Train model
    print("\n[3/5] Training model...")
    # Class weights to mitigate imbalance
    import numpy as _np
    class_counts = _np.bincount(train_gen.classes, minlength=len(CLASS_NAMES))
    total = class_counts.sum()
    class_weight = {i: (total / (len(CLASS_NAMES) * max(1, c))) for i, c in enumerate(class_counts)}

    # Log class mapping and counts
    print("Training classes:", train_gen.class_indices)
    print("Validation classes:", val_gen.class_indices)
    print("Train samples:", train_gen.samples)
    print("Validation samples:", val_gen.samples)
    print("Class counts:", {cls: int(class_counts[idx]) for cls, idx in train_gen.class_indices.items()})

    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
        class_weight=class_weight,
        verbose=1
    )
    
    # Fine-tuning: Unfreeze some layers
    print("\n[4/5] Fine-tuning model...")
    base_model = model.layers[1]  # Get the base MobileNet model
    base_model.trainable = True  # Unfreeze more for fine-tuning
    
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE * 0.1),  # Lower learning rate
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Continue training
    history_fine = model.fit(
        train_gen,
        epochs=20,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate on test set
    print("\n[5/5] Evaluating on test set...")
    test_results = model.evaluate(test_gen, verbose=1)
    print(f"Test Loss: {test_results[0]:.4f}")
    print(f"Test Accuracy: {test_results[1]:.4f}")
    
    # Plot training history
    plot_training_history(history, history_fine)
    
    # Save model
    print("\nSaving trained model...")
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to: {MODEL_SAVE_PATH}")
    
    # Convert to TensorFlow Lite
    print("Converting to TensorFlow Lite...")
    convert_to_tflite(model)
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print(f"Model saved to: {MODEL_SAVE_PATH}")
    print(f"TensorFlow Lite model: {TFLITE_SAVE_PATH}")
    print("=" * 60)

def convert_to_tflite(model):
    """Convert the trained model to TensorFlow Lite format."""
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimize for mobile
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Convert
    tflite_model = converter.convert()
    
    # Save
    os.makedirs(os.path.dirname(TFLITE_SAVE_PATH), exist_ok=True)
    with open(TFLITE_SAVE_PATH, 'wb') as f:
        f.write(tflite_model)
    
    print(f"TensorFlow Lite model saved to: {TFLITE_SAVE_PATH}")

def plot_training_history(history, history_fine=None):
    """Plot training curves."""
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Combine histories
    if history_fine:
        epochs = range(1, len(history.history['loss']) + len(history_fine.history['loss']) + 1)
        
        axes[0].plot(history.history['loss'], label='Train Loss', color='blue')
        axes[0].plot(history.history['val_loss'], label='Val Loss', color='orange')
        if 'loss' in history_fine.history:
            epochs_fine = range(len(history.history['loss']) + 1, len(epochs) + 1)
            axes[0].plot(epochs_fine, history_fine.history['loss'], 
                       label='Train Loss (Fine)', color='green')
            axes[0].plot(epochs_fine, history_fine.history['val_loss'], 
                       label='Val Loss (Fine)', color='red')
        
        axes[1].plot(history.history['accuracy'], label='Train Acc', color='blue')
        axes[1].plot(history.history['val_accuracy'], label='Val Acc', color='orange')
        if 'accuracy' in history_fine.history:
            axes[1].plot(epochs_fine, history_fine.history['accuracy'],
                       label='Train Acc (Fine)', color='green')
            axes[1].plot(epochs_fine, history_fine.history['val_accuracy'],
                       label='Val Acc (Fine)', color='red')
    else:
        epochs = range(1, len(history.history['loss']) + 1)
        axes[0].plot(epochs, history.history['loss'], label='Train Loss')
        axes[0].plot(epochs, history.history['val_loss'], label='Val Loss')
        
        axes[1].plot(epochs, history.history['accuracy'], label='Train Acc')
        axes[1].plot(epochs, history.history['val_accuracy'], label='Val Acc')
    
    axes[0].set_title('Model Loss')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Loss')
    axes[0].legend()
    axes[0].grid(True)
    
    axes[1].set_title('Model Accuracy')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Accuracy')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=150)
    print("Training history plot saved to: training_history.png")

if __name__ == "__main__":
    # Check if running in TensorFlow environment
    if not tf.__version__:
        print("Error: TensorFlow not installed!")
        print("Install with: pip install tensorflow")
        exit(1)
    
    print(f"TensorFlow version: {tf.__version__}")
    print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")
    
    train_model()


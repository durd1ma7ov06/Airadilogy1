"""
AiRadiology - Chest X-ray Pneumonia Detection Model Training
Professional CNN model with Transfer Learning (ResNet50)
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import matplotlib.pyplot as plt
from datetime import datetime

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.0001

# Paths
TRAIN_DIR = 'chest_xray/chest_xray/train'
TEST_DIR = 'chest_xray/chest_xray/test'
MODEL_SAVE_PATH = 'models/pneumonia_detection_model.h5'
TFLITE_MODEL_PATH = 'models/pneumonia_model.tflite'

print("=" * 70)
print("🏥 AiRadiology - Pneumonia Detection Model Training")
print("=" * 70)
print(f"📊 Image Size: {IMG_SIZE}x{IMG_SIZE}")
print(f"📦 Batch Size: {BATCH_SIZE}")
print(f"🔄 Epochs: {EPOCHS}")
print(f"🎯 Learning Rate: {LEARNING_RATE}")
print("=" * 70)

# Create models directory
os.makedirs('models', exist_ok=True)

# Data Augmentation for Training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2  # 20% for validation
)

# Only rescaling for test data
test_datagen = ImageDataGenerator(rescale=1./255)

print("\n📂 Loading Training Data...")
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='training',
    shuffle=True
)

print("\n📂 Loading Validation Data...")
validation_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='validation',
    shuffle=True
)

print("\n📂 Loading Test Data...")
test_generator = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary',
    shuffle=False
)

print("\n" + "=" * 70)
print("📊 Dataset Statistics:")
print("=" * 70)
print(f"Training samples: {train_generator.samples}")
print(f"Validation samples: {validation_generator.samples}")
print(f"Test samples: {test_generator.samples}")
print(f"Classes: {train_generator.class_indices}")
print("=" * 70)

# Build Model with Transfer Learning
print("\n🏗️ Building Model (ResNet50 + Custom Layers)...")

base_model = ResNet50(
    include_top=False,
    weights='imagenet',
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Freeze base model layers
base_model.trainable = False

# Build complete model
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dense(512, activation='relu'),
    layers.Dropout(0.5),
    layers.BatchNormalization(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(1, activation='sigmoid')
])

# Compile model
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='binary_crossentropy',
    metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall(), keras.metrics.AUC()]
)

print("\n📋 Model Summary:")
model.summary()

# Callbacks
callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    ),
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
]

# Train Model
print("\n" + "=" * 70)
print("🚀 Starting Training...")
print("=" * 70)

start_time = datetime.now()

history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
    verbose=1
)

training_time = datetime.now() - start_time

print("\n" + "=" * 70)
print(f"✅ Training Complete! Time: {training_time}")
print("=" * 70)

# Evaluate on Test Set
print("\n📊 Evaluating on Test Set...")
test_loss, test_accuracy, test_precision, test_recall, test_auc = model.evaluate(test_generator)

print("\n" + "=" * 70)
print("🎯 Final Test Results:")
print("=" * 70)
print(f"Test Accuracy:  {test_accuracy * 100:.2f}%")
print(f"Test Precision: {test_precision * 100:.2f}%")
print(f"Test Recall:    {test_recall * 100:.2f}%")
print(f"Test AUC:       {test_auc * 100:.2f}%")
print(f"Test Loss:      {test_loss:.4f}")
print("=" * 70)

# Save model in TensorFlow Lite format for web deployment
print("\n💾 Converting to TensorFlow Lite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open(TFLITE_MODEL_PATH, 'wb') as f:
    f.write(tflite_model)

print(f"✅ TFLite model saved: {TFLITE_MODEL_PATH}")

# Plot Training History
print("\n📈 Generating Training Plots...")

plt.figure(figsize=(15, 5))

# Accuracy plot
plt.subplot(1, 3, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy', linewidth=2)
plt.plot(history.history['val_accuracy'], label='Val Accuracy', linewidth=2)
plt.title('Model Accuracy', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, alpha=0.3)

# Loss plot
plt.subplot(1, 3, 2)
plt.plot(history.history['loss'], label='Train Loss', linewidth=2)
plt.plot(history.history['val_loss'], label='Val Loss', linewidth=2)
plt.title('Model Loss', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, alpha=0.3)

# AUC plot
plt.subplot(1, 3, 3)
plt.plot(history.history['auc'], label='Train AUC', linewidth=2)
plt.plot(history.history['val_auc'], label='Val AUC', linewidth=2)
plt.title('Model AUC', fontsize=14, fontweight='bold')
plt.xlabel('Epoch')
plt.ylabel('AUC')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('models/training_history.png', dpi=300, bbox_inches='tight')
print("✅ Training plots saved: models/training_history.png")

# Print final summary
print("\n" + "=" * 70)
print("🎉 MODEL TRAINING COMPLETE!")
print("=" * 70)
print(f"📁 Keras Model: {MODEL_SAVE_PATH}")
print(f"📁 TFLite Model: {TFLITE_MODEL_PATH}")
print(f"📁 Training Plot: models/training_history.png")
print(f"⏱️ Total Training Time: {training_time}")
print(f"🎯 Final Test Accuracy: {test_accuracy * 100:.2f}%")
print("=" * 70)
print("\n✨ Next Steps:")
print("1. Test the model with: python test_model.py")
print("2. Deploy to web app (TensorFlow.js conversion needed)")
print("3. Compare with Gemini API results")
print("=" * 70)

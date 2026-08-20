"""
Test trained model with sample images
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import os

MODEL_PATH = 'models/pneumonia_detection_model.h5'
IMG_SIZE = 224

print("=" * 70)
print("🧪 Testing Pneumonia Detection Model")
print("=" * 70)

# Load model
print("\n📦 Loading model...")
model = keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

def predict_image(image_path):
    """Predict pneumonia from X-ray image"""
    # Load and preprocess image
    img = Image.open(image_path).convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    prediction = model.predict(img_array, verbose=0)[0][0]
    
    # Interpret result
    if prediction > 0.5:
        result = "PNEUMONIA"
        confidence = prediction * 100
    else:
        result = "NORMAL"
        confidence = (1 - prediction) * 100
    
    return result, confidence, img

# Test with sample images
print("\n🔍 Testing with sample images...")

test_images = []

# Get some NORMAL samples
normal_dir = 'chest_xray/chest_xray/test/NORMAL'
if os.path.exists(normal_dir):
    normal_files = [f for f in os.listdir(normal_dir) if f.endswith(('.jpeg', '.jpg', '.png'))][:3]
    test_images.extend([(os.path.join(normal_dir, f), 'NORMAL') for f in normal_files])

# Get some PNEUMONIA samples
pneumonia_dir = 'chest_xray/chest_xray/test/PNEUMONIA'
if os.path.exists(pneumonia_dir):
    pneumonia_files = [f for f in os.listdir(pneumonia_dir) if f.endswith(('.jpeg', '.jpg', '.png'))][:3]
    test_images.extend([(os.path.join(pneumonia_dir, f), 'PNEUMONIA') for f in pneumonia_files])

# Create visualization
if test_images:
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    axes = axes.flatten()
    
    for idx, (img_path, true_label) in enumerate(test_images):
        if idx >= 6:
            break
            
        result, confidence, img = predict_image(img_path)
        
        # Display
        axes[idx].imshow(img)
        axes[idx].axis('off')
        
        # Color based on correct/incorrect
        color = 'green' if result == true_label else 'red'
        
        title = f"True: {true_label}\nPredicted: {result}\nConfidence: {confidence:.1f}%"
        axes[idx].set_title(title, fontsize=10, fontweight='bold', color=color)
        
        print(f"\n{'='*50}")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"True Label: {true_label}")
        print(f"Predicted: {result} ({confidence:.2f}% confidence)")
        print(f"Result: {'✅ CORRECT' if result == true_label else '❌ INCORRECT'}")
    
    plt.tight_layout()
    plt.savefig('models/test_predictions.png', dpi=300, bbox_inches='tight')
    print(f"\n✅ Test results saved: models/test_predictions.png")
    print("=" * 70)
else:
    print("❌ No test images found!")

print("\n🎯 Model testing complete!")
print("=" * 70)

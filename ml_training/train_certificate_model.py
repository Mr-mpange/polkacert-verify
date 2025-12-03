"""
Certificate Forgery Detection - ML Model Training
Train a deep learning model to detect forged certificates
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from pathlib import Path
import json
from datetime import datetime

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.0001
NUM_CLASSES = 4

# Paths
TRAIN_DIR = Path('training_data')
MODEL_OUTPUT = Path('../public/models/certificate-detector')
LOGS_DIR = Path('logs')

# Class names
CLASS_NAMES = ['authentic', 'forged', 'tampered', 'screenshot']

def setup_directories():
    """Create necessary directories"""
    MODEL_OUTPUT.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create training data structure if it doesn't exist
    for class_name in CLASS_NAMES:
        (TRAIN_DIR / class_name).mkdir(parents=True, exist_ok=True)
    
    print("✅ Directories created")

def load_dataset():
    """Load and preprocess dataset"""
    print("\n📂 Loading dataset...")
    
    images = []
    labels = []
    
    for class_idx, class_name in enumerate(CLASS_NAMES):
        class_dir = TRAIN_DIR / class_name
        image_files = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        
        print(f"  {class_name}: {len(image_files)} images")
        
        for img_path in image_files:
            try:
                # Load and preprocess image
                img = keras.preprocessing.image.load_img(
                    img_path, 
                    target_size=(IMG_SIZE, IMG_SIZE)
                )
                img_array = keras.preprocessing.image.img_to_array(img)
                img_array = img_array / 255.0  # Normalize
                
                images.append(img_array)
                labels.append(class_idx)
            except Exception as e:
                print(f"  ⚠️ Error loading {img_path}: {e}")
    
    if len(images) == 0:
        raise ValueError("No images found! Please add images to training_data/ folders")
    
    # Convert to numpy arrays
    images = np.array(images)
    labels = keras.utils.to_categorical(labels, NUM_CLASSES)
    
    print(f"\n✅ Loaded {len(images)} images")
    print(f"   Shape: {images.shape}")
    
    return images, labels

def create_data_augmentation():
    """Create data augmentation pipeline"""
    return ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )

def create_model(use_transfer_learning=True):
    """Create the model architecture"""
    print("\n🏗️ Building model...")
    
    if use_transfer_learning:
        # Use MobileNetV2 as base
        base_model = keras.applications.MobileNetV2(
            input_shape=(IMG_SIZE, IMG_SIZE, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(NUM_CLASSES, activation='softmax')
        ])
        
        print("✅ Using MobileNetV2 with transfer learning")
    else:
        # Build from scratch
        model = keras.Sequential([
            layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
            
            # Block 1
            layers.Conv2D(32, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            
            # Block 2
            layers.Conv2D(64, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            
            # Block 3
            layers.Conv2D(128, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            
            # Block 4
            layers.Conv2D(256, 3, activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling2D(2),
            
            # Dense layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(NUM_CLASSES, activation='softmax')
        ])
        
        print("✅ Built custom CNN from scratch")
    
    return model

def compile_model(model):
    """Compile the model"""
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    print("\n📊 Model Summary:")
    model.summary()
    
    return model

def create_callbacks():
    """Create training callbacks"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Early stopping
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        
        # Model checkpoint
        keras.callbacks.ModelCheckpoint(
            str(LOGS_DIR / f'best_model_{timestamp}.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        
        # TensorBoard
        keras.callbacks.TensorBoard(
            log_dir=str(LOGS_DIR / f'tensorboard_{timestamp}'),
            histogram_freq=1
        ),
        
        # CSV Logger
        keras.callbacks.CSVLogger(
            str(LOGS_DIR / f'training_{timestamp}.csv')
        )
    ]
    
    return callbacks

def train_model(model, X_train, y_train, X_val, y_val, use_augmentation=True):
    """Train the model"""
    print("\n🚀 Starting training...")
    print(f"   Training samples: {len(X_train)}")
    print(f"   Validation samples: {len(X_val)}")
    print(f"   Epochs: {EPOCHS}")
    print(f"   Batch size: {BATCH_SIZE}")
    
    callbacks = create_callbacks()
    
    if use_augmentation:
        # Train with data augmentation
        datagen = create_data_augmentation()
        datagen.fit(X_train)
        
        history = model.fit(
            datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
            epochs=EPOCHS,
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
    else:
        # Train without augmentation
        history = model.fit(
            X_train, y_train,
            batch_size=BATCH_SIZE,
            epochs=EPOCHS,
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
    
    return history

def fine_tune_model(model, X_train, y_train, X_val, y_val):
    """Fine-tune the model by unfreezing some layers"""
    print("\n🔧 Fine-tuning model...")
    
    # Unfreeze the last 20 layers
    for layer in model.layers[-20:]:
        if not isinstance(layer, layers.BatchNormalization):
            layer.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    # Train for fewer epochs
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=20,
        validation_data=(X_val, y_val),
        callbacks=create_callbacks(),
        verbose=1
    )
    
    return history

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    print("\n📈 Evaluating model...")
    
    # Get predictions
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true_classes = np.argmax(y_test, axis=1)
    
    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(
        y_true_classes, 
        y_pred_classes, 
        target_names=CLASS_NAMES
    ))
    
    # Confusion matrix
    cm = confusion_matrix(y_true_classes, y_pred_classes)
    print("\n🔢 Confusion Matrix:")
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    plt.colorbar()
    tick_marks = np.arange(len(CLASS_NAMES))
    plt.xticks(tick_marks, CLASS_NAMES, rotation=45)
    plt.yticks(tick_marks, CLASS_NAMES)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(LOGS_DIR / 'confusion_matrix.png')
    print(f"✅ Confusion matrix saved to {LOGS_DIR / 'confusion_matrix.png'}")
    
    # Calculate accuracy per class
    print("\n📊 Per-Class Accuracy:")
    for i, class_name in enumerate(CLASS_NAMES):
        class_correct = cm[i, i]
        class_total = cm[i].sum()
        accuracy = class_correct / class_total if class_total > 0 else 0
        print(f"   {class_name}: {accuracy:.2%} ({class_correct}/{class_total})")
    
    return y_pred, y_pred_classes

def plot_training_history(history):
    """Plot training history"""
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Train')
    axes[0, 0].plot(history.history['val_accuracy'], label='Validation')
    axes[0, 0].set_title('Model Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Loss
    axes[0, 1].plot(history.history['loss'], label='Train')
    axes[0, 1].plot(history.history['val_loss'], label='Validation')
    axes[0, 1].set_title('Model Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Precision
    axes[1, 0].plot(history.history['precision'], label='Train')
    axes[1, 0].plot(history.history['val_precision'], label='Validation')
    axes[1, 0].set_title('Model Precision')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Precision')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Recall
    axes[1, 1].plot(history.history['recall'], label='Train')
    axes[1, 1].plot(history.history['val_recall'], label='Validation')
    axes[1, 1].set_title('Model Recall')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Recall')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig(LOGS_DIR / 'training_history.png')
    print(f"✅ Training history saved to {LOGS_DIR / 'training_history.png'}")

def save_model_for_tfjs(model):
    """Save model in TensorFlow.js format"""
    print("\n💾 Saving model for TensorFlow.js...")
    
    try:
        import tensorflowjs as tfjs
        
        # Save in TensorFlow.js format
        tfjs.converters.save_keras_model(model, str(MODEL_OUTPUT))
        
        print(f"✅ Model saved to {MODEL_OUTPUT}")
        print(f"   Files created:")
        print(f"   - model.json")
        print(f"   - group1-shard1of1.bin")
        
        # Save metadata
        metadata = {
            'model_version': '1.0.0',
            'trained_date': datetime.now().isoformat(),
            'num_classes': NUM_CLASSES,
            'class_names': CLASS_NAMES,
            'input_shape': [IMG_SIZE, IMG_SIZE, 3],
            'framework': 'TensorFlow/Keras',
            'architecture': 'MobileNetV2 + Custom Head'
        }
        
        with open(MODEL_OUTPUT / 'metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Metadata saved to {MODEL_OUTPUT / 'metadata.json'}")
        
    except ImportError:
        print("⚠️ tensorflowjs not installed. Installing...")
        os.system('pip install tensorflowjs')
        save_model_for_tfjs(model)

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("Certificate Forgery Detection - Model Training")
    print("=" * 60)
    
    # Setup
    setup_directories()
    
    # Load dataset
    try:
        images, labels = load_dataset()
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\n📝 Instructions:")
        print("   1. Create folders: training_data/authentic, forged, tampered, screenshot")
        print("   2. Add certificate images to each folder")
        print("   3. Minimum 100 images per class (more is better)")
        print("   4. Run this script again")
        return
    
    # Split dataset
    X_train, X_temp, y_train, y_temp = train_test_split(
        images, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"\n📊 Dataset split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Validation: {len(X_val)} samples")
    print(f"   Test: {len(X_test)} samples")
    
    # Create model
    model = create_model(use_transfer_learning=True)
    model = compile_model(model)
    
    # Train model
    history = train_model(model, X_train, y_train, X_val, y_val, use_augmentation=True)
    
    # Fine-tune (optional)
    print("\n❓ Fine-tune model? (y/n): ", end='')
    if input().lower() == 'y':
        history_ft = fine_tune_model(model, X_train, y_train, X_val, y_val)
    
    # Evaluate
    evaluate_model(model, X_test, y_test)
    
    # Plot history
    plot_training_history(history)
    
    # Save model
    save_model_for_tfjs(model)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print(f"\n📁 Model saved to: {MODEL_OUTPUT}")
    print(f"📁 Logs saved to: {LOGS_DIR}")
    print("\n🚀 Next steps:")
    print("   1. Copy model files to your React app:")
    print(f"      cp -r {MODEL_OUTPUT}/* ../public/models/certificate-detector/")
    print("   2. Update mlModel.ts to load your trained model")
    print("   3. Test in your app!")

if __name__ == '__main__':
    main()

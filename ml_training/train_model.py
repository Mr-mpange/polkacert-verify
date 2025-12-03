"""
Certificate Forgery Detection Model Training
Trains a CNN model to detect authentic vs forged certificates
"""

import os
import json
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
NUM_CLASSES = 4  # authentic, forged, tampered, screenshot
LEARNING_RATE = 0.001

# Paths
TRAIN_DIR = Path('training_data')
MODEL_OUTPUT = Path('../public/models/certificate-detector')
CHECKPOINT_DIR = Path('checkpoints')

# Class labels
CLASS_NAMES = ['authentic', 'forged', 'tampered', 'screenshot']

def create_directories():
    """Create necessary directories"""
    MODEL_OUTPUT.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create training data directories if they don't exist
    for class_name in CLASS_NAMES:
        (TRAIN_DIR / class_name).mkdir(parents=True, exist_ok=True)
    
    print("✅ Directories created")

def load_and_preprocess_image(image_path, label):
    """Load and preprocess a single image"""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((IMG_SIZE, IMG_SIZE))
        img_array = np.array(img) / 255.0
        return img_array, label
    except Exception as e:
        print(f"Error loading {image_path}: {e}")
        return None, None

def load_dataset():
    """Load and prepare the dataset"""
    print("Loading dataset...")
    
    images = []
    labels = []
    
    for class_idx, class_name in enumerate(CLASS_NAMES):
        class_dir = TRAIN_DIR / class_name
        
        if not class_dir.exists():
            print(f"⚠️  Warning: {class_dir} does not exist")
            continue
        
        image_files = list(class_dir.glob('*.jpg')) + \
                     list(class_dir.glob('*.jpeg')) + \
                     list(class_dir.glob('*.png'))
        
        print(f"Loading {len(image_files)} images from {class_name}...")
        
        for img_path in image_files:
            img_array, label = load_and_preprocess_image(img_path, class_idx)
            if img_array is not None:
                images.append(img_array)
                labels.append(label)
    
    if len(images) == 0:
        raise ValueError("No images found! Please add training data to training_data/ directory")
    
    # Convert to numpy arrays
    images = np.array(images)
    labels = keras.utils.to_categorical(labels, NUM_CLASSES)
    
    print(f"✅ Loaded {len(images)} images")
    print(f"   Shape: {images.shape}")
    
    # Split into train/validation/test
    X_train, X_temp, y_train, y_temp = train_test_split(
        images, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"   Training: {len(X_train)}")
    print(f"   Validation: {len(X_val)}")
    print(f"   Test: {len(X_test)}")
    
    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

def create_model():
    """Create CNN model architecture"""
    print("Creating model...")
    
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        
        # Data augmentation (built into model)
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        
        # Convolutional blocks
        layers.Conv2D(32, 3, activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.2),
        
        layers.Conv2D(64, 3, activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.2),
        
        layers.Conv2D(128, 3, activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.3),
        
        layers.Conv2D(256, 3, activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2),
        layers.Dropout(0.3),
        
        # Dense layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        
        # Output layer
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    print("✅ Model created")
    model.summary()
    
    return model

def create_callbacks():
    """Create training callbacks"""
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
            str(CHECKPOINT_DIR / 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        
        # TensorBoard
        keras.callbacks.TensorBoard(
            log_dir='logs',
            histogram_freq=1
        )
    ]
    
    return callbacks

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
    plt.savefig(MODEL_OUTPUT / 'training_history.png')
    print(f"✅ Training history saved to {MODEL_OUTPUT / 'training_history.png'}")

def evaluate_model(model, X_test, y_test):
    """Evaluate model on test set"""
    print("\nEvaluating model on test set...")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true_classes = np.argmax(y_test, axis=1)
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(
        y_true_classes,
        y_pred_classes,
        target_names=CLASS_NAMES
    ))
    
    # Confusion matrix
    cm = confusion_matrix(y_true_classes, y_pred_classes)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    plt.colorbar()
    tick_marks = np.arange(len(CLASS_NAMES))
    plt.xticks(tick_marks, CLASS_NAMES, rotation=45)
    plt.yticks(tick_marks, CLASS_NAMES)
    
    # Add text annotations
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.tight_layout()
    plt.savefig(MODEL_OUTPUT / 'confusion_matrix.png')
    print(f"✅ Confusion matrix saved to {MODEL_OUTPUT / 'confusion_matrix.png'}")
    
    # Calculate accuracy
    test_loss, test_acc, test_precision, test_recall = model.evaluate(X_test, y_test, verbose=0)
    print(f"\n✅ Test Accuracy: {test_acc:.4f}")
    print(f"✅ Test Precision: {test_precision:.4f}")
    print(f"✅ Test Recall: {test_recall:.4f}")
    
    return {
        'accuracy': float(test_acc),
        'precision': float(test_precision),
        'recall': float(test_recall),
        'confusion_matrix': cm.tolist()
    }

def convert_to_tfjs(model):
    """Convert model to TensorFlow.js format"""
    print("\nConverting model to TensorFlow.js format...")
    
    try:
        import tensorflowjs as tfjs
        
        # Save as TensorFlow.js model
        tfjs.converters.save_keras_model(model, str(MODEL_OUTPUT))
        print(f"✅ Model converted and saved to {MODEL_OUTPUT}")
        
        # List generated files
        print("\nGenerated files:")
        for file in MODEL_OUTPUT.glob('*'):
            print(f"   - {file.name}")
        
    except ImportError:
        print("⚠️  tensorflowjs not installed. Installing...")
        os.system('pip install tensorflowjs')
        convert_to_tfjs(model)

def save_metadata(history, test_results):
    """Save model metadata"""
    metadata = {
        'model_version': '1.0.0',
        'training_date': str(np.datetime64('now')),
        'image_size': IMG_SIZE,
        'num_classes': NUM_CLASSES,
        'class_names': CLASS_NAMES,
        'epochs_trained': len(history.history['accuracy']),
        'final_train_accuracy': float(history.history['accuracy'][-1]),
        'final_val_accuracy': float(history.history['val_accuracy'][-1]),
        'test_results': test_results,
        'hyperparameters': {
            'batch_size': BATCH_SIZE,
            'learning_rate': LEARNING_RATE,
            'optimizer': 'Adam',
            'loss': 'categorical_crossentropy'
        }
    }
    
    with open(MODEL_OUTPUT / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Metadata saved to {MODEL_OUTPUT / 'metadata.json'}")

def train():
    """Main training function"""
    print("=" * 60)
    print("Certificate Forgery Detection Model Training")
    print("=" * 60)
    
    # Create directories
    create_directories()
    
    # Load dataset
    try:
        (X_train, y_train), (X_val, y_val), (X_test, y_test) = load_dataset()
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\nTo train the model, you need to add training data:")
        print(f"   1. Create folders in {TRAIN_DIR}/")
        print(f"   2. Add images to: authentic/, forged/, tampered/, screenshot/")
        print(f"   3. Minimum 100 images per category (more is better)")
        return
    
    # Create model
    model = create_model()
    
    # Create callbacks
    callbacks = create_callbacks()
    
    # Train model
    print("\n" + "=" * 60)
    print("Starting training...")
    print("=" * 60)
    
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1
    )
    
    # Plot training history
    plot_training_history(history)
    
    # Evaluate on test set
    test_results = evaluate_model(model, X_test, y_test)
    
    # Convert to TensorFlow.js
    convert_to_tfjs(model)
    
    # Save metadata
    save_metadata(history, test_results)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print(f"\nModel files saved to: {MODEL_OUTPUT}")
    print("\nNext steps:")
    print("1. Install TensorFlow.js in your React app:")
    print("   npm install @tensorflow/tfjs")
    print("2. The model is ready to use in your application!")
    print("3. Load it using: tf.loadLayersModel('/models/certificate-detector/model.json')")

if __name__ == '__main__':
    train()

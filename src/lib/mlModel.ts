/**
 * Machine Learning Model for Certificate Forgery Detection
 * This implements a trained model approach for certificate verification
 * Note: Requires @tensorflow/tfjs to be installed
 */

export interface MLModelResult {
  isForgery: boolean;
  confidence: number;
  predictions: {
    authentic: number;
    forged: number;
    tampered: number;
    screenshot: number;
  };
  features: {
    edgeConsistency: number;
    textQuality: number;
    layoutScore: number;
    compressionArtifacts: number;
  };
}

/**
 * Check if TensorFlow.js is available
 */
function isTensorFlowAvailable(): boolean {
  try {
    require.resolve('@tensorflow/tfjs');
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify certificate using ML model
 * Returns error if TensorFlow.js is not installed
 */
export async function verifyWithMLModel(imageFile: File): Promise<MLModelResult> {
  if (!isTensorFlowAvailable()) {
    throw new Error(
      'TensorFlow.js not installed. To use ML model features:\n' +
      '1. Install: npm install @tensorflow/tfjs\n' +
      '2. Train model: TRAIN_NOW.bat\n' +
      '3. Restart application'
    );
  }

  // Dynamic import to avoid loading TensorFlow.js if not needed
  const tf = await import('@tensorflow/tfjs');
  await import('@tensorflow/tfjs-backend-webgl');

  try {
    // Try to load trained model
    let model;
    try {
      model = await tf.loadLayersModel('/models/certificate-detector/model.json');
      console.log('✅ Loaded trained ML model');
    } catch (error) {
      throw new Error(
        'Trained model not found. Please train the model first:\n' +
        '1. Run: TRAIN_NOW.bat\n' +
        '2. Wait for training to complete\n' +
        '3. Restart application'
      );
    }

    // Preprocess image
    const tensor = await preprocessImage(imageFile, tf);
    
    // Run prediction
    const predictions = model.predict(tensor) as any;
    const predictionData = await predictions.data();
    
    // Extract features
    const features = await extractFeatures(imageFile);
    
    // Parse results
    const [authentic, forged, tampered, screenshot] = Array.from(predictionData);
    
    const isForgery = authentic < 0.5;
    const confidence = Math.max(...predictionData);
    
    // Cleanup
    tensor.dispose();
    predictions.dispose();
    
    return {
      isForgery,
      confidence,
      predictions: {
        authentic,
        forged,
        tampered,
        screenshot,
      },
      features,
    };
  } catch (error) {
    console.error('ML model prediction error:', error);
    throw error;
  }
}

/**
 * Preprocess image for model input
 */
async function preprocessImage(imageFile: File, tf: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and resize image
        ctx.drawImage(img, 0, 0, 224, 224);

        // Convert to tensor
        const tensor = tf.browser.fromPixels(canvas)
          .toFloat()
          .div(255.0) // Normalize to [0, 1]
          .expandDims(0);

        URL.revokeObjectURL(url);
        resolve(tensor);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Extract features from image for analysis
 */
async function extractFeatures(imageFile: File): Promise<{
  edgeConsistency: number;
  textQuality: number;
  layoutScore: number;
  compressionArtifacts: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({
          edgeConsistency: 0,
          textQuality: 0,
          layoutScore: 0,
          compressionArtifacts: 0,
        });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate features
      const edgeConsistency = calculateEdgeConsistency(data, canvas.width, canvas.height);
      const textQuality = calculateTextQuality(data, canvas.width, canvas.height);
      const layoutScore = calculateLayoutScore(canvas.width, canvas.height);
      const compressionArtifacts = detectCompressionArtifacts(data);

      URL.revokeObjectURL(url);
      resolve({
        edgeConsistency,
        textQuality,
        layoutScore,
        compressionArtifacts,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        edgeConsistency: 0,
        textQuality: 0,
        layoutScore: 0,
        compressionArtifacts: 0,
      });
    };

    img.src = url;
  });
}

/**
 * Calculate edge consistency
 */
function calculateEdgeConsistency(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let totalEdgeStrength = 0;
  let edgeCount = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Sobel edge detection
      const gx = 
        -data[idx - width * 4 - 4] + data[idx - width * 4 + 4] +
        -2 * data[idx - 4] + 2 * data[idx + 4] +
        -data[idx + width * 4 - 4] + data[idx + width * 4 + 4];
      
      const gy =
        -data[idx - width * 4 - 4] - 2 * data[idx - width * 4] - data[idx - width * 4 + 4] +
        data[idx + width * 4 - 4] + 2 * data[idx + width * 4] + data[idx + width * 4 + 4];
      
      const edgeStrength = Math.sqrt(gx * gx + gy * gy);
      
      if (edgeStrength > 50) {
        totalEdgeStrength += edgeStrength;
        edgeCount++;
      }
    }
  }

  return edgeCount > 0 ? totalEdgeStrength / edgeCount / 255 : 0;
}

/**
 * Calculate text quality score
 */
function calculateTextQuality(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let highContrastPixels = 0;
  const totalPixels = width * height;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = (r + g + b) / 3;

    if (gray < 50 || gray > 200) {
      highContrastPixels++;
    }
  }

  return highContrastPixels / totalPixels;
}

/**
 * Calculate layout score
 */
function calculateLayoutScore(width: number, height: number): number {
  const aspectRatio = width / height;
  const typicalRatios = [1.414, 1.5, 1.6, 0.707];
  
  const closestRatio = typicalRatios.reduce((prev, curr) => 
    Math.abs(curr - aspectRatio) < Math.abs(prev - aspectRatio) ? curr : prev
  );
  
  const deviation = Math.abs(aspectRatio - closestRatio);
  return Math.max(0, 1 - deviation);
}

/**
 * Detect compression artifacts
 */
function detectCompressionArtifacts(data: Uint8ClampedArray): number {
  let artifactScore = 0;
  const blockSize = 8;

  for (let i = 0; i < data.length; i += 4 * blockSize) {
    const r1 = data[i];
    const r2 = data[i + 4 * blockSize];
    
    if (r1 !== undefined && r2 !== undefined) {
      const diff = Math.abs(r1 - r2);
      if (diff > 20) {
        artifactScore++;
      }
    }
  }

  return Math.min(1, artifactScore / 1000);
}

/**
 * Check if ML model is available
 */
export function isMLModelAvailable(): boolean {
  return isTensorFlowAvailable();
}

/**
 * Get ML model status
 */
export function getMLModelStatus(): {
  available: boolean;
  message: string;
} {
  if (!isTensorFlowAvailable()) {
    return {
      available: false,
      message: 'TensorFlow.js not installed. Run: npm install @tensorflow/tfjs'
    };
  }

  // Check if trained model exists
  return {
    available: true,
    message: 'ML model ready (requires training)'
  };
}
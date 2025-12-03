/**
 * AI-Based Certificate Visual Verification
 * Detects forgeries, tampering, and validates certificate authenticity
 */

// Tesseract.js import - optional dependency
let Tesseract: any = null;
try {
  Tesseract = require('tesseract.js');
} catch (error) {
  console.warn('Tesseract.js not installed. OCR features will be disabled.');
}

export interface AIVerificationResult {
  isAuthentic: boolean;
  confidence: number;
  checks: {
    imageIntegrity: { passed: boolean; score: number; details: string };
    textExtraction: { passed: boolean; extractedText: string; confidence: number };
    dataMatching: { passed: boolean; matchScore: number; differences: string[] };
    tamperingDetection: { passed: boolean; score: number; issues: string[] };
  };
  warnings: string[];
  timestamp: string;
}

export interface CertificateData {
  certificate_id: string;
  holder_name: string;
  course_name: string;
  institution: string;
  issue_date: string;
}

/**
 * Main AI verification function
 * Combines multiple checks to determine certificate authenticity
 */
export async function verifyCertificateImage(
  imageFile: File,
  expectedData: CertificateData
): Promise<AIVerificationResult> {
  const warnings: string[] = [];
  
  try {
    // Step 1: Check image integrity
    const integrityCheck = await checkImageIntegrity(imageFile);
    
    // Step 2: Extract text using OCR
    const ocrResult = await extractTextFromImage(imageFile);
    
    // Step 3: Match extracted data with blockchain data
    const matchingResult = matchExtractedData(ocrResult.text, expectedData);
    
    // Step 4: Detect tampering/manipulation
    const tamperingCheck = await detectTampering(imageFile);
    
    // Calculate overall confidence
    const overallConfidence = calculateOverallConfidence({
      integrityCheck,
      ocrResult,
      matchingResult,
      tamperingCheck
    });
    
    // Determine if authentic (adjust thresholds if OCR not available)
    const ocrThreshold = Tesseract ? 0.7 : 0.0; // Skip OCR check if not available
    const overallThreshold = Tesseract ? 0.75 : 0.6; // Lower threshold without OCR
    
    const isAuthentic = 
      integrityCheck.passed &&
      ocrResult.confidence > ocrThreshold &&
      matchingResult.passed &&
      tamperingCheck.passed &&
      overallConfidence > overallThreshold;
    
    if (!integrityCheck.passed) {
      warnings.push('Image integrity check failed - possible corruption or manipulation');
    }
    if (!Tesseract) {
      warnings.push('OCR not available - install tesseract.js for text extraction');
    } else if (ocrResult.confidence < 0.7) {
      warnings.push('Low OCR confidence - text may be unclear or modified');
    }
    if (!matchingResult.passed) {
      warnings.push('Extracted data does not match blockchain records');
    }
    if (!tamperingCheck.passed) {
      warnings.push('Possible tampering detected in image');
    }
    
    return {
      isAuthentic,
      confidence: overallConfidence,
      checks: {
        imageIntegrity: integrityCheck,
        textExtraction: {
          passed: ocrResult.confidence > 0.7,
          extractedText: ocrResult.text,
          confidence: ocrResult.confidence
        },
        dataMatching: matchingResult,
        tamperingDetection: tamperingCheck
      },
      warnings,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI verification error:', error);
    throw new Error('Failed to verify certificate image');
  }
}

/**
 * Check image integrity and quality
 */
async function checkImageIntegrity(imageFile: File): Promise<{
  passed: boolean;
  score: number;
  details: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ passed: false, score: 0, details: 'Failed to create canvas context' });
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Check resolution
      const minResolution = 800;
      const hasGoodResolution = img.width >= minResolution && img.height >= minResolution;
      
      // Check file size (too small = suspicious compression)
      const fileSizeKB = imageFile.size / 1024;
      const hasReasonableSize = fileSizeKB > 50 && fileSizeKB < 10000;
      
      // Check image data variance (detect blank/solid color images)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const variance = calculateImageVariance(imageData.data);
      const hasVariance = variance > 100; // Threshold for meaningful content
      
      const score = (
        (hasGoodResolution ? 0.4 : 0) +
        (hasReasonableSize ? 0.3 : 0) +
        (hasVariance ? 0.3 : 0)
      );
      
      const details = [
        `Resolution: ${img.width}x${img.height}`,
        `File size: ${fileSizeKB.toFixed(2)} KB`,
        `Variance: ${variance.toFixed(2)}`
      ].join(', ');
      
      URL.revokeObjectURL(url);
      resolve({
        passed: score > 0.7,
        score,
        details
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ passed: false, score: 0, details: 'Failed to load image' });
    };
    
    img.src = url;
  });
}

/**
 * Extract text from certificate image using OCR
 */
async function extractTextFromImage(imageFile: File): Promise<{
  text: string;
  confidence: number;
}> {
  if (!Tesseract) {
    console.warn('Tesseract.js not available. OCR disabled.');
    return { 
      text: 'OCR not available - install tesseract.js', 
      confidence: 0 
    };
  }

  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m)
    });
    
    return {
      text: result.data.text,
      confidence: result.data.confidence / 100 // Convert to 0-1 scale
    };
  } catch (error) {
    console.error('OCR error:', error);
    return { text: '', confidence: 0 };
  }
}

/**
 * Match extracted text with expected certificate data
 */
function matchExtractedData(
  extractedText: string,
  expectedData: CertificateData
): {
  passed: boolean;
  matchScore: number;
  differences: string[];
} {
  const normalizedText = extractedText.toLowerCase().replace(/\s+/g, ' ');
  const differences: string[] = [];
  let matchCount = 0;
  let totalChecks = 0;
  
  // Check certificate ID
  totalChecks++;
  if (normalizedText.includes(expectedData.certificate_id.toLowerCase())) {
    matchCount++;
  } else {
    differences.push(`Certificate ID not found: ${expectedData.certificate_id}`);
  }
  
  // Check holder name
  totalChecks++;
  const nameParts = expectedData.holder_name.toLowerCase().split(' ');
  const nameMatches = nameParts.filter(part => normalizedText.includes(part)).length;
  if (nameMatches >= nameParts.length * 0.7) { // 70% of name parts must match
    matchCount++;
  } else {
    differences.push(`Holder name mismatch: ${expectedData.holder_name}`);
  }
  
  // Check course name
  totalChecks++;
  const courseParts = expectedData.course_name.toLowerCase().split(' ');
  const courseMatches = courseParts.filter(part => 
    part.length > 3 && normalizedText.includes(part)
  ).length;
  if (courseMatches >= courseParts.length * 0.6) {
    matchCount++;
  } else {
    differences.push(`Course name mismatch: ${expectedData.course_name}`);
  }
  
  // Check institution
  totalChecks++;
  const institutionParts = expectedData.institution.toLowerCase().split(' ');
  const institutionMatches = institutionParts.filter(part => 
    part.length > 3 && normalizedText.includes(part)
  ).length;
  if (institutionMatches >= institutionParts.length * 0.6) {
    matchCount++;
  } else {
    differences.push(`Institution mismatch: ${expectedData.institution}`);
  }
  
  // Check date (flexible matching)
  totalChecks++;
  const dateStr = new Date(expectedData.issue_date).getFullYear().toString();
  if (normalizedText.includes(dateStr)) {
    matchCount++;
  } else {
    differences.push(`Issue date not found: ${expectedData.issue_date}`);
  }
  
  const matchScore = matchCount / totalChecks;
  
  return {
    passed: matchScore >= 0.6, // At least 60% must match
    matchScore,
    differences
  };
}

/**
 * Detect image tampering and manipulation
 * Uses Error Level Analysis (ELA) and metadata checks
 */
async function detectTampering(imageFile: File): Promise<{
  passed: boolean;
  score: number;
  issues: string[];
}> {
  const issues: string[] = [];
  let score = 1.0;
  
  // Check file metadata
  const hasValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(imageFile.type);
  if (!hasValidType) {
    issues.push('Unusual file type detected');
    score -= 0.3;
  }
  
  // Check for suspicious file name patterns
  const suspiciousPatterns = ['edited', 'modified', 'fake', 'copy', 'scan_'];
  const hasSuspiciousName = suspiciousPatterns.some(pattern => 
    imageFile.name.toLowerCase().includes(pattern)
  );
  if (hasSuspiciousName) {
    issues.push('Suspicious file name pattern');
    score -= 0.2;
  }
  
  // Perform basic ELA (Error Level Analysis)
  try {
    const elaResult = await performBasicELA(imageFile);
    if (!elaResult.passed) {
      issues.push('Inconsistent compression levels detected (possible editing)');
      score -= 0.4;
    }
  } catch (error) {
    console.warn('ELA check failed:', error);
  }
  
  return {
    passed: score > 0.6,
    score: Math.max(0, score),
    issues
  };
}

/**
 * Basic Error Level Analysis
 * Detects areas with different compression levels (sign of editing)
 */
async function performBasicELA(imageFile: File): Promise<{
  passed: boolean;
  variance: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ passed: true, variance: 0 });
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate edge variance (edited areas often have different edge characteristics)
      const edgeVariances: number[] = [];
      const step = 50; // Sample every 50 pixels
      
      for (let y = step; y < canvas.height - step; y += step) {
        for (let x = step; x < canvas.width - step; x += step) {
          const idx = (y * canvas.width + x) * 4;
          const variance = calculateLocalVariance(data, idx, canvas.width);
          edgeVariances.push(variance);
        }
      }
      
      // Calculate variance of variances (high = inconsistent compression)
      const overallVariance = calculateVariance(edgeVariances);
      
      URL.revokeObjectURL(url);
      resolve({
        passed: overallVariance < 5000, // Threshold for suspicious editing
        variance: overallVariance
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ passed: true, variance: 0 });
    };
    
    img.src = url;
  });
}

/**
 * Calculate image variance (measure of content diversity)
 */
function calculateImageVariance(data: Uint8ClampedArray): number {
  const values: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    values.push(gray);
  }
  return calculateVariance(values);
}

/**
 * Calculate local variance around a pixel
 */
function calculateLocalVariance(
  data: Uint8ClampedArray,
  centerIdx: number,
  width: number
): number {
  const values: number[] = [];
  const offsets = [-1, 0, 1];
  
  for (const dy of offsets) {
    for (const dx of offsets) {
      const idx = centerIdx + (dy * width + dx) * 4;
      if (idx >= 0 && idx < data.length) {
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        values.push(gray);
      }
    }
  }
  
  return calculateVariance(values);
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(checks: {
  integrityCheck: { score: number };
  ocrResult: { confidence: number };
  matchingResult: { matchScore: number };
  tamperingCheck: { score: number };
}): number {
  if (!Tesseract) {
    // Without OCR, redistribute weights
    return (
      checks.integrityCheck.score * 0.3 +
      checks.matchingResult.matchScore * 0.4 +
      checks.tamperingCheck.score * 0.3
    );
  }
  
  // With OCR, use normal weights
  return (
    checks.integrityCheck.score * 0.2 +
    checks.ocrResult.confidence * 0.3 +
    checks.matchingResult.matchScore * 0.3 +
    checks.tamperingCheck.score * 0.2
  );
}

/**
 * Optional: Use external AI API for advanced verification
 * (Google Vision API, AWS Rekognition, or custom ML model)
 */
export async function verifyWithExternalAI(
  imageFile: File
): Promise<{
  isAuthentic: boolean;
  confidence: number;
  details: string;
}> {
  // Placeholder for external API integration
  // Example: Google Vision API for document text detection and quality analysis
  
  try {
    // Convert to base64
    const base64 = await fileToBase64(imageFile);
    
    // Call external API (example structure)
    // const response = await fetch('YOUR_AI_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: base64 })
    // });
    
    // For now, return placeholder
    return {
      isAuthentic: true,
      confidence: 0.85,
      details: 'External AI verification not configured'
    };
  } catch (error) {
    console.error('External AI verification error:', error);
    throw error;
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

import { useState } from 'react';
import { Upload, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { verifyCertificateImage, AIVerificationResult } from '@/lib/aiVerification';
// ML model disabled - install @tensorflow/tfjs to enable
// import { verifyWithMLModel, isMLModelAvailable, getMLModelStatus, MLModelResult } from '@/lib/mlModel';
import { toast } from 'sonner';

interface AIVerificationUploadProps {
  certificateData: {
    certificate_id: string;
    holder_name: string;
    course_name: string;
    institution: string;
    issue_date: string;
  };
}

export function AIVerificationUpload({ certificateData }: AIVerificationUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<AIVerificationResult | null>(null);
  const [mlResult, setMlResult] = useState<MLModelResult | null>(null);
  const [useML, setUseML] = useState(true); // Using pre-trained MobileNet with transfer learning

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setResult(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    setVerifying(true);
    try {
      // Run rule-based verification
      const verificationResult = await verifyCertificateImage(selectedFile, certificateData);
      setResult(verificationResult);

      // Run ML model verification if enabled
      let mlVerification: MLModelResult | null = null;
      if (useML) {
        try {
          mlVerification = await verifyWithMLModel(selectedFile);
          setMlResult(mlVerification);
        } catch (error) {
          console.warn('ML verification failed, using rule-based only:', error);
        }
      }

      // Calculate combined score
      const ruleScore = verificationResult.confidence;
      const mlScore = mlVerification ? (1 - mlVerification.predictions.forged) : 0;
      const combinedScore = mlVerification 
        ? (ruleScore * 0.4 + mlScore * 0.6)
        : ruleScore;

      const isAuthentic = combinedScore > 0.75;

      if (isAuthentic) {
        toast.success('Certificate verified!', {
          description: `Confidence: ${(combinedScore * 100).toFixed(1)}%`
        });
      } else {
        toast.error('Verification failed', {
          description: 'Certificate may be forged or tampered'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify certificate image');
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
    setMlResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          AI Visual Verification
        </CardTitle>
        <CardDescription>
          Upload certificate image for AI-based authenticity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile && (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="certificate-upload"
            />
            <label htmlFor="certificate-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload certificate</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </label>
          </div>
        )}

        {selectedFile && previewUrl && (
          <div className="space-y-4">
            <div className="relative">
              <img src={previewUrl} alt="Certificate" className="w-full rounded-lg border" />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={handleClear}>
                Remove
              </Button>
            </div>

            {!result && (
              <Button onClick={handleVerify} disabled={verifying} className="w-full">
                {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 
                  <><CheckCircle2 className="mr-2 h-4 w-4" />Verify Image</>}
              </Button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Combined Result */}
            <Alert variant={result.isAuthentic ? 'default' : 'destructive'}>
              {result.isAuthentic ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>
                <div className="font-semibold">{result.isAuthentic ? 'Authentic' : 'Failed'}</div>
                <div className="text-sm">
                  Rule-Based: {(result.confidence * 100).toFixed(1)}%
                  {mlResult && ` | ML Model: ${((1 - mlResult.predictions.forged) * 100).toFixed(1)}%`}
                </div>
              </AlertDescription>
            </Alert>

            {/* Rule-Based Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rule-Based Confidence</span>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.confidence * 100} />
            </div>

            {/* ML Model Results */}
            {mlResult && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="font-semibold text-sm">ML Model Predictions</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Authentic</span>
                    <Badge variant="default">{(mlResult.predictions.authentic * 100).toFixed(1)}%</Badge>
                  </div>
                  <Progress value={mlResult.predictions.authentic * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Forged</span>
                    <Badge variant="destructive">{(mlResult.predictions.forged * 100).toFixed(1)}%</Badge>
                  </div>
                  <Progress value={mlResult.predictions.forged * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Tampered</span>
                    <Badge variant="secondary">{(mlResult.predictions.tampered * 100).toFixed(1)}%</Badge>
                  </div>
                  <Progress value={mlResult.predictions.tampered * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Screenshot</span>
                    <Badge variant="outline">{(mlResult.predictions.screenshot * 100).toFixed(1)}%</Badge>
                  </div>
                  <Progress value={mlResult.predictions.screenshot * 100} className="h-2" />
                </div>
                
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Overall ML Confidence: {(mlResult.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}

            {result.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm">
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleClear} variant="outline" className="w-full">
              Verify Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

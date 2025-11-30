import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, Smartphone } from "lucide-react";
import { toast } from "sonner";

const ScanCertificate = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        setCameras(devices);
      }
    }).catch((err) => {
      console.error("Error getting cameras:", err);
      toast.error("Unable to access camera");
    });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          toast.success("Certificate scanned!");
          stopScanning();
          
          // Extract certificate ID from scanned data
          // Assuming QR contains certificate_id or full URL
          let certId = decodedText;
          
          // If it's a URL, extract the ID
          if (decodedText.includes("/verify/")) {
            certId = decodedText.split("/verify/")[1];
          }
          
          navigate(`/verify/${certId}`);
        },
        (errorMessage) => {
          // Scanning failed, but keep trying
          console.log("Scan error:", errorMessage);
        }
      );

      setIsScanning(true);
      toast.info("Point camera at QR code");
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Failed to start camera");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Scan Certificate</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isScanning ? (
              <div className="space-y-4">
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-6 rounded-full bg-accent/10">
                      <Smartphone className="h-16 w-16 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scan QR Code to Verify</h3>
                    <p className="text-muted-foreground">
                      Position the QR code within the frame to verify the certificate authenticity
                    </p>
                  </div>
                </div>

                {cameras.length > 0 ? (
                  <Button
                    onClick={startScanning}
                    className="w-full"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>No camera detected or camera access denied</p>
                    <p className="text-sm mt-2">Please check your browser permissions</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  id="qr-reader" 
                  className="w-full rounded-lg overflow-hidden border-2 border-accent"
                ></div>
                
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="mr-2 h-5 w-5" />
                  Stop Scanning
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Align the QR code within the highlighted area
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ScanCertificate;


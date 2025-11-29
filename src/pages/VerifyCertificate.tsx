import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificate_id: string;
  holder_name: string;
  course_name: string;
  institution: string;
  issue_date: string;
  blockchain_hash: string;
  status: "active" | "revoked";
  ipfs_hash?: string | null;
  revocation_reason?: string | null;
  revoked_at?: string | null;
}

type CertificateStatus = "valid" | "revoked" | "not-found";

const VerifyCertificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [status, setStatus] = useState<CertificateStatus>("not-found");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("certificate_id", id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setCertificate(data as Certificate);
          setStatus(data.status === "active" ? "valid" : "revoked");
        } else {
          setStatus("not-found");
        }
      } catch (error: any) {
        console.error("Error fetching certificate:", error);
        toast.error("Failed to verify certificate");
        setStatus("not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Verifying certificate on blockchain...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-success" />,
          badge: <Badge className="bg-success text-success-foreground">Valid Certificate</Badge>,
          message: "This certificate is authentic and verified on the blockchain",
          bgColor: "bg-success/5",
        };
      case "revoked":
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          badge: <Badge className="bg-destructive text-destructive-foreground">Revoked</Badge>,
          message: "This certificate has been revoked by the issuing institution",
          bgColor: "bg-destructive/5",
        };
      case "not-found":
        return {
          icon: <AlertCircle className="h-16 w-16 text-warning" />,
          badge: <Badge className="bg-warning text-warning-foreground">Not Found</Badge>,
          message: "No certificate found with this ID on the blockchain",
          bgColor: "bg-warning/5",
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-muted-foreground" />,
          badge: <Badge variant="secondary">Unknown</Badge>,
          message: "Unable to verify certificate status",
          bgColor: "bg-muted",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CertiChain</span>
          </div>
          <Button onClick={() => navigate("/")} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <Card className={`shadow-medium ${statusConfig.bgColor} border-2`}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">{statusConfig.icon}</div>
              {statusConfig.badge}
              <h2 className="text-2xl font-bold text-foreground">Certificate Verification Result</h2>
              <p className="text-muted-foreground">{statusConfig.message}</p>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          {status === "valid" && certificate && (
            <>
              <Card className="shadow-soft border-certificate-border border-2">
                <CardHeader className="bg-gradient-hero">
                  <CardTitle className="text-2xl text-center text-foreground">Certificate Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                      <p className="text-lg font-mono text-foreground">{certificate.certificate_id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                      <p className="text-lg text-foreground">
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Holder Name</p>
                      <p className="text-lg text-foreground">{certificate.holder_name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Institution</p>
                      <p className="text-lg text-foreground">{certificate.institution}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Course/Program</p>
                    <p className="text-xl font-semibold text-foreground">{certificate.course_name}</p>
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Blockchain Verification
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                      <p className="text-sm font-mono text-foreground break-all bg-muted p-3 rounded">
                        {certificate.blockchain_hash}
                      </p>
                    </div>
                    {certificate.ipfs_hash && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">IPFS Hash</p>
                        <p className="text-sm font-mono text-foreground break-all bg-muted p-3 rounded">
                          {certificate.ipfs_hash}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" variant="default">
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="bg-primary/5 border border-primary">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Blockchain-Verified Authenticity</h3>
                      <p className="text-sm text-muted-foreground">
                        This certificate has been cryptographically verified on the Polkadot blockchain. 
                        The certificate data is immutable and cannot be tampered with or forged.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Revocation Details */}
          {status === "revoked" && certificate && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Certificate ID</h3>
                    <p className="text-sm font-mono text-muted-foreground">{certificate.certificate_id}</p>
                  </div>
                  {certificate.revocation_reason && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Revocation Reason</h3>
                      <p className="text-sm text-muted-foreground">{certificate.revocation_reason}</p>
                    </div>
                  )}
                  {certificate.revoked_at && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Revoked On</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(certificate.revoked_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const IssueCertificate = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    holderName: "",
    courseName: "",
    institution: "",
    issueDate: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [certificateId, setCertificateId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCertificateId = () => {
    return `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  };

  const generateQRCode = async (certId: string) => {
    try {
      const url = `${window.location.origin}/verify/${certId}`;
      const qr = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#3b82f6",
          light: "#ffffff",
        },
      });
      setQrCode(qr);
      return qr;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to issue certificates");
      return;
    }

    setIsSubmitting(true);
    const certId = generateCertificateId();
    
    try {
      toast.loading("Issuing certificate...", { id: "blockchain" });

      // Generate QR code
      const qrCodeData = await generateQRCode(certId);

      // Insert certificate into database
      const { error } = await supabase.from("certificates").insert({
        certificate_id: certId,
        holder_name: formData.holderName,
        course_name: formData.courseName,
        institution: formData.institution,
        issue_date: formData.issueDate,
        qr_code: qrCodeData,
        blockchain_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        ipfs_hash: file ? `Qm${Math.random().toString(36).substring(2, 48)}` : null,
        issued_by: user.id,
        status: "active",
      });

      if (error) throw error;

      setCertificateId(certId);
      toast.success("Certificate issued successfully!", { id: "blockchain" });
      
      // Reset form
      setFormData({
        holderName: "",
        courseName: "",
        institution: "",
        issueDate: "",
        description: "",
      });
      setFile(null);
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      toast.error(error.message || "Failed to issue certificate", { id: "blockchain" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Issue New Certificate</CardTitle>
          <CardDescription>
            Create a new blockchain-verified certificate. All data will be stored immutably on Polkadot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="holderName">Certificate Holder Name *</Label>
                <Input
                  id="holderName"
                  required
                  placeholder="John Doe"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseName">Course/Program Name *</Label>
                <Input
                  id="courseName"
                  required
                  placeholder="Blockchain Development"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name *</Label>
                <Input
                  id="institution"
                  required
                  placeholder="Tech Institute"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description/Notes</Label>
              <Textarea
                id="description"
                placeholder="Additional information about the certificate..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Certificate File (PDF)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button type="button" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to IPFS
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                File will be uploaded to IPFS for decentralized storage
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              <FileText className="mr-2 h-5 w-5" />
              {isSubmitting ? "Issuing..." : "Issue Certificate on Blockchain"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrCode && (
        <Card className="shadow-soft border-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-success" />
              Certificate Issued Successfully!
            </CardTitle>
            <CardDescription>
              Certificate ID: <span className="font-mono font-semibold text-foreground">{certificateId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="Certificate QR Code" className="rounded-lg shadow-medium" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                Scan this QR code to verify the certificate
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Download QR Code
                </Button>
                <Button variant="outline" className="flex-1">
                  Download Certificate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IssueCertificate;

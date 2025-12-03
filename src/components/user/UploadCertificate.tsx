import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePolkadot } from "@/hooks/usePolkadot";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const UploadCertificate = () => {
  const { user } = useAuth();
  const { selectedAccount, storeCertificate, isConnected, balance } = usePolkadot();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    holder_name: "",
    course_name: "",
    institution: "",
    issue_date: new Date().toISOString().split('T')[0],
    additional_info: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only images (JPG, PNG, WEBP) and PDF files are allowed");
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submit clicked - checking conditions...");
    console.log("User:", user);
    console.log("Selected Account:", selectedAccount);
    console.log("Is Connected:", isConnected);
    
    if (!user) {
      toast.error("Please login to upload certificates");
      return;
    }

    if (!selectedAccount) {
      toast.error("Please connect your Polkadot wallet first");
      return;
    }

    setLoading(true);

    try {
      // Generate unique certificate ID using timestamp and random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const certificate_id = `CERT-${timestamp}-${randomStr}`;

      // Upload certificate file if provided
      let ipfsHash = null;
      if (certificateFile) {
        try {
          toast.info("Uploading certificate file...");
          
          const fileExt = certificateFile.name.split('.').pop();
          const fileName = `${certificate_id}.${fileExt}`;
          const filePath = `certificates/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('certificates')
            .upload(filePath, certificateFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error("File upload error:", uploadError);
            toast.warning("Certificate saved without file (storage not configured)");
            // Continue without file - don't throw error
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('certificates')
              .getPublicUrl(filePath);
            
            ipfsHash = urlData.publicUrl;
          }
        } catch (err) {
          console.error("File upload error:", err);
          toast.warning("Certificate will be saved without file");
          // Continue without file
        }
      }

      // Store on blockchain
      toast.info("Storing certificate on blockchain...");
      const blockchainResult = await storeCertificate({
        certificate_id: certificate_id,
        holder_name: formData.holder_name,
        course_name: formData.course_name,
        institution: formData.institution,
        issue_date: formData.issue_date,
      });

      if (!blockchainResult) {
        throw new Error("Failed to store on blockchain");
      }

      // Generate QR code data
      const qrData = JSON.stringify({
        certificate_id: certificate_id,
        holder_name: formData.holder_name,
        verify_url: `${window.location.origin}/verify/${certificate_id}`,
      });

      // Store in database
      const { error: dbError } = await supabase.from("certificates").insert({
        certificate_id: certificate_id,
        holder_name: formData.holder_name,
        course_name: formData.course_name,
        institution: formData.institution,
        issue_date: formData.issue_date,
        blockchain_hash: blockchainResult.blockHash,
        qr_code: qrData,
        status: "active",
        issued_by: user.id,
        ipfs_hash: ipfsHash,
      });

      if (dbError) throw dbError;

      toast.success(`Certificate uploaded successfully! ID: ${certificate_id}`, {
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        holder_name: "",
        course_name: "",
        institution: "",
        issue_date: new Date().toISOString().split('T')[0],
        additional_info: "",
      });
      setCertificateFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('certificate_file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || "Failed to upload certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Certificate
        </CardTitle>
        <CardDescription>
          Upload any certificate and store it permanently on the blockchain. Certificate ID will be auto-generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedAccount && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Wallet Balance:</span>
              <span className="font-medium">{balance} WND</span>
            </div>
            {parseFloat(balance) < 0.01 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Low balance! Get free testnet tokens at{' '}
                <a 
                  href="https://faucet.polkadot.io/westend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-700"
                >
                  faucet.polkadot.io/westend
                </a>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="holder_name">Certificate Holder Name *</Label>
              <Input
                id="holder_name"
                name="holder_name"
                placeholder="e.g., John Doe"
                value={formData.holder_name}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">Person receiving this certificate</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_name">Certificate Title/Achievement *</Label>
              <Input
                id="course_name"
                name="course_name"
                placeholder="e.g., Web Development Bootcamp"
                value={formData.course_name}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">Course, skill, or achievement name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Issuing Organization (Optional)</Label>
              <Input
                id="institution"
                name="institution"
                placeholder="e.g., Tech Academy, Self-Issued"
                value={formData.institution}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Who issued this certificate</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">When was this certificate issued</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_info">Additional Details (Optional)</Label>
            <Textarea
              id="additional_info"
              name="additional_info"
              placeholder="Add any extra information: grade, skills learned, project details, etc."
              value={formData.additional_info}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate_file">Upload Certificate File (Optional)</Label>
            <Input
              id="certificate_file"
              name="certificate_file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Upload image (JPG, PNG, WEBP) or PDF • Max 5MB
              {certificateFile && (
                <span className="text-primary font-medium ml-2">
                  ✓ {certificateFile.name} ({(certificateFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to Blockchain...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Upload Certificate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadCertificate;

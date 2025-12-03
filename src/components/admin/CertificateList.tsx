import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Eye, Ban, Download, CheckCircle, Shield, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificate_id: string;
  holder_name: string;
  course_name: string;
  issue_date: string;
  status: string;
}

const CertificateList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!selectedCertificate || !revocationReason.trim()) {
      toast.error("Please provide a revocation reason");
      return;
    }

    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revocation_reason: revocationReason,
        })
        .eq("id", selectedCertificate.id);

      if (error) throw error;

      toast.success("Certificate revoked successfully");
      setRevokeDialogOpen(false);
      setRevocationReason("");
      setSelectedCertificate(null);
      fetchCertificates();
    } catch (error: any) {
      console.error("Error revoking certificate:", error);
      toast.error("Failed to revoke certificate");
    }
  };

  const handleReactivateCertificate = async (certId: string) => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          status: "active",
          revoked_at: null,
          revocation_reason: null,
        })
        .eq("id", certId);

      if (error) throw error;

      toast.success("Certificate reactivated successfully");
      fetchCertificates();
    } catch (error: any) {
      console.error("Error reactivating certificate:", error);
      toast.error("Failed to reactivate certificate");
    }
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setViewDialogOpen(true);
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    try {
      // Create HTML certificate
      const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${cert.certificate_id}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 40px;
      border: 10px double #2563eb;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .certificate {
      background: white;
      padding: 60px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 48px;
      color: #2563eb;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .subtitle {
      font-size: 24px;
      color: #64748b;
      margin-bottom: 40px;
    }
    .content {
      margin: 40px 0;
      line-height: 2;
    }
    .name {
      font-size: 36px;
      font-weight: bold;
      color: #1e293b;
      margin: 20px 0;
      border-bottom: 2px solid #2563eb;
      display: inline-block;
      padding-bottom: 10px;
    }
    .course {
      font-size: 28px;
      color: #2563eb;
      margin: 20px 0;
      font-style: italic;
    }
    .details {
      margin-top: 40px;
      font-size: 14px;
      color: #64748b;
    }
    .blockchain {
      margin-top: 30px;
      padding: 20px;
      background: #f1f5f9;
      border-left: 4px solid #2563eb;
    }
    .status {
      display: inline-block;
      padding: 8px 20px;
      background: ${cert.status === 'active' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>🎓 Certificate of Completion</h1>
    <div class="subtitle">This is to certify that</div>
    
    <div class="content">
      <div class="name">${cert.holder_name}</div>
      <p>has successfully completed</p>
      <div class="course">${cert.course_name}</div>
    </div>
    
    <div class="details">
      <p><strong>Certificate ID:</strong> ${cert.certificate_id}</p>
      <p><strong>Issue Date:</strong> ${new Date(cert.issue_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <div class="status">${cert.status.toUpperCase()}</div>
    </div>
    
    <div class="blockchain">
      <p><strong>🔒 Blockchain Verified</strong></p>
      <p style="font-size: 12px; word-break: break-all;">
        This certificate has been verified on the Polkadot blockchain.<br>
        Verify at: ${window.location.origin}/verify/${cert.certificate_id}
      </p>
    </div>
  </div>
</body>
</html>
      `.trim();

      // Create blob and download
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${cert.certificate_id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Certificate downloaded! Open the HTML file in your browser.");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading certificates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Manage Certificates</CardTitle>
        <div className="flex items-center gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Holder Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No certificates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">{cert.certificate_id}</TableCell>
                    <TableCell>{cert.holder_name}</TableCell>
                    <TableCell>{cert.course_name}</TableCell>
                    <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          cert.status === "active"
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="View Details"
                          onClick={() => handleViewCertificate(cert)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Download"
                          onClick={() => handleDownloadCertificate(cert)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {cert.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Revoke Certificate"
                            onClick={() => {
                              setSelectedCertificate(cert);
                              setRevokeDialogOpen(true);
                            }}
                          >
                            <Ban className="h-4 w-4 text-destructive" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Reactivate Certificate"
                            onClick={() => handleReactivateCertificate(cert.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      </Card>

      {/* View Certificate Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Certificate Details
            </DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Certificate ID</Label>
                  <p className="font-mono text-sm">{selectedCertificate.certificate_id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    className={
                      selectedCertificate.status === "active"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {selectedCertificate.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Holder Name</Label>
                  <p className="font-semibold">{selectedCertificate.holder_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p>{new Date(selectedCertificate.issue_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">Course Name</Label>
                  <p className="font-semibold">{selectedCertificate.course_name}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/verify/${selectedCertificate?.certificate_id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
            <Button
              onClick={() => {
                if (selectedCertificate) {
                  handleDownloadCertificate(selectedCertificate);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Certificate Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              You are about to revoke certificate {selectedCertificate?.certificate_id}. This action
              will mark the certificate as invalid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Revocation Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for revoking this certificate..."
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeCertificate}>
              Revoke Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificateList;

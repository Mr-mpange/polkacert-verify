import { useState, useEffect } from "react";
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
import { Search, Eye, Ban, Download, CheckCircle } from "lucide-react";
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
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState("");

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
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
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

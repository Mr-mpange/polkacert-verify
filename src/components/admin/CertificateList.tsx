import { useState } from "react";
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
import { Search, Eye, Ban, Download } from "lucide-react";

interface Certificate {
  id: string;
  holderName: string;
  courseName: string;
  issueDate: string;
  status: "valid" | "revoked";
}

const mockCertificates: Certificate[] = [
  {
    id: "CERT-2024-001",
    holderName: "John Doe",
    courseName: "Blockchain Development",
    issueDate: "2024-01-15",
    status: "valid",
  },
  {
    id: "CERT-2024-002",
    holderName: "Jane Smith",
    courseName: "Web3 Security",
    issueDate: "2024-01-20",
    status: "valid",
  },
  {
    id: "CERT-2024-003",
    holderName: "Mike Johnson",
    courseName: "Smart Contract Development",
    issueDate: "2024-02-01",
    status: "revoked",
  },
];

const CertificateList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates] = useState<Certificate[]>(mockCertificates);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-sm">{cert.id}</TableCell>
                  <TableCell>{cert.holderName}</TableCell>
                  <TableCell>{cert.courseName}</TableCell>
                  <TableCell>{cert.issueDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        cert.status === "valid"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {cert.status === "valid" && (
                        <Button variant="ghost" size="sm">
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateList;

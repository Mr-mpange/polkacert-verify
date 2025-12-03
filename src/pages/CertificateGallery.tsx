import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Award, 
  Search, 
  Filter,
  Calendar,
  Building2,
  User,
  Shield,
  Eye,
  QrCode,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Certificate {
  id: string;
  certificate_id: string;
  holder_name: string;
  course_name: string;
  institution: string;
  issue_date: string;
  status: string;
  created_at: string;
  total_verifications?: number;
  last_verified_at?: string;
}

const CertificateGallery = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalInstitutions: 0,
    totalVerifications: 0
  });

  useEffect(() => {
    checkAuth();
    fetchCertificates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    filterAndSortCertificates();
  }, [certificates, searchTerm, institutionFilter, sortBy]);

  const fetchCertificates = async () => {
    try {
      // Fetch certificates with verification stats
      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (certsError) throw certsError;

      // Fetch verification counts
      const { data: verificationData } = await supabase
        .from("verification_logs")
        .select("certificate_id, verified_at");

      // Aggregate verification stats
      const verificationMap = new Map<string, { count: number; lastVerified: string }>();
      verificationData?.forEach(log => {
        const existing = verificationMap.get(log.certificate_id);
        if (!existing) {
          verificationMap.set(log.certificate_id, {
            count: 1,
            lastVerified: log.verified_at
          });
        } else {
          existing.count++;
          if (new Date(log.verified_at) > new Date(existing.lastVerified)) {
            existing.lastVerified = log.verified_at;
          }
        }
      });

      // Merge data
      const enrichedCerts = certsData?.map(cert => ({
        ...cert,
        total_verifications: verificationMap.get(cert.id)?.count || 0,
        last_verified_at: verificationMap.get(cert.id)?.lastVerified
      })) || [];

      setCertificates(enrichedCerts);

      // Extract unique institutions
      const uniqueInstitutions = Array.from(
        new Set(certsData?.map(cert => cert.institution) || [])
      ).sort();
      setInstitutions(uniqueInstitutions);

      // Calculate stats
      setStats({
        totalCertificates: certsData?.length || 0,
        totalInstitutions: uniqueInstitutions.length,
        totalVerifications: verificationData?.length || 0
      });

    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCertificates = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.holder_name.toLowerCase().includes(term) ||
        cert.course_name.toLowerCase().includes(term) ||
        cert.institution.toLowerCase().includes(term) ||
        cert.certificate_id.toLowerCase().includes(term)
      );
    }

    // Apply institution filter
    if (institutionFilter !== "all") {
      filtered = filtered.filter(cert => cert.institution === institutionFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "name":
        filtered.sort((a, b) => a.holder_name.localeCompare(b.holder_name));
        break;
      case "popular":
        filtered.sort((a, b) => 
          (b.total_verifications || 0) - (a.total_verifications || 0)
        );
        break;
    }

    setFilteredCertificates(filtered);
  };

  const handleVerifyCertificate = async (certificateId: string) => {
    navigate(`/verify/${certificateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Certificate Gallery</h1>
                <p className="text-sm text-muted-foreground">Explore verified certificates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/scan")}>
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
              <Button variant="outline" onClick={() => navigate("/verify")}>
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">Active certificates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
              <p className="text-xs text-muted-foreground">Issuing organizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verifications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVerifications}</div>
              <p className="text-xs text-muted-foreground">Total verifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, course, institution, or certificate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map(inst => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("recent")}
                >
                  Recent
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                >
                  Popular
                </Button>
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                >
                  Name
                </Button>
                <Button
                  variant={sortBy === "oldest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("oldest")}
                >
                  Oldest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredCertificates.length} Certificate{filteredCertificates.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Award className="h-8 w-8 text-primary" />
                    <Badge variant="secondary">
                      {cert.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{cert.course_name}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{cert.holder_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      <span>{cert.institution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(cert.issue_date), "MMM dd, yyyy")}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Verifications
                      </span>
                      <span className="font-semibold">{cert.total_verifications || 0}</span>
                    </div>
                    {cert.last_verified_at && (
                      <div className="text-xs text-muted-foreground">
                        Last verified: {format(new Date(cert.last_verified_at), "MMM dd, yyyy")}
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => handleVerifyCertificate(cert.certificate_id)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateGallery;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PolkadotWallet } from "@/components/PolkadotWallet";
import UploadCertificate from "@/components/user/UploadCertificate";
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Search, 
  Shield,
  TrendingUp,
  Eye,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface VerificationLog {
  id: string;
  certificate_id: string;
  verified_at: string;
  verification_method: string;
  verification_result: string;
  certificates: {
    certificate_id: string;
    holder_name: string;
    course_name: string;
    institution: string;
    status: string;
  };
}

interface UserProfile {
  email: string;
  full_name: string | null;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    last30Days: 0,
    uniqueCertificates: 0
  });

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch verification logs
      const { data: logsData, error: logsError } = await supabase
        .from("verification_logs")
        .select(`
          id,
          certificate_id,
          verified_at,
          verification_method,
          verification_result,
          certificates (
            certificate_id,
            holder_name,
            course_name,
            institution,
            status
          )
        `)
        .eq("verified_by", user.id)
        .order("verified_at", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setVerificationLogs(logsData || []);

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const last30DaysCount = logsData?.filter(
        log => new Date(log.verified_at) > thirtyDaysAgo
      ).length || 0;

      const uniqueCerts = new Set(logsData?.map(log => log.certificate_id)).size;

      setStats({
        totalVerifications: logsData?.length || 0,
        last30Days: last30DaysCount,
        uniqueCertificates: uniqueCerts
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "qr_scan": return "📱";
      case "manual_search": return "🔍";
      case "direct_link": return "🔗";
      case "api": return "⚡";
      default: return "📄";
    }
  };

  const getResultBadge = (result: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      valid: "default",
      revoked: "destructive",
      expired: "secondary",
      not_found: "destructive"
    };
    return (
      <Badge variant={variants[result] || "secondary"}>
        {result.toUpperCase()}
      </Badge>
    );
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
      <header className="bg-white border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <p className="text-sm text-muted-foreground hidden md:block">Certificate Verification Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PolkadotWallet />
              <Button variant="outline" size="sm" onClick={() => navigate("/gallery")} className="hidden md:flex">
                <Search className="h-4 w-4 mr-2" />
                Gallery
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/verify")} className="hidden md:flex">
                Verify
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profile?.full_name?.[0] || profile?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name || "User"}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload Certificate</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVerifications}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last30Days}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueCertificates}</div>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Verification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Verification History
            </CardTitle>
            <CardDescription>
              Your recent certificate verification activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationLogs.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No verification history yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/")}
                >
                  Start Verifying Certificates
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getMethodIcon(log.verification_method)}</span>
                          <div>
                            <h4 className="font-semibold">{log.certificates.course_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {log.certificates.holder_name} • {log.certificates.institution}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.verified_at), "MMM dd, yyyy 'at' HH:mm")}
                          </span>
                          <span className="capitalize">{log.verification_method.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getResultBadge(log.verification_result)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/verify/${log.certificates.certificate_id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="upload">
            <UploadCertificate />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;

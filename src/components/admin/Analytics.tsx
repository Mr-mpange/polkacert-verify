import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalIssued: number;
  verificationCount: number;
  recentActivity: Array<{
    action: string;
    certificate_id: string;
    created_at: string;
  }>;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total certificates issued
      const { count: totalIssued } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true });

      // Get verification logs count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: verificationCount } = await supabase
        .from("verification_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Get recent certificates for activity
      const { data: recentCerts } = await supabase
        .from("certificates")
        .select("certificate_id, created_at, status")
        .order("created_at", { ascending: false })
        .limit(10);

      // Format recent activity
      const recentActivity = (recentCerts || []).map((cert) => ({
        action: cert.status === "revoked" ? "Certificate Revoked" : "Certificate Issued",
        certificate_id: cert.certificate_id,
        created_at: cert.created_at,
      }));

      setData({
        totalIssued: totalIssued || 0,
        verificationCount: verificationCount || 0,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Certificates Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {data?.totalIssued || 0}
                </span>
                {data && data.totalIssued > 0 && (
                  <div className="flex items-center gap-1 text-success text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total certificates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {data?.verificationCount || 0}
                </span>
                {data && data.verificationCount > 0 && (
                  <div className="flex items-center gap-1 text-success text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {activity.certificate_id}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet</p>
              <p className="text-sm mt-2">Issue your first certificate to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

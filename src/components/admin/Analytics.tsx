import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const Analytics = () => {
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
                <span className="text-3xl font-bold text-foreground">234</span>
                <div className="flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
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
                <span className="text-3xl font-bold text-foreground">1,432</span>
                <div className="flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8%</span>
                </div>
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
          <div className="space-y-4">
            {[
              { action: "Certificate Issued", id: "CERT-2024-089", time: "2 hours ago" },
              { action: "Certificate Verified", id: "CERT-2024-087", time: "3 hours ago" },
              { action: "Certificate Issued", id: "CERT-2024-088", time: "5 hours ago" },
              { action: "Certificate Revoked", id: "CERT-2024-045", time: "1 day ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm font-mono text-muted-foreground">{activity.id}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

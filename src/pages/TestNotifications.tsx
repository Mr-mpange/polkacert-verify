import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, CheckCircle, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TestNotifications = () => {
  const navigate = useNavigate();

  const testIssueNotification = () => {
    toast.success(
      `Certificate Issued`,
      {
        description: `Jane Doe - Advanced Web Development`,
        icon: <CheckCircle className="h-5 w-5 text-success" />,
        duration: 5000,
      }
    );
  };

  const testRevokeNotification = () => {
    toast.error(
      `Certificate Revoked`,
      {
        description: `John Smith - Data Science Basics`,
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        duration: 5000,
      }
    );
  };

  const testReactivateNotification = () => {
    toast.success(
      `Certificate Reactivated`,
      {
        description: `Mike Johnson - Blockchain Fundamentals`,
        icon: <Shield className="h-5 w-5 text-success" />,
        duration: 5000,
      }
    );
  };

  const testVerifyNotification = () => {
    toast.success("Certificate Verified Successfully", {
      description: `Alice Brown - Machine Learning 101`,
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Test Notifications</span>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Real-Time Notification Demos
            </CardTitle>
            <CardDescription>
              Test the real-time notification system. In production, these notifications appear automatically when certificates are issued, verified, or revoked.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Certificate Issued</h3>
                <p className="text-sm text-muted-foreground">
                  Triggered when a new certificate is created in the system
                </p>
                <Button onClick={testIssueNotification} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Test Issue Notification
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Certificate Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Triggered when someone successfully verifies a certificate
                </p>
                <Button onClick={testVerifyNotification} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Test Verify Notification
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Certificate Revoked</h3>
                <p className="text-sm text-muted-foreground">
                  Triggered when an admin revokes a certificate
                </p>
                <Button onClick={testRevokeNotification} variant="destructive" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Test Revoke Notification
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Certificate Reactivated</h3>
                <p className="text-sm text-muted-foreground">
                  Triggered when an admin reactivates a revoked certificate
                </p>
                <Button onClick={testReactivateNotification} variant="outline" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Test Reactivate Notification
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-foreground">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Real-time updates use Supabase Realtime subscriptions</li>
                <li>All users receive notifications instantly</li>
                <li>Notifications appear in the bottom-right corner</li>
                <li>Try the admin dashboard to see live updates!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TestNotifications;

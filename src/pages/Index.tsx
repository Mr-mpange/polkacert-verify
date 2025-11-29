import { useState } from "react";
import { Shield, Search, Award, Lock, FileCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [certificateId, setCertificateId] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (certificateId.trim()) {
      navigate(`/verify/${certificateId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CertiChain</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="/verify" className="text-foreground hover:text-primary transition-colors">Verify</a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="/contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>
          <Button onClick={() => navigate("/auth")} variant="default">
            Admin Login
          </Button>
        </div>
      </header>

      {/* Demo Credentials Banner */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container mx-auto px-4 py-4">
          <Card className="bg-card border-accent">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Demo Account & Sample Certificates
                  </h3>
                  <p className="text-sm text-muted-foreground">Use these credentials to test the admin dashboard</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Admin Login</p>
                    <p className="text-sm font-mono text-foreground">kilindoalaika771@gmail.com</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Sample Certificate IDs</p>
                    <p className="text-xs font-mono text-foreground">CERT-2024-001, CERT-2024-002</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Blockchain-Powered Certificate Verification
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure, transparent, and immutable certificate verification powered by Polkadot blockchain technology
            </p>
            
            {/* Verification Search */}
            <div className="flex gap-3 max-w-2xl mx-auto pt-8">
              <Input
                type="text"
                placeholder="Enter Certificate ID or scan QR code"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                className="h-14 text-lg"
              />
              <Button onClick={handleVerify} size="lg" className="h-14 px-8">
                <Search className="mr-2 h-5 w-5" />
                Verify
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose CertiChain?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Blockchain Secured</h3>
                <p className="text-muted-foreground">
                  All certificates are stored on Polkadot blockchain, ensuring immutability and preventing tampering
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">QR Code Verification</h3>
                <p className="text-muted-foreground">
                  Instant verification through QR codes - scan and verify certificates in seconds
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Instant Verification</h3>
                <p className="text-muted-foreground">
                  Real-time verification with complete transparency and authenticity proof
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">10,000+</div>
              <div className="text-primary-foreground/80">Certificates Issued</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">500+</div>
              <div className="text-primary-foreground/80">Institutions</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">99.9%</div>
              <div className="text-primary-foreground/80">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Issue Certificate", desc: "Institution creates and uploads certificate" },
              { step: "2", title: "Blockchain Storage", desc: "Certificate hash stored on Polkadot" },
              { step: "3", title: "Generate QR", desc: "Unique QR code generated automatically" },
              { step: "4", title: "Verify Anytime", desc: "Anyone can verify authenticity instantly" },
            ].map((item) => (
              <Card key={item.step} className="text-center shadow-soft">
                <CardContent className="p-6 space-y-3">
                  <div className="h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">CertiChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Blockchain-powered certificate verification system
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/verify" className="hover:text-primary transition-colors">Verify Certificate</a></li>
                <li><a href="/features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 CertiChain. All rights reserved. Powered by Polkadot.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

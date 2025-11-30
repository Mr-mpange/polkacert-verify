import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VerifyCertificate from "./pages/VerifyCertificate";
import ScanCertificate from "./pages/ScanCertificate";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TestNotifications from "./pages/TestNotifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCertificateNotifications } from "@/hooks/useCertificateNotifications";

const queryClient = new QueryClient();

const AppContent = () => {
  useCertificateNotifications();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/scan" element={<ScanCertificate />} />
          <Route path="/test-notifications" element={<TestNotifications />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, XCircle, CheckCircle } from "lucide-react";

export const useCertificateNotifications = () => {
  useEffect(() => {
    console.log('Setting up certificate notifications...');

    const channel = supabase
      .channel('certificate-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'certificates'
        },
        (payload) => {
          console.log('Certificate issued:', payload);
          const cert = payload.new as any;
          toast.success(
            `Certificate Issued`,
            {
              description: `${cert.holder_name} - ${cert.course_name}`,
              icon: <CheckCircle className="h-5 w-5 text-success" />,
              duration: 5000,
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'certificates'
        },
        (payload) => {
          console.log('Certificate updated:', payload);
          const oldCert = payload.old as any;
          const newCert = payload.new as any;
          
          // Check if status changed to revoked
          if (oldCert.status !== 'revoked' && newCert.status === 'revoked') {
            toast.error(
              `Certificate Revoked`,
              {
                description: `${newCert.holder_name} - ${newCert.course_name}`,
                icon: <XCircle className="h-5 w-5 text-destructive" />,
                duration: 5000,
              }
            );
          }
          // Check if status changed from revoked to active (reactivated)
          else if (oldCert.status === 'revoked' && newCert.status === 'active') {
            toast.success(
              `Certificate Reactivated`,
              {
                description: `${newCert.holder_name} - ${newCert.course_name}`,
                icon: <Shield className="h-5 w-5 text-success" />,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to certificate changes');
        }
      });

    return () => {
      console.log('Cleaning up certificate notifications...');
      supabase.removeChannel(channel);
    };
  }, []);
};

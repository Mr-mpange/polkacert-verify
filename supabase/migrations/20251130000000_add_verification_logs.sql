-- Create verification_logs table to track all certificate verifications
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('qr_scan', 'manual_search', 'direct_link', 'api')),
  ip_address TEXT,
  user_agent TEXT,
  location_data JSONB,
  verification_result TEXT NOT NULL CHECK (verification_result IN ('valid', 'revoked', 'expired', 'not_found')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on verification_logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_verification_logs_certificate_id ON public.verification_logs(certificate_id);
CREATE INDEX idx_verification_logs_verified_at ON public.verification_logs(verified_at DESC);
CREATE INDEX idx_verification_logs_verified_by ON public.verification_logs(verified_by);

-- RLS Policies for verification_logs
CREATE POLICY "Anyone can insert verification logs"
  ON public.verification_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view their own verification logs"
  ON public.verification_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = verified_by);

CREATE POLICY "Admins can view all verification logs"
  ON public.verification_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create a view for certificate statistics
CREATE OR REPLACE VIEW public.certificate_stats AS
SELECT 
  c.id,
  c.certificate_id,
  c.holder_name,
  c.course_name,
  c.institution,
  c.status,
  c.issue_date,
  c.created_at,
  COUNT(vl.id) as total_verifications,
  COUNT(DISTINCT vl.verified_by) as unique_verifiers,
  MAX(vl.verified_at) as last_verified_at,
  COUNT(CASE WHEN vl.verified_at > NOW() - INTERVAL '30 days' THEN 1 END) as verifications_last_30_days
FROM public.certificates c
LEFT JOIN public.verification_logs vl ON c.id = vl.certificate_id
GROUP BY c.id, c.certificate_id, c.holder_name, c.course_name, c.institution, c.status, c.issue_date, c.created_at;

-- Grant access to the view
GRANT SELECT ON public.certificate_stats TO authenticated, anon;

-- Create function to log verification
CREATE OR REPLACE FUNCTION public.log_certificate_verification(
  p_certificate_id UUID,
  p_verification_method TEXT,
  p_verification_result TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.verification_logs (
    certificate_id,
    verified_by,
    verification_method,
    verification_result,
    ip_address,
    user_agent,
    location_data
  ) VALUES (
    p_certificate_id,
    auth.uid(),
    p_verification_method,
    p_verification_result,
    p_ip_address,
    p_user_agent,
    p_location_data
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

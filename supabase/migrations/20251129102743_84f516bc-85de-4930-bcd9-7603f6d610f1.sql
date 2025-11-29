-- Add revocation tracking columns to certificates table
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS revocation_reason text;

-- Create an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
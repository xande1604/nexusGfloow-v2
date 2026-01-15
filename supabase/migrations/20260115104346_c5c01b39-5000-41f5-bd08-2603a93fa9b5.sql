-- Create table for SSO tokens
CREATE TABLE public.sso_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick token lookup
CREATE INDEX idx_sso_tokens_token ON public.sso_tokens(token);

-- Index for cleanup of expired tokens
CREATE INDEX idx_sso_tokens_expires_at ON public.sso_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.sso_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens (edge functions)
-- No policies needed since edge functions use service role key

-- Function to clean up expired tokens (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sso_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.sso_tokens WHERE expires_at < now() OR (used = true AND used_at < now() - interval '1 hour');
$$;
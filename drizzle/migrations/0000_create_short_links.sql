CREATE TABLE public.short_links (
  code text PRIMARY KEY CHECK (code ~ '^[A-Za-z0-9_-]{3,40}$'),
  url text NOT NULL,
  password_hash text,
  expires_at timestamptz,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.short_links TO service_role;
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
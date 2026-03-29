CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_type TEXT,
  brand_location TEXT,
  brand_summary TEXT,
  tagline TEXT,
  has_instagram_account BOOLEAN,
  instagram_connected_at TIMESTAMPTZ,
  ig_user_id TEXT,
  ig_username TEXT,
  ig_biography TEXT,
  ig_profile_picture_url TEXT,
  ig_followers_count INTEGER,
  ig_follows_count INTEGER,
  ig_media_count INTEGER,
  instagram_url TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_profiles_user_id ON public.business_profiles (user_id);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view counterpart business profiles"
  ON public.business_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE (c.business_id = auth.uid() AND c.influencer_id = business_profiles.user_id)
         OR (c.influencer_id = auth.uid() AND c.business_id = business_profiles.user_id)
    )
  );

GRANT ALL ON TABLE public.business_profiles TO postgres, anon, authenticated, service_role;

INSERT INTO public.business_profiles (
  user_id,
  brand_name,
  brand_type,
  brand_location
)
SELECT
  p.id,
  p.business_name,
  p.business_type,
  p.location
FROM public.profiles p
WHERE p.business_name IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  brand_name = COALESCE(public.business_profiles.brand_name, EXCLUDED.brand_name),
  brand_type = COALESCE(public.business_profiles.brand_type, EXCLUDED.brand_type),
  brand_location = COALESCE(public.business_profiles.brand_location, EXCLUDED.brand_location);

CREATE TABLE public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  city TEXT,
  category TEXT,
  instagram_handle TEXT,
  instagram_url TEXT,
  follower_count INTEGER,
  avg_likes_per_reel NUMERIC,
  avg_views_per_reel NUMERIC,
  price_per_post NUMERIC,
  price_per_reel NUMERIC,
  price_per_story NUMERIC,
  turnaround_time TEXT,
  languages TEXT[],
  content_types TEXT[],
  previous_brands TEXT[],
  portfolio_media_ids TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  ig_user_id TEXT,
  ig_username TEXT,
  ig_biography TEXT,
  ig_profile_picture_url TEXT,
  ig_followers_count INTEGER,
  ig_follows_count INTEGER,
  ig_media_count INTEGER,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_influencer_profiles_user_id ON public.influencer_profiles (user_id);
CREATE INDEX idx_influencer_profiles_active_followers ON public.influencer_profiles (is_active, follower_count DESC NULLS LAST);

ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active influencer profiles"
  ON public.influencer_profiles FOR SELECT
  USING (is_active IS TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own influencer profile"
  ON public.influencer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own influencer profile"
  ON public.influencer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

GRANT ALL ON TABLE public.influencer_profiles TO postgres, anon, authenticated, service_role;

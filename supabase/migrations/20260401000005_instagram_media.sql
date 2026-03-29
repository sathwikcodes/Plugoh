CREATE TABLE public.instagram_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ig_media_id TEXT NOT NULL,
  caption TEXT,
  media_type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  timestamp TIMESTAMPTZ,
  like_count INTEGER,
  comments_count INTEGER,
  impressions INTEGER,
  reach INTEGER,
  saves INTEGER,
  engagement INTEGER,
  video_views INTEGER,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instagram_ig_media_per_user UNIQUE (user_id, ig_media_id)
);

CREATE INDEX idx_instagram_media_user_id ON public.instagram_media (user_id);

ALTER TABLE public.instagram_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own instagram media"
  ON public.instagram_media FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.instagram_media TO postgres, anon, authenticated, service_role;

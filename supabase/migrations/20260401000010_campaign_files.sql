CREATE TABLE public.campaign_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.campaign_messages (id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users (id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT DEFAULT 'attachment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_files_campaign ON public.campaign_files (campaign_id);

ALTER TABLE public.campaign_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read files for their campaigns"
  ON public.campaign_files FOR SELECT
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id = auth.uid() OR c.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files for their campaigns"
  ON public.campaign_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id = auth.uid() OR c.influencer_id = auth.uid()
    )
  );

GRANT ALL ON TABLE public.campaign_files TO postgres, anon, authenticated, service_role;

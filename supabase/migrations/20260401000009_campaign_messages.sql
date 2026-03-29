CREATE TABLE public.campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users (id),
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  metadata JSONB DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_messages_campaign ON public.campaign_messages (campaign_id, created_at);
CREATE INDEX idx_campaign_messages_sender ON public.campaign_messages (sender_id);

ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages for their campaigns"
  ON public.campaign_messages FOR SELECT
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id = auth.uid() OR c.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their campaigns"
  ON public.campaign_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id = auth.uid() OR c.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update read_by on their campaign messages"
  ON public.campaign_messages FOR UPDATE
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      WHERE c.business_id = auth.uid() OR c.influencer_id = auth.uid()
    )
  );

GRANT ALL ON TABLE public.campaign_messages TO postgres, anon, authenticated, service_role;

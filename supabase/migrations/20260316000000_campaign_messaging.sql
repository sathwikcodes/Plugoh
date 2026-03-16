-- Campaign Messages table
CREATE TABLE public.campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  metadata JSONB DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_messages_campaign ON public.campaign_messages(campaign_id, created_at);
CREATE INDEX idx_campaign_messages_sender ON public.campaign_messages(sender_id);

ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages for their campaigns"
ON public.campaign_messages FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE business_id = auth.uid() OR influencer_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages for their campaigns"
ON public.campaign_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE business_id = auth.uid() OR influencer_id = auth.uid()
  )
);

CREATE POLICY "Users can update read_by on their campaign messages"
ON public.campaign_messages FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE business_id = auth.uid() OR influencer_id = auth.uid()
  )
);

-- Campaign Files table
CREATE TABLE public.campaign_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.campaign_messages(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT DEFAULT 'attachment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_files_campaign ON public.campaign_files(campaign_id);

ALTER TABLE public.campaign_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read files for their campaigns"
ON public.campaign_files FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE business_id = auth.uid() OR influencer_id = auth.uid()
  )
);

CREATE POLICY "Users can upload files for their campaigns"
ON public.campaign_files FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
  AND campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE business_id = auth.uid() OR influencer_id = auth.uid()
  )
);

-- Enable realtime for campaign_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_messages;

-- Auto-insert system message on campaign status change
CREATE OR REPLACE FUNCTION fn_campaign_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.campaign_messages (campaign_id, sender_id, message_type, content)
    VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.business_id),
      'system',
      CASE NEW.status
        WHEN 'accepted' THEN 'Campaign accepted'
        WHEN 'rejected' THEN 'Campaign declined'
        WHEN 'completed' THEN 'Campaign marked as completed'
        WHEN 'inquiry' THEN 'Inquiry sent'
        WHEN 'terms_agreed' THEN 'Terms agreed'
        WHEN 'in_progress' THEN 'Work started'
        WHEN 'review' THEN 'Content submitted for review'
        WHEN 'revision_requested' THEN 'Revision requested'
        ELSE 'Status changed to ' || NEW.status
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_campaign_status_change
AFTER UPDATE OF status ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION fn_campaign_status_change();

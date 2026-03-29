CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users (id),
  content_url TEXT NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users (id),
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  admin_resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_campaign_id ON public.deliveries (campaign_id);

CREATE TRIGGER trg_deliveries_set_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign participants can view deliveries"
  ON public.deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = deliveries.campaign_id
        AND (c.business_id = auth.uid() OR c.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Influencer can submit deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Brand can update deliveries"
  ON public.deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = deliveries.campaign_id AND c.business_id = auth.uid()
    )
  );

GRANT ALL ON TABLE public.deliveries TO postgres, anon, authenticated, service_role;

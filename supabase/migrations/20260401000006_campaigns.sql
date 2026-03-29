CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES auth.users (id),
  influencer_id UUID NOT NULL REFERENCES auth.users (id),
  influencer_profile_id UUID REFERENCES public.influencer_profiles (id),
  title TEXT,
  brief TEXT,
  package_type TEXT,
  price_offered NUMERIC,
  advance_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'requested',
  business_contact_email TEXT,
  business_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  platform_fee_amount NUMERIC(10, 2),
  total_charged_amount NUMERIC(10, 2),
  accepted_at TIMESTAMPTZ,
  payment_captured_at TIMESTAMPTZ,
  delivery_submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_business_id ON public.campaigns (business_id);
CREATE INDEX idx_campaigns_influencer_id ON public.campaigns (influencer_id);
CREATE INDEX idx_campaigns_status ON public.campaigns (status);

CREATE TRIGGER trg_campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign participants can view campaigns"
  ON public.campaigns FOR SELECT
  USING (business_id = auth.uid() OR influencer_id = auth.uid());

CREATE POLICY "Business can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Campaign participants can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (business_id = auth.uid() OR influencer_id = auth.uid());

CREATE POLICY "Users can view profiles of campaign counterparts"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE (c.business_id = auth.uid() AND c.influencer_id = profiles.id)
         OR (c.influencer_id = auth.uid() AND c.business_id = profiles.id)
    )
  );

GRANT ALL ON TABLE public.campaigns TO postgres, anon, authenticated, service_role;

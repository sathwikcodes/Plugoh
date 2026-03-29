CREATE TABLE public.influencer_payout_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  upi_id TEXT,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  bank_account_name TEXT,
  preferred_method TEXT NOT NULL DEFAULT 'upi',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  razorpay_contact_id TEXT,
  razorpay_fund_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_influencer_payout_details_set_updated_at
  BEFORE UPDATE ON public.influencer_payout_details
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.influencer_payout_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payout details"
  ON public.influencer_payout_details FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payout details"
  ON public.influencer_payout_details FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payout details"
  ON public.influencer_payout_details FOR UPDATE
  USING (user_id = auth.uid());

GRANT ALL ON TABLE public.influencer_payout_details TO postgres, anon, authenticated, service_role;

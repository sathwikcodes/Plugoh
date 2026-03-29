CREATE TABLE public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  platform_fee_paise INTEGER,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_payout_id TEXT,
  razorpay_refund_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escrow_transactions_campaign_id ON public.escrow_transactions (campaign_id);
CREATE INDEX idx_escrow_transactions_type_status ON public.escrow_transactions (type, status);

CREATE TRIGGER trg_escrow_transactions_set_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign participants can view escrow transactions"
  ON public.escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = escrow_transactions.campaign_id
        AND (c.business_id = auth.uid() OR c.influencer_id = auth.uid())
    )
  );

GRANT ALL ON TABLE public.escrow_transactions TO postgres, anon, authenticated, service_role;

-- ============================================================
-- Escrow Payment Model Migration
-- Moves from "pay before accept" to soft-lock escrow flow:
--   requested → payment_pending → in_escrow → delivery_submitted → completed
-- ============================================================

-- ─── 1. Extend campaigns table ───────────────────────────────────────────────

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS platform_fee_amount   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS total_charged_amount  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS accepted_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_captured_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at            TIMESTAMPTZ;

-- Ensure razorpay columns exist (may already be in DB but missing from types)
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS razorpay_order_id   TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status      TEXT DEFAULT 'unpaid';

-- ─── 2. Create deliveries table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deliveries (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       UUID        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  submitted_by      UUID        NOT NULL REFERENCES auth.users(id),
  content_url       TEXT        NOT NULL,
  notes             TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at       TIMESTAMPTZ,
  approved_by       UUID        REFERENCES auth.users(id),
  dispute_reason    TEXT,
  disputed_at       TIMESTAMPTZ,
  admin_resolved_at TIMESTAMPTZ,
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_campaign_id ON public.deliveries(campaign_id);

-- ─── 3. Create escrow_transactions table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           UUID        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  type                  TEXT        NOT NULL,
  -- 'escrow_lock' | 'payout_influencer' | 'platform_fee' | 'refund_brand'
  amount_paise          INTEGER     NOT NULL,
  platform_fee_paise    INTEGER,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_payout_id    TEXT,
  razorpay_refund_id    TEXT,
  status                TEXT        NOT NULL DEFAULT 'pending',
  -- 'pending' | 'processing' | 'success' | 'failed'
  failure_reason        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_campaign_id ON public.escrow_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_type_status ON public.escrow_transactions(type, status);

-- ─── 4. Create influencer_payout_details table ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.influencer_payout_details (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  upi_id                     TEXT,
  bank_account_no            TEXT,
  bank_ifsc                  TEXT,
  bank_account_name          TEXT,
  preferred_method           TEXT        NOT NULL DEFAULT 'upi',
  -- 'upi' | 'bank'
  verified                   BOOLEAN     NOT NULL DEFAULT false,
  razorpay_contact_id        TEXT,
  razorpay_fund_account_id   TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. RLS policies ─────────────────────────────────────────────────────────

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payout_details ENABLE ROW LEVEL SECURITY;

-- deliveries: participants of the campaign can SELECT
CREATE POLICY "Campaign participants can view deliveries"
  ON public.deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = deliveries.campaign_id
        AND (c.business_id = auth.uid() OR c.influencer_id = auth.uid())
    )
  );

-- deliveries: only the influencer can INSERT
CREATE POLICY "Influencer can submit deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.influencer_id = auth.uid()
    )
  );

-- deliveries: brand or admin can UPDATE (to approve/dispute)
CREATE POLICY "Brand can approve deliveries"
  ON public.deliveries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = deliveries.campaign_id AND c.business_id = auth.uid()
    )
  );

-- escrow_transactions: participants can view their campaign's transactions
CREATE POLICY "Campaign participants can view escrow transactions"
  ON public.escrow_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = escrow_transactions.campaign_id
        AND (c.business_id = auth.uid() OR c.influencer_id = auth.uid())
    )
  );

-- influencer_payout_details: users own their own row
CREATE POLICY "Users can view own payout details"
  ON public.influencer_payout_details FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payout details"
  ON public.influencer_payout_details FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payout details"
  ON public.influencer_payout_details FOR UPDATE
  USING (user_id = auth.uid());

-- ─── 6. Migrate existing data ────────────────────────────────────────────────
-- Map old status values to new ones for any existing rows:
--   'pending'  → 'requested'
--   'rejected' → 'declined'
--   'accepted' → 'in_escrow'  (these already had payment)
-- Note: payment_status for existing 'accepted'/'completed' rows is already 'paid'

UPDATE public.campaigns SET status = 'requested'  WHERE status = 'pending';
UPDATE public.campaigns SET status = 'declined'   WHERE status = 'rejected';
UPDATE public.campaigns SET status = 'in_escrow'  WHERE status = 'accepted';
-- 'completed' stays as 'completed'

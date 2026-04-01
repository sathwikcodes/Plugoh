-- Add payment_method column to campaigns table
-- Tracks whether payment was made via card (true pre-auth, capture later)
-- or UPI/other (immediate capture, refund on decline/expiry)
-- Values: 'card' | 'upi' | 'other'
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS payment_method TEXT;

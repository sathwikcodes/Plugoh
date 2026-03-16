-- Add business-specific profile fields to the profiles table.
-- business_name is required for a business to book influencers.
-- business_type is optional context about the kind of business.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

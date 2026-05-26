-- Meta App Review reviewer: auth user only (no role / no IG — reviewer goes through /onboarding)
-- Run AFTER: npm run meta:create-reviewer
--
-- Default email: meta-reviewer@plugoh.in (must match META_REVIEW_EMAIL)

BEGIN;

DO $$
DECLARE
  reviewer_uid uuid;
  reviewer_email text := 'meta-reviewer@plugoh.in';
BEGIN
  SELECT id INTO reviewer_uid FROM auth.users WHERE email = reviewer_email;

  IF reviewer_uid IS NULL THEN
    RAISE EXCEPTION
      'Missing auth user %. Run: npm run meta:create-reviewer', reviewer_email;
  END IF;

  DELETE FROM public.instagram_media WHERE user_id = reviewer_uid;
  DELETE FROM public.influencer_profiles WHERE user_id = reviewer_uid;
  DELETE FROM public.business_profiles WHERE user_id = reviewer_uid;
  DELETE FROM public.user_roles WHERE user_id = reviewer_uid;
  DELETE FROM public.profiles WHERE id = reviewer_uid;
END $$;

COMMIT;

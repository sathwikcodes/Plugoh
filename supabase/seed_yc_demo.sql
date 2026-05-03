-- YC demo seed for Plugoh (Summer 2026 showcase)
-- Run in Supabase SQL Editor as postgres ONLY AFTER auth users exist for BOTH emails below.
--
-- Order:
--   1) NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_ACCOUNT_PASSWORD in .env.local
--   2) npm run demo:create-users   (creates or updates the two Auth users + confirms email)
--   3) Run this file in SQL Editor
--
-- Manual alternative: Dashboard → Authentication → Users → Add user for each email;
--   password must match DEMO_ACCOUNT_PASSWORD used by /demo.
--
-- Idempotent: safe to re-run; upserts profiles/roles/campaigns by deterministic IDs.

BEGIN;

DO $$
DECLARE
  brand_uid   uuid;
  creator_uid uuid;
  inf_prof_id uuid;

  c_requested uuid := '11111111-1111-4111-8111-111111111101'::uuid;
  c_paypend   uuid := '11111111-1111-4111-8111-111111111102'::uuid;
  c_escrow    uuid := '11111111-1111-4111-8111-111111111103'::uuid;
  c_delivery  uuid := '11111111-1111-4111-8111-111111111104'::uuid;
  c_done      uuid := '11111111-1111-4111-8111-111111111105'::uuid;

  now_ts timestamptz := now();
BEGIN
  SELECT id INTO brand_uid FROM auth.users WHERE email = 'yc-demo-brand@plugoh.in';
  SELECT id INTO creator_uid FROM auth.users WHERE email = 'yc-demo-creator@plugoh.in';

  IF brand_uid IS NULL OR creator_uid IS NULL THEN
    RAISE EXCEPTION
      'Missing demo auth users. Create yc-demo-brand@plugoh.in and yc-demo-creator@plugoh.in in Authentication first.';
  END IF;

  IF brand_uid = creator_uid THEN
    RAISE EXCEPTION 'Demo brand and creator emails resolved to the same user id.';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, location, business_name, business_type)
  VALUES (
    brand_uid,
    'yc-demo-brand@plugoh.in',
    'Arjun Venkatraman',
    'Chennai, Tamil Nadu',
    'Mylapore Kaapi Labs',
    'D2C Beverage'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    location = EXCLUDED.location,
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type;

  INSERT INTO public.profiles (id, email, full_name, location)
  VALUES (
    creator_uid,
    'yc-demo-creator@plugoh.in',
    'Ananya Krishnan',
    'Coimbatore, Tamil Nadu'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    location = EXCLUDED.location;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (brand_uid, 'business'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (creator_uid, 'influencer'::public.app_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.business_profiles (
    user_id,
    brand_name,
    brand_type,
    brand_location,
    tagline,
    brand_summary,
    has_instagram_account,
    ig_username,
    instagram_url,
    ig_profile_picture_url
  )
  VALUES (
    brand_uid,
    'Mylapore Kaapi Labs',
    'D2C',
    'Chennai · PAN India shipping',
    'Third-wave filter coffee, first-principles roasting.',
    'YC Demo brand profile — specialty arabica, chicory-free blends, working with South Indian creators for launch reels and store-drop storytelling.',
    false,
    'mylapore_kaapi_demo',
    'https://instagram.com/mylapore_kaapi_demo',
    '/logo-gold.png'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    brand_type = EXCLUDED.brand_type,
    brand_location = EXCLUDED.brand_location,
    tagline = EXCLUDED.tagline,
    brand_summary = EXCLUDED.brand_summary,
    has_instagram_account = EXCLUDED.has_instagram_account,
    ig_username = EXCLUDED.ig_username,
    instagram_url = EXCLUDED.instagram_url,
    ig_profile_picture_url = EXCLUDED.ig_profile_picture_url;

  INSERT INTO public.influencer_profiles (
    user_id,
    display_name,
    bio,
    city,
    category,
    instagram_handle,
    instagram_url,
    ig_username,
    ig_profile_picture_url,
    follower_count,
    ig_followers_count,
    avg_views_per_reel,
    avg_likes_per_reel,
    price_per_post,
    price_per_reel,
    price_per_story,
    languages,
    content_types,
    previous_brands,
    is_active,
    turnaround_time
  )
  VALUES (
    creator_uid,
    'Ananya | Food & Tamil Nadu SMBs',
    'Demo creator for Plugoh YC — short reels on Chennai / Coimbatore food brands, SaaS tools for sellers, and honest sponsor reads.',
    'Coimbatore',
    'Food & Lifestyle',
    'plugoh_demo_creator',
    'https://instagram.com/plugoh_demo_creator',
    'plugoh_demo_creator',
    '/bandhavi-sridhar.png',
    48200,
    48200,
    128000,
    8400,
    18500,
    45000,
    3200,
    ARRAY['Tamil', 'English']::text[],
    ARRAY['Reel', 'Story', 'Post']::text[],
    ARRAY['Mylapore Kaapi Labs', 'FreshStreet Chennai']::text[],
    true,
    '48 hours'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    city = EXCLUDED.city,
    category = EXCLUDED.category,
    instagram_handle = EXCLUDED.instagram_handle,
    instagram_url = EXCLUDED.instagram_url,
    ig_username = EXCLUDED.ig_username,
    ig_profile_picture_url = EXCLUDED.ig_profile_picture_url,
    follower_count = EXCLUDED.follower_count,
    ig_followers_count = EXCLUDED.ig_followers_count,
    avg_views_per_reel = EXCLUDED.avg_views_per_reel,
    avg_likes_per_reel = EXCLUDED.avg_likes_per_reel,
    price_per_post = EXCLUDED.price_per_post,
    price_per_reel = EXCLUDED.price_per_reel,
    price_per_story = EXCLUDED.price_per_story,
    languages = EXCLUDED.languages,
    content_types = EXCLUDED.content_types,
    previous_brands = EXCLUDED.previous_brands,
    is_active = EXCLUDED.is_active,
    turnaround_time = EXCLUDED.turnaround_time
  RETURNING id INTO inf_prof_id;

  INSERT INTO public.campaigns (
    id,
    business_id,
    influencer_id,
    influencer_profile_id,
    title,
    brief,
    package_type,
    price_offered,
    advance_amount,
    status,
    payment_status,
    business_contact_email,
    business_contact_phone,
    razorpay_order_id,
    razorpay_payment_id,
    platform_fee_amount,
    total_charged_amount,
    accepted_at,
    payment_captured_at,
    delivery_submitted_at,
    completed_at,
    expires_at
  )
  VALUES
    (
      c_requested,
      brand_uid,
      creator_uid,
      inf_prof_id,
      'Summer Kaapi Drop — Ritual Reel (Chennai voice)',
      'Single 25–35s vertical reel: morning brew ritual, mention “single-origin Pechiparai”, CTA to preorder link. Tone: warm, not salesy. Tag @mylapore_kaapi_demo.',
      'reel',
      45000,
      NULL,
      'requested',
      'unpaid',
      'arjun@mylaporekaapi.demo',
      '+919876543210',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      now_ts + interval '6 days'
    ),
    (
      c_paypend,
      brand_uid,
      creator_uid,
      inf_prof_id,
      'Bangalore Tech Week — BTS Stories',
      '3 Instagram Stories over launch weekend: booth setup at KTPO, cupping session, founder quote card. English primary.',
      'story',
      32000,
      NULL,
      'payment_pending',
      'unpaid',
      'arjun@mylaporekaapi.demo',
      '+919876543210',
      NULL,
      NULL,
      NULL,
      NULL,
      now_ts - interval '1 day',
      NULL,
      NULL,
      NULL,
      now_ts + interval '4 days'
    ),
    (
      c_escrow,
      brand_uid,
      creator_uid,
      inf_prof_id,
      'Onam Sadhya Hamper — Unboxing Reel',
      '45s unboxing; highlight banana leaf plating + TN-made sweets partner. Soft plug discount code ONAMPLUGOH.',
      'reel',
      52000,
      NULL,
      'in_escrow',
      'paid',
      'arjun@mylaporekaapi.demo',
      '+919876543210',
      'demo_order_escrow',
      'demo_pay_escrow',
      4160,
      52000,
      now_ts - interval '3 days',
      now_ts - interval '2 days',
      NULL,
      NULL,
      now_ts + interval '10 days'
    ),
    (
      c_delivery,
      brand_uid,
      creator_uid,
      inf_prof_id,
      'Micro SaaS for Sellers — Problem/Solution Post',
      'Static carousel or reel; narrative: “how Tamil Nadu D2C brands ship faster”. Mention Plugoh only if asked — focus Mylapore Kaapi Labs fulfillment story.',
      'post',
      28000,
      NULL,
      'delivery_submitted',
      'paid',
      'arjun@mylaporekaapi.demo',
      '+919876543210',
      'demo_order_delivery',
      'demo_pay_delivery',
      2240,
      28000,
      now_ts - interval '8 days',
      now_ts - interval '7 days',
      now_ts - interval '1 day',
      NULL,
      now_ts + interval '2 days'
    ),
    (
      c_done,
      brand_uid,
      creator_uid,
      inf_prof_id,
      'Hyderabad Office Sampling — Mini Vlog',
      'Completed campaign — 60s vlog: sampling at Hitech City WeWork, 3 talking heads, B-roll pour-over.',
      'reel',
      61000,
      NULL,
      'completed',
      'paid',
      'arjun@mylaporekaapi.demo',
      '+919876543210',
      'demo_order_done',
      'demo_pay_done',
      4880,
      61000,
      now_ts - interval '21 days',
      now_ts - interval '20 days',
      now_ts - interval '14 days',
      now_ts - interval '12 days',
      NULL
    )
  ON CONFLICT (id) DO UPDATE SET
    business_id = EXCLUDED.business_id,
    influencer_id = EXCLUDED.influencer_id,
    influencer_profile_id = EXCLUDED.influencer_profile_id,
    title = EXCLUDED.title,
    brief = EXCLUDED.brief,
    package_type = EXCLUDED.package_type,
    price_offered = EXCLUDED.price_offered,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    business_contact_email = EXCLUDED.business_contact_email,
    business_contact_phone = EXCLUDED.business_contact_phone,
    razorpay_order_id = EXCLUDED.razorpay_order_id,
    razorpay_payment_id = EXCLUDED.razorpay_payment_id,
    platform_fee_amount = EXCLUDED.platform_fee_amount,
    total_charged_amount = EXCLUDED.total_charged_amount,
    accepted_at = EXCLUDED.accepted_at,
    payment_captured_at = EXCLUDED.payment_captured_at,
    delivery_submitted_at = EXCLUDED.delivery_submitted_at,
    completed_at = EXCLUDED.completed_at,
    expires_at = EXCLUDED.expires_at;

END $$;

COMMIT;

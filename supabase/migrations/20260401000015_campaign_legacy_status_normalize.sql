UPDATE public.campaigns SET status = 'requested' WHERE status = 'pending';
UPDATE public.campaigns SET status = 'declined' WHERE status = 'rejected';
UPDATE public.campaigns SET status = 'in_escrow' WHERE status = 'accepted';

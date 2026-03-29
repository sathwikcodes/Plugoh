ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_messages;

CREATE OR REPLACE FUNCTION public.fn_campaign_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.campaign_messages (campaign_id, sender_id, message_type, content)
    VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.business_id),
      'system',
      CASE NEW.status
        WHEN 'accepted' THEN 'Campaign accepted'
        WHEN 'rejected' THEN 'Campaign declined'
        WHEN 'completed' THEN 'Campaign marked as completed'
        WHEN 'inquiry' THEN 'Inquiry sent'
        WHEN 'terms_agreed' THEN 'Terms agreed'
        WHEN 'in_progress' THEN 'Work started'
        WHEN 'review' THEN 'Content submitted for review'
        WHEN 'revision_requested' THEN 'Revision requested'
        ELSE 'Status changed to ' || NEW.status
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campaign_status_change
  AFTER UPDATE OF status ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_campaign_status_change();

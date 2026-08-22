CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  related_table text,
  related_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins update notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins delete notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE OR REPLACE FUNCTION public.notify_new_repair_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications(type, title, message, related_table, related_id)
  VALUES (
    'new_request',
    'New repair request',
    NEW.full_name || ' submitted a repair request for ' || NEW.equipment_name || '.',
    'repair_requests',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.repair_requests') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS repair_request_notification ON public.repair_requests;
    CREATE TRIGGER repair_request_notification
      AFTER INSERT ON public.repair_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_repair_request();
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-images',
  'admin-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read admin images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'admin-images');

CREATE POLICY "Admins manage admin images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'admin-images' AND public.has_role(auth.uid(), 'admin'));

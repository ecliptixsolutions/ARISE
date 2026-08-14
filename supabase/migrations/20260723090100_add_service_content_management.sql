CREATE TABLE IF NOT EXISTS public.services (
  slug text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  short_description text NOT NULL,
  detailed_description text NOT NULL,
  common_problems text[] NOT NULL DEFAULT '{}',
  carousel_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_image_id text,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published services"
  ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins manage services"
  ON public.services
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER services_updated
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read service images'
  ) THEN
    CREATE POLICY "Public read service images"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins upload service images'
  ) THEN
    CREATE POLICY "Admins upload service images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins update service images'
  ) THEN
    CREATE POLICY "Admins update service images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins delete service images'
  ) THEN
    CREATE POLICY "Admins delete service images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

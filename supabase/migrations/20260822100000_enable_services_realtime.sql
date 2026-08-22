-- Enable Supabase Realtime for the services table so the public frontend
-- receives INSERT / UPDATE / DELETE events and can re-fetch automatically.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'services'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'office_availability_status') THEN
    CREATE TYPE public.office_availability_status AS ENUM ('open','closed','temporarily_closed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.office_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status public.office_availability_status NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  reason text,
  reopening_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT office_availability_ends_after_start CHECK (ends_at IS NULL OR ends_at > starts_at),
  CONSTRAINT office_availability_reopens_after_start CHECK (reopening_at IS NULL OR reopening_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS office_availability_window_idx
  ON public.office_availability (starts_at, ends_at, status);

CREATE OR REPLACE FUNCTION public.set_office_availability_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_office_availability_updated_at ON public.office_availability;
CREATE TRIGGER set_office_availability_updated_at
  BEFORE INSERT OR UPDATE ON public.office_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_office_availability_updated_at();

ALTER TABLE public.office_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads office availability" ON public.office_availability;
CREATE POLICY "Public reads office availability"
  ON public.office_availability
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and permitted staff insert office availability" ON public.office_availability;
CREATE POLICY "Admins and permitted staff insert office availability"
  ON public.office_availability
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_staff_permission(auth.uid(), 'office_availability')
  );

DROP POLICY IF EXISTS "Admins and permitted staff update office availability" ON public.office_availability;
CREATE POLICY "Admins and permitted staff update office availability"
  ON public.office_availability
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_staff_permission(auth.uid(), 'office_availability')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_staff_permission(auth.uid(), 'office_availability')
  );

DROP POLICY IF EXISTS "Admins and permitted staff delete office availability" ON public.office_availability;
CREATE POLICY "Admins and permitted staff delete office availability"
  ON public.office_availability
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_staff_permission(auth.uid(), 'office_availability')
  );

GRANT SELECT ON public.office_availability TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.office_availability TO authenticated;
GRANT ALL ON public.office_availability TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'office_availability'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.office_availability;
  END IF;
END $$;

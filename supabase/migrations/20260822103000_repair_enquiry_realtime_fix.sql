DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','staff','user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repair_status') THEN
    CREATE TYPE public.repair_status AS ENUM (
      'request_received','awaiting_equipment','equipment_received','under_inspection',
      'quotation_sent','approval_pending','repair_in_progress','quality_testing',
      'ready_for_dispatch','dispatched','completed','on_hold','cancelled'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  organisation text,
  mobile text NOT NULL,
  whatsapp text,
  email text NOT NULL,
  city text,
  state text,
  equipment_category text,
  equipment_name text NOT NULL,
  brand text,
  model_no text,
  serial_no text,
  problem_description text NOT NULL,
  urgency text DEFAULT 'normal',
  preferred_contact text DEFAULT 'phone',
  pickup_required boolean DEFAULT false,
  consent boolean NOT NULL DEFAULT false,
  status public.repair_status NOT NULL DEFAULT 'request_received',
  admin_notes text,
  customer_visible_note text,
  estimated_cost numeric,
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text,
  organisation text,
  subject text,
  message text NOT NULL,
  enquiry_type text DEFAULT 'general',
  status text NOT NULL DEFAULT 'new',
  is_read boolean NOT NULL DEFAULT false,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.repair_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  status public.repair_status NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

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

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS admin_note text;

ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.repair_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_requests TO authenticated;
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_status_history TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.repair_requests TO service_role;
GRANT ALL ON public.enquiries TO service_role;
GRANT ALL ON public.repair_status_history TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "Own roles read" ON public.user_roles;
CREATE POLICY "Own roles read"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone submit repair" ON public.repair_requests;
CREATE POLICY "Anyone submit repair"
  ON public.repair_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage repair_requests" ON public.repair_requests;
CREATE POLICY "Admins manage repair_requests"
  ON public.repair_requests
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Anyone submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone submit enquiry"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage enquiries" ON public.enquiries;
CREATE POLICY "Admins manage enquiries"
  ON public.enquiries
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Admins manage repair_status_history" ON public.repair_status_history;
CREATE POLICY "Admins manage repair_status_history"
  ON public.repair_status_history
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP TRIGGER IF EXISTS repair_updated ON public.repair_requests;
CREATE TRIGGER repair_updated
  BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.notify_new_repair_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications(type, title, message, related_table, related_id)
  VALUES (
    'new_repair',
    'New Repair Request',
    'A new repair request has been received from ' || NEW.full_name || '.',
    'repair_requests',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_enquiry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications(type, title, message, related_table, related_id)
  VALUES (
    'new_enquiry',
    'New Enquiry',
    'A new enquiry has been received from ' || NEW.name || '.',
    'enquiries',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_repair(_code text, _contact text)
RETURNS TABLE (
  request_code text,
  full_name text,
  equipment_name text,
  brand text,
  status public.repair_status,
  customer_visible_note text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    r.request_code,
    r.full_name,
    r.equipment_name,
    r.brand,
    r.status,
    r.customer_visible_note,
    r.created_at,
    r.updated_at
  FROM public.repair_requests r
  WHERE upper(trim(r.request_code)) = upper(trim(_code))
    AND (
      r.mobile = trim(_contact)
      OR r.whatsapp = trim(_contact)
      OR lower(trim(r.email)) = lower(trim(_contact))
    )
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.track_repair_history(_code text, _contact text)
RETURNS TABLE (status public.repair_status, note text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT h.status, h.note, h.created_at
  FROM public.repair_status_history h
  JOIN public.repair_requests r ON r.id = h.request_id
  WHERE upper(trim(r.request_code)) = upper(trim(_code))
    AND (
      r.mobile = trim(_contact)
      OR r.whatsapp = trim(_contact)
      OR lower(trim(r.email)) = lower(trim(_contact))
    )
  ORDER BY h.created_at ASC
$$;

GRANT EXECUTE ON FUNCTION public.track_repair(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_repair_history(text, text) TO anon, authenticated;

DROP TRIGGER IF EXISTS repair_request_notification ON public.repair_requests;
CREATE TRIGGER repair_request_notification
  AFTER INSERT ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_repair_request();

DROP TRIGGER IF EXISTS enquiry_notification ON public.enquiries;
CREATE TRIGGER enquiry_notification
  AFTER INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_enquiry();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['repair_requests','enquiries','notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

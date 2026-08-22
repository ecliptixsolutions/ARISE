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

CREATE TABLE IF NOT EXISTS public.tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text UNIQUE NOT NULL,
  order_id uuid,
  customer_name text NOT NULL,
  customer_email text,
  customer_mobile text,
  equipment_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Admins manage tracking" ON public.tracking;
CREATE POLICY "Admins manage tracking"
  ON public.tracking
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
  VALUES ('new_repair', 'New Repair Request Received', NEW.full_name || ' submitted a repair request for ' || NEW.equipment_name || '.', 'repair_requests', NEW.id::text);

  INSERT INTO public.tracking(tracking_id, customer_name, customer_email, customer_mobile, equipment_name, status)
  VALUES (NEW.request_code, NEW.full_name, NEW.email, NEW.mobile, NEW.equipment_name, 'pending')
  ON CONFLICT (tracking_id) DO UPDATE SET status = EXCLUDED.status, updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS repair_request_notification ON public.repair_requests;
CREATE TRIGGER repair_request_notification
  AFTER INSERT ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_repair_request();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'repair_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.repair_requests;
  END IF;
END $$;

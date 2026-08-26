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

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

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
  request_source text NOT NULL DEFAULT 'Website',
  status public.repair_status NOT NULL DEFAULT 'request_received',
  current_location text NOT NULL DEFAULT 'Office',
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

CREATE TABLE IF NOT EXISTS public.admin_login_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  role public.app_role,
  event_type text NOT NULL,
  success boolean NOT NULL,
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT INSERT ON public.repair_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_requests TO authenticated;
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_status_history TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.repair_requests TO service_role;
GRANT ALL ON public.enquiries TO service_role;
GRANT ALL ON public.repair_status_history TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT ON public.admin_login_audit TO authenticated;
GRANT ALL ON public.admin_login_audit TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own profile read" ON public.profiles;
CREATE POLICY "Own profile read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Own profile update" ON public.profiles;
CREATE POLICY "Own profile update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Own profile insert" ON public.profiles;
CREATE POLICY "Own profile insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone submit repair" ON public.repair_requests;
CREATE POLICY "Anyone submit repair"
  ON public.repair_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone submit enquiry"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read login audit" ON public.admin_login_audit;
CREATE POLICY "Admins read login audit"
  ON public.admin_login_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.prevent_staff_active_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active IS DISTINCT FROM OLD.is_active AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only Super Admin can change staff active status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_active_guard ON public.profiles;
CREATE TRIGGER profiles_active_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_staff_active_self_update();

CREATE TABLE IF NOT EXISTS public.staff_permissions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission)
);

ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_staff_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.staff_permissions p
      JOIN public.profiles pr ON pr.id = p.user_id
      WHERE p.user_id = _user_id
        AND p.permission = _permission
        AND pr.is_active = true
    )
$$;

DROP POLICY IF EXISTS "Admins manage staff permissions" ON public.staff_permissions;
CREATE POLICY "Admins manage staff permissions"
  ON public.staff_permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff read own permissions" ON public.staff_permissions;
CREATE POLICY "Staff read own permissions"
  ON public.staff_permissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Own roles read" ON public.user_roles;
DROP POLICY IF EXISTS "Own or admin roles read" ON public.user_roles;
CREATE POLICY "Own or admin roles read"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read profiles" ON public.profiles;
CREATE POLICY "Admins read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.repair_requests
  ADD COLUMN IF NOT EXISTS current_location text NOT NULL DEFAULT 'Office',
  ADD COLUMN IF NOT EXISTS request_source text NOT NULL DEFAULT 'Website',
  ADD COLUMN IF NOT EXISTS inspection_notes text,
  ADD COLUMN IF NOT EXISTS repair_notes text,
  ADD COLUMN IF NOT EXISTS quality_testing_notes text,
  ADD COLUMN IF NOT EXISTS dispatch_notes text;

ALTER TABLE public.repair_requests
  DROP CONSTRAINT IF EXISTS repair_requests_current_location_check;

ALTER TABLE public.repair_requests
  ADD CONSTRAINT repair_requests_current_location_check
  CHECK (current_location IN ('Office', 'LAB 1', 'LAB 2'));

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_repair_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF public.has_role(actor, 'admin') THEN
    RETURN NEW;
  END IF;

  IF actor IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF (
    to_jsonb(NEW) - ARRAY[
      'status',
      'current_location',
      'customer_visible_note',
      'inspection_notes',
      'repair_notes',
      'quality_testing_notes',
      'dispatch_notes',
      'updated_at'
    ]
  ) IS DISTINCT FROM (
    to_jsonb(OLD) - ARRAY[
      'status',
      'current_location',
      'customer_visible_note',
      'inspection_notes',
      'repair_notes',
      'quality_testing_notes',
      'dispatch_notes',
      'updated_at'
    ]
  ) THEN
    RAISE EXCEPTION 'Missing repair operation permission';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    AND NOT public.has_staff_permission(actor, 'update_status') THEN
    RAISE EXCEPTION 'Missing status update permission';
  END IF;

  IF NEW.current_location IS DISTINCT FROM OLD.current_location
    AND NOT public.has_staff_permission(actor, 'update_location') THEN
    RAISE EXCEPTION 'Missing location update permission';
  END IF;

  IF (NEW.customer_visible_note IS DISTINCT FROM OLD.customer_visible_note
      OR NEW.repair_notes IS DISTINCT FROM OLD.repair_notes)
    AND NOT public.has_staff_permission(actor, 'update_repair_progress') THEN
    RAISE EXCEPTION 'Missing repair progress permission';
  END IF;

  IF NEW.inspection_notes IS DISTINCT FROM OLD.inspection_notes
    AND NOT (
      public.has_staff_permission(actor, 'update_inspection')
      OR public.has_staff_permission(actor, 'update_repair_progress')
    ) THEN
    RAISE EXCEPTION 'Missing inspection update permission';
  END IF;

  IF NEW.quality_testing_notes IS DISTINCT FROM OLD.quality_testing_notes
    AND NOT (
      public.has_staff_permission(actor, 'quality_testing')
      OR public.has_staff_permission(actor, 'update_repair_progress')
    ) THEN
    RAISE EXCEPTION 'Missing quality testing permission';
  END IF;

  IF NEW.dispatch_notes IS DISTINCT FROM OLD.dispatch_notes
    AND NOT (
      public.has_staff_permission(actor, 'dispatch')
      OR public.has_staff_permission(actor, 'update_repair_progress')
    ) THEN
    RAISE EXCEPTION 'Missing dispatch permission';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS repair_operation_guard ON public.repair_requests;
CREATE TRIGGER repair_operation_guard
  BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_repair_update();

DROP TRIGGER IF EXISTS repair_updated ON public.repair_requests;
CREATE TRIGGER repair_updated
  BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.repair_status_history
  ADD COLUMN IF NOT EXISTS old_status public.repair_status,
  ADD COLUMN IF NOT EXISTS new_status public.repair_status,
  ADD COLUMN IF NOT EXISTS old_location text,
  ADD COLUMN IF NOT EXISTS new_location text;

UPDATE public.repair_status_history
SET new_status = status
WHERE new_status IS NULL;

CREATE TABLE IF NOT EXISTS public.repair_request_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  old_status public.repair_status,
  new_status public.repair_status,
  old_location text,
  new_location text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.repair_request_public_updates (
  id uuid PRIMARY KEY,
  request_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  equipment_category text,
  equipment_name text NOT NULL,
  brand text,
  model_no text,
  serial_no text,
  problem_description text NOT NULL,
  status public.repair_status NOT NULL,
  current_location text NOT NULL,
  customer_visible_note text,
  assigned_to text,
  inspection_notes text,
  repair_notes text,
  quality_testing_notes text,
  dispatch_notes text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

ALTER TABLE public.repair_request_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_request_public_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read all repairs" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins update repairs" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins manage repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins read repair requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins update repair requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Staff update repair operations" ON public.repair_requests;
CREATE POLICY "Admins read repair requests"
  ON public.repair_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update repair requests"
  ON public.repair_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff update repair operations"
  ON public.repair_requests
  FOR UPDATE
  TO authenticated
  USING (
    public.has_staff_permission(auth.uid(), 'update_status')
    OR public.has_staff_permission(auth.uid(), 'update_location')
    OR public.has_staff_permission(auth.uid(), 'update_inspection')
    OR public.has_staff_permission(auth.uid(), 'update_repair_progress')
    OR public.has_staff_permission(auth.uid(), 'quality_testing')
    OR public.has_staff_permission(auth.uid(), 'dispatch')
  )
  WITH CHECK (
    public.has_staff_permission(auth.uid(), 'update_status')
    OR public.has_staff_permission(auth.uid(), 'update_location')
    OR public.has_staff_permission(auth.uid(), 'update_inspection')
    OR public.has_staff_permission(auth.uid(), 'update_repair_progress')
    OR public.has_staff_permission(auth.uid(), 'quality_testing')
    OR public.has_staff_permission(auth.uid(), 'dispatch')
  );

DROP POLICY IF EXISTS "Admins manage repair_status_history" ON public.repair_status_history;
DROP POLICY IF EXISTS "Admins read history" ON public.repair_status_history;
DROP POLICY IF EXISTS "Admins insert history" ON public.repair_status_history;
DROP POLICY IF EXISTS "Admins and permitted staff read history" ON public.repair_status_history;
DROP POLICY IF EXISTS "Admins and permitted staff insert history" ON public.repair_status_history;
CREATE POLICY "Admins and permitted staff read history"
  ON public.repair_status_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'repair_details'));

CREATE POLICY "Admins and permitted staff insert history"
  ON public.repair_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'update_status'));

DROP POLICY IF EXISTS "Admins and permitted staff read activity" ON public.repair_request_activity;
CREATE POLICY "Admins and permitted staff read activity"
  ON public.repair_request_activity
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'repair_details'));

DROP POLICY IF EXISTS "Permitted staff read repair public updates" ON public.repair_request_public_updates;
CREATE POLICY "Permitted staff read repair public updates"
  ON public.repair_request_public_updates
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'repair_requests'));

DROP POLICY IF EXISTS "Admins manage enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins read enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins and permitted staff read enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins and permitted staff update enquiries" ON public.enquiries;
CREATE POLICY "Admins and permitted staff read enquiries"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'enquiries'));

CREATE POLICY "Admins and permitted staff update enquiries"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'enquiries'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'enquiries'));

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins and permitted staff read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins and permitted staff update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins and permitted staff delete notifications" ON public.notifications;
CREATE POLICY "Admins and permitted staff read notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'notifications'));

CREATE POLICY "Admins and permitted staff update notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'notifications'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'notifications'));

CREATE POLICY "Admins and permitted staff delete notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'notifications'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_permissions TO authenticated;
GRANT SELECT ON public.repair_request_public_updates TO authenticated;
GRANT SELECT ON public.repair_request_activity TO authenticated;
GRANT ALL ON public.staff_permissions TO service_role;
GRANT ALL ON public.repair_request_activity TO service_role;
GRANT ALL ON public.repair_request_public_updates TO service_role;

CREATE OR REPLACE FUNCTION public.sync_repair_public_update(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.repair_request_public_updates (
    id, request_code, full_name, equipment_category, equipment_name, brand, model_no, serial_no,
    problem_description, status, current_location, customer_visible_note, assigned_to,
    inspection_notes, repair_notes, quality_testing_notes, dispatch_notes, created_at, updated_at
  )
  SELECT
    id, request_code, full_name, equipment_category, equipment_name, brand, model_no, serial_no,
    problem_description, status, current_location, customer_visible_note, assigned_to,
    inspection_notes, repair_notes, quality_testing_notes, dispatch_notes, created_at, updated_at
  FROM public.repair_requests
  WHERE id = _request_id
  ON CONFLICT (id) DO UPDATE SET
    request_code = EXCLUDED.request_code,
    full_name = EXCLUDED.full_name,
    equipment_category = EXCLUDED.equipment_category,
    equipment_name = EXCLUDED.equipment_name,
    brand = EXCLUDED.brand,
    model_no = EXCLUDED.model_no,
    serial_no = EXCLUDED.serial_no,
    problem_description = EXCLUDED.problem_description,
    status = EXCLUDED.status,
    current_location = EXCLUDED.current_location,
    customer_visible_note = EXCLUDED.customer_visible_note,
    assigned_to = EXCLUDED.assigned_to,
    inspection_notes = EXCLUDED.inspection_notes,
    repair_notes = EXCLUDED.repair_notes,
    quality_testing_notes = EXCLUDED.quality_testing_notes,
    dispatch_notes = EXCLUDED.dispatch_notes,
    updated_at = EXCLUDED.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.repair_request_activity_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.sync_repair_public_update(NEW.id);
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, new_status, new_location, note)
    VALUES (NEW.id, actor, 'created', NEW.status, NEW.current_location, 'Request received');
    RETURN NEW;
  END IF;

  PERFORM public.sync_repair_public_update(NEW.id);

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.repair_status_history(request_id, status, old_status, new_status, created_by)
    VALUES (NEW.id, NEW.status, OLD.status, NEW.status, actor);

    INSERT INTO public.repair_request_activity(request_id, actor_id, action, old_status, new_status, note)
    VALUES (NEW.id, actor, 'status_changed', OLD.status, NEW.status, 'Status changed');

    INSERT INTO public.notifications(type, title, message, related_table, related_id)
    VALUES (
      'repair_status',
      'Repair status updated',
      NEW.request_code || ' status updated to ' || initcap(replace(NEW.status::text, '_', ' ')) || '.',
      'repair_requests',
      NEW.id::text
    );
  END IF;

  IF NEW.current_location IS DISTINCT FROM OLD.current_location THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, old_location, new_location, note)
    VALUES (NEW.id, actor, 'location_changed', OLD.current_location, NEW.current_location, 'Location changed');

    INSERT INTO public.notifications(type, title, message, related_table, related_id)
    VALUES (
      'repair_location',
      'Repair location updated',
      NEW.request_code || ' moved to ' || NEW.current_location || '.',
      'repair_requests',
      NEW.id::text
    );
  END IF;

  IF NEW.inspection_notes IS DISTINCT FROM OLD.inspection_notes THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, note)
    VALUES (NEW.id, actor, 'inspection_updated', 'Inspection notes updated');
  END IF;

  IF NEW.repair_notes IS DISTINCT FROM OLD.repair_notes THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, note)
    VALUES (NEW.id, actor, 'repair_updated', 'Repair notes updated');
  END IF;

  IF NEW.quality_testing_notes IS DISTINCT FROM OLD.quality_testing_notes THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, note)
    VALUES (NEW.id, actor, 'quality_testing_updated', 'Quality testing notes updated');
  END IF;

  IF NEW.dispatch_notes IS DISTINCT FROM OLD.dispatch_notes THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, note)
    VALUES (NEW.id, actor, 'dispatch_updated', 'Dispatch notes updated');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS repair_request_activity_insert ON public.repair_requests;
CREATE TRIGGER repair_request_activity_insert
  AFTER INSERT ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.repair_request_activity_trigger();

DROP TRIGGER IF EXISTS repair_request_activity_update ON public.repair_requests;
CREATE TRIGGER repair_request_activity_update
  AFTER UPDATE ON public.repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.repair_request_activity_trigger();

DROP FUNCTION IF EXISTS public.update_repair_operation(
  uuid,
  public.repair_status,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz
);

DROP FUNCTION IF EXISTS public.update_repair_operation(
  uuid,
  public.repair_status,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz
);

CREATE OR REPLACE FUNCTION public.update_repair_operation(
  _request_id uuid,
  _status public.repair_status,
  _current_location text,
  _customer_visible_note text,
  _admin_notes text,
  _inspection_notes text,
  _repair_notes text,
  _quality_testing_notes text,
  _dispatch_notes text,
  _change_note text,
  _expected_updated_at timestamptz
)
RETURNS SETOF public.repair_request_public_updates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.repair_requests;
  actor uuid := auth.uid();
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO existing FROM public.repair_requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Repair request not found';
  END IF;

  IF NOT public.has_role(actor, 'admin') THEN
    IF _status IS DISTINCT FROM existing.status AND NOT public.has_staff_permission(actor, 'update_status') THEN
      RAISE EXCEPTION 'Missing status update permission';
    END IF;
    IF _current_location IS DISTINCT FROM existing.current_location AND NOT public.has_staff_permission(actor, 'update_location') THEN
      RAISE EXCEPTION 'Missing location update permission';
    END IF;
    IF (
      _customer_visible_note IS DISTINCT FROM existing.customer_visible_note
      OR _repair_notes IS DISTINCT FROM existing.repair_notes
    ) AND NOT public.has_staff_permission(actor, 'update_repair_progress') THEN
      RAISE EXCEPTION 'Missing repair progress permission';
    END IF;
    IF _inspection_notes IS DISTINCT FROM existing.inspection_notes
      AND NOT (
        public.has_staff_permission(actor, 'update_inspection')
        OR public.has_staff_permission(actor, 'update_repair_progress')
      ) THEN
      RAISE EXCEPTION 'Missing inspection update permission';
    END IF;
    IF _quality_testing_notes IS DISTINCT FROM existing.quality_testing_notes
      AND NOT (
        public.has_staff_permission(actor, 'quality_testing')
        OR public.has_staff_permission(actor, 'update_repair_progress')
      ) THEN
      RAISE EXCEPTION 'Missing quality testing permission';
    END IF;
    IF _dispatch_notes IS DISTINCT FROM existing.dispatch_notes
      AND NOT (
        public.has_staff_permission(actor, 'dispatch')
        OR public.has_staff_permission(actor, 'update_repair_progress')
      ) THEN
      RAISE EXCEPTION 'Missing dispatch permission';
    END IF;
  END IF;

  IF _current_location NOT IN ('Office', 'LAB 1', 'LAB 2') THEN
    RAISE EXCEPTION 'Invalid repair location';
  END IF;

  IF _expected_updated_at IS NOT NULL AND existing.updated_at <> _expected_updated_at THEN
    RAISE EXCEPTION 'Repair request was updated by another user. Reload and try again.';
  END IF;

  UPDATE public.repair_requests
  SET
    status = _status,
    current_location = _current_location,
    customer_visible_note = _customer_visible_note,
    admin_notes = CASE WHEN public.has_role(actor, 'admin') THEN _admin_notes ELSE admin_notes END,
    inspection_notes = _inspection_notes,
    repair_notes = _repair_notes,
    quality_testing_notes = _quality_testing_notes,
    dispatch_notes = _dispatch_notes
  WHERE id = _request_id;

  IF NULLIF(trim(COALESCE(_change_note, '')), '') IS NOT NULL THEN
    INSERT INTO public.repair_request_activity(request_id, actor_id, action, note)
    VALUES (_request_id, actor, 'note_added', _change_note);
  END IF;

  RETURN QUERY SELECT * FROM public.repair_request_public_updates WHERE id = _request_id;
END;
$$;

DROP FUNCTION IF EXISTS public.track_repair(text, text);

CREATE OR REPLACE FUNCTION public.track_repair(_code text, _contact text)
RETURNS TABLE (
  id uuid,
  request_code text,
  full_name text,
  equipment_name text,
  brand text,
  status public.repair_status,
  current_location text,
  customer_visible_note text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH search AS (
    SELECT
      NULLIF(upper(trim(COALESCE(_code, ''))), '') AS code,
      NULLIF(lower(trim(COALESCE(_contact, ''))), '') AS contact,
      CASE
        WHEN length(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g')) > 10
          AND left(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g'), 2) = '91'
          THEN right(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g'), 10)
        ELSE regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g')
      END AS contact_phone
  )
  SELECT
    r.id,
    r.request_code,
    r.full_name,
    r.equipment_name,
    r.brand,
    r.status,
    CASE
      WHEN r.current_location = 'Office' THEN 'Office'
      WHEN r.current_location IS NOT NULL THEN 'Service Lab'
      ELSE NULL
    END,
    r.customer_visible_note,
    r.created_at,
    r.updated_at
  FROM public.repair_requests r
  CROSS JOIN search s
  WHERE (s.code IS NOT NULL OR s.contact IS NOT NULL)
    AND (s.code IS NULL OR upper(trim(r.request_code)) = s.code)
    AND (
      s.contact IS NULL
      OR lower(trim(r.email)) = s.contact
      OR (
        s.contact_phone <> ''
        AND (
          CASE
            WHEN length(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g')) > 10
              AND left(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g'), 2) = '91'
              THEN right(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g'), 10)
            ELSE regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g')
          END = s.contact_phone
          OR CASE
            WHEN length(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g')) > 10
              AND left(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g'), 2) = '91'
              THEN right(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g'), 10)
            ELSE regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g')
          END = s.contact_phone
        )
      )
    )
  ORDER BY r.created_at DESC
  LIMIT 25
$$;

DROP FUNCTION IF EXISTS public.track_repair_history(text, text);

CREATE OR REPLACE FUNCTION public.track_repair_history(_code text, _contact text)
RETURNS TABLE (status public.repair_status, current_location text, note text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH search AS (
    SELECT
      NULLIF(upper(trim(COALESCE(_code, ''))), '') AS code,
      NULLIF(lower(trim(COALESCE(_contact, ''))), '') AS contact,
      CASE
        WHEN length(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g')) > 10
          AND left(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g'), 2) = '91'
          THEN right(regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g'), 10)
        ELSE regexp_replace(COALESCE(_contact, ''), '[^0-9]', '', 'g')
      END AS contact_phone
  )
  SELECT
    COALESCE(a.new_status, r.status) AS status,
    CASE
      WHEN COALESCE(a.new_location, r.current_location) = 'Office' THEN 'Office'
      WHEN COALESCE(a.new_location, r.current_location) IS NOT NULL THEN 'Service Lab'
      ELSE NULL
    END AS current_location,
    a.note,
    a.created_at
  FROM public.repair_request_activity a
  JOIN public.repair_requests r ON r.id = a.request_id
  CROSS JOIN search s
  WHERE (s.code IS NOT NULL OR s.contact IS NOT NULL)
    AND (s.code IS NULL OR upper(trim(r.request_code)) = s.code)
    AND (
      s.contact IS NULL
      OR lower(trim(r.email)) = s.contact
      OR (
        s.contact_phone <> ''
        AND (
          CASE
            WHEN length(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g')) > 10
              AND left(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g'), 2) = '91'
              THEN right(regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g'), 10)
            ELSE regexp_replace(COALESCE(r.mobile, ''), '[^0-9]', '', 'g')
          END = s.contact_phone
          OR CASE
            WHEN length(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g')) > 10
              AND left(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g'), 2) = '91'
              THEN right(regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g'), 10)
            ELSE regexp_replace(COALESCE(r.whatsapp, ''), '[^0-9]', '', 'g')
          END = s.contact_phone
        )
      )
    )
  ORDER BY a.created_at ASC
$$;

GRANT EXECUTE ON FUNCTION public.update_repair_operation(uuid, public.repair_status, text, text, text, text, text, text, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_repair(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_repair_history(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_staff_permission(uuid, text) TO authenticated;

DO $$
BEGIN
  IF to_regclass('public.services') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage services" ON public.services;
    DROP POLICY IF EXISTS "Admins and permitted staff manage services" ON public.services;
    DROP POLICY IF EXISTS "Public read published services" ON public.services;
    CREATE POLICY "Public read published services"
      ON public.services
      FOR SELECT
      TO anon, authenticated
      USING (
        is_published = true
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_staff_permission(auth.uid(), 'services')
      );
    CREATE POLICY "Admins and permitted staff manage services"
      ON public.services
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'services'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'services'));
  END IF;

  IF to_regclass('public.website_images') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage website_images" ON public.website_images;
    DROP POLICY IF EXISTS "Admins and permitted staff manage website_images" ON public.website_images;
    CREATE POLICY "Admins and permitted staff manage website_images"
      ON public.website_images
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'images'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'images'));
  END IF;

  IF to_regclass('public.tracking') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage tracking" ON public.tracking;
    DROP POLICY IF EXISTS "Admins and permitted staff manage tracking" ON public.tracking;
    CREATE POLICY "Admins and permitted staff manage tracking"
      ON public.tracking
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'tracking'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'tracking'));
  END IF;

  IF to_regclass('public.testimonials') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
    DROP POLICY IF EXISTS "Admins and permitted staff manage testimonials" ON public.testimonials;
    CREATE POLICY "Admins and permitted staff manage testimonials"
      ON public.testimonials
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'testimonials'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'testimonials'));
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins and permitted staff manage orders" ON public.orders;
    CREATE POLICY "Admins and permitted staff manage orders"
      ON public.orders
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'));
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage order_items" ON public.order_items;
    DROP POLICY IF EXISTS "Admins and permitted staff manage order_items" ON public.order_items;
    CREATE POLICY "Admins and permitted staff manage order_items"
      ON public.order_items
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'));
  END IF;

  IF to_regclass('public.order_events') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins manage order_events" ON public.order_events;
    DROP POLICY IF EXISTS "Admins and permitted staff manage order_events" ON public.order_events;
    CREATE POLICY "Admins and permitted staff manage order_events"
      ON public.order_events
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'orders'));
  END IF;
END $$;

DROP POLICY IF EXISTS "Admins manage admin images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and permitted staff manage admin images" ON storage.objects;
CREATE POLICY "Admins and permitted staff manage admin images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'admin-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'images')))
  WITH CHECK (bucket_id = 'admin-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'images')));

DROP POLICY IF EXISTS "Admins manage service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and permitted staff manage service images" ON storage.objects;
CREATE POLICY "Admins and permitted staff manage service images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'service-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'services')))
  WITH CHECK (bucket_id = 'service-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_staff_permission(auth.uid(), 'services')));

INSERT INTO public.repair_request_public_updates (
  id, request_code, full_name, equipment_category, equipment_name, brand, model_no, serial_no,
  problem_description, status, current_location, customer_visible_note, assigned_to,
  inspection_notes, repair_notes, quality_testing_notes, dispatch_notes, created_at, updated_at
)
SELECT
  id, request_code, full_name, equipment_category, equipment_name, brand, model_no, serial_no,
  problem_description, status, current_location, customer_visible_note, assigned_to,
  inspection_notes, repair_notes, quality_testing_notes, dispatch_notes, created_at, updated_at
FROM public.repair_requests
ON CONFLICT (id) DO UPDATE SET
  request_code = EXCLUDED.request_code,
  full_name = EXCLUDED.full_name,
  equipment_category = EXCLUDED.equipment_category,
  equipment_name = EXCLUDED.equipment_name,
  brand = EXCLUDED.brand,
  model_no = EXCLUDED.model_no,
  serial_no = EXCLUDED.serial_no,
  problem_description = EXCLUDED.problem_description,
  status = EXCLUDED.status,
  current_location = EXCLUDED.current_location,
  customer_visible_note = EXCLUDED.customer_visible_note,
  assigned_to = EXCLUDED.assigned_to,
  inspection_notes = EXCLUDED.inspection_notes,
  repair_notes = EXCLUDED.repair_notes,
  quality_testing_notes = EXCLUDED.quality_testing_notes,
  dispatch_notes = EXCLUDED.dispatch_notes,
  updated_at = EXCLUDED.updated_at;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['repair_requests','repair_request_public_updates','repair_request_activity','repair_status_history','enquiries','notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

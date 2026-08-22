DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','staff','user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Own roles read" ON public.user_roles;
CREATE POLICY "Own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

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

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repair_status') THEN
    CREATE TYPE public.repair_status AS ENUM (
      'request_received','awaiting_equipment','equipment_received','under_inspection',
      'quotation_sent','approval_pending','repair_in_progress','quality_testing',
      'ready_for_dispatch','dispatched','completed','on_hold','cancelled'
    );
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_mobile text,
  shipping_address text,
  service_name text,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  tracking_id text,
  fulfillment_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  quantity int NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  status text,
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

CREATE TABLE IF NOT EXISTS public.services (
  slug text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  short_description text NOT NULL DEFAULT '',
  detailed_description text NOT NULL DEFAULT '',
  common_problems text[] NOT NULL DEFAULT '{}',
  carousel_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_image_id text,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT '';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS detailed_description text NOT NULL DEFAULT '';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS common_problems text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS carousel_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS primary_image_id text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.website_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'admin-images',
  path text NOT NULL,
  url text NOT NULL,
  alt_text text,
  category text NOT NULL DEFAULT 'Other',
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);

ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tracking','orders','order_items','order_events','notifications','website_images','services','enquiries','repair_requests','repair_status_history'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Admins manage %I" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''staff'')) WITH CHECK (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''staff''))', t, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Public read published services" ON public.services;
CREATE POLICY "Public read published services" ON public.services FOR SELECT TO anon, authenticated USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "Anyone submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone submit enquiry" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone submit repair" ON public.repair_requests;
CREATE POLICY "Anyone submit repair" ON public.repair_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS orders_updated ON public.orders;
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS tracking_updated ON public.tracking;
CREATE TRIGGER tracking_updated BEFORE UPDATE ON public.tracking FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS website_images_updated ON public.website_images;
CREATE TRIGGER website_images_updated BEFORE UPDATE ON public.website_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS services_updated ON public.services;
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS repair_updated ON public.repair_requests;
CREATE TRIGGER repair_updated BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.notify_new_enquiry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications(type, title, message, related_table, related_id)
  VALUES ('new_enquiry', 'New Contact Enquiry Received', NEW.name || ' submitted a contact enquiry.', 'enquiries', NEW.id::text);
  RETURN NEW;
END;
$$;

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

DROP TRIGGER IF EXISTS enquiry_notification ON public.enquiries;
CREATE TRIGGER enquiry_notification AFTER INSERT ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.notify_new_enquiry();
DROP TRIGGER IF EXISTS repair_request_notification ON public.repair_requests;
CREATE TRIGGER repair_request_notification AFTER INSERT ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.notify_new_repair_request();

CREATE OR REPLACE FUNCTION public.order_status_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_events(order_id, title, message, status)
    VALUES (NEW.id, 'Order received', 'Order ' || NEW.order_number || ' was received.', NEW.status);
    INSERT INTO public.notifications(type, title, message, related_table, related_id)
    VALUES ('new_order', 'New Order Received', 'Order ' || NEW.order_number || ' from ' || NEW.customer_name, 'orders', NEW.id::text);
    IF NEW.tracking_id IS NOT NULL THEN
      INSERT INTO public.tracking(tracking_id, order_id, customer_name, customer_email, customer_mobile, equipment_name, status)
      VALUES (NEW.tracking_id, NEW.id, NEW.customer_name, NEW.customer_email, NEW.customer_mobile, COALESCE(NEW.service_name, 'Order'), NEW.status)
      ON CONFLICT (tracking_id) DO UPDATE SET status = EXCLUDED.status, updated_at = now();
    END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_events(order_id, title, message, status)
    VALUES (NEW.id, 'Status updated', 'Order status changed to ' || replace(NEW.status, '_', ' ') || '.', NEW.status);
    IF NEW.tracking_id IS NOT NULL THEN
      UPDATE public.tracking SET status = NEW.status, updated_at = now() WHERE tracking_id = NEW.tracking_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_insert_event ON public.orders;
CREATE TRIGGER order_insert_event AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_status_event();
DROP TRIGGER IF EXISTS order_update_event ON public.orders;
CREATE TRIGGER order_update_event AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_status_event();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('admin-images', 'admin-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('service-images', 'service-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read admin images" ON storage.objects;
CREATE POLICY "Public read admin images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'admin-images');
DROP POLICY IF EXISTS "Admins manage admin images" ON storage.objects;
CREATE POLICY "Admins manage admin images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'admin-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))) WITH CHECK (bucket_id = 'admin-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

DROP POLICY IF EXISTS "Public read service images" ON storage.objects;
CREATE POLICY "Public read service images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'service-images');
DROP POLICY IF EXISTS "Admins manage service images" ON storage.objects;
CREATE POLICY "Admins manage service images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'service-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))) WITH CHECK (bucket_id = 'service-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['enquiries','repair_requests','orders','notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

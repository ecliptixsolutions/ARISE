
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TYPE public.app_role AS ENUM ('admin','staff','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TYPE public.repair_status AS ENUM (
  'request_received','awaiting_equipment','equipment_received','under_inspection',
  'quotation_sent','approval_pending','repair_in_progress','quality_testing',
  'ready_for_dispatch','dispatched','completed','on_hold','cancelled'
);

CREATE TABLE public.repair_requests (
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
GRANT SELECT, INSERT ON public.repair_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.repair_requests TO authenticated;
GRANT ALL ON public.repair_requests TO service_role;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit repair" ON public.repair_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read all repairs" ON public.repair_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Admins update repairs" ON public.repair_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE TRIGGER repair_updated BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.repair_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  status public.repair_status NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.repair_status_history TO authenticated;
GRANT ALL ON public.repair_status_history TO service_role;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read history" ON public.repair_status_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Admins insert history" ON public.repair_status_history FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE OR REPLACE FUNCTION public.track_repair(_code text, _contact text)
RETURNS TABLE (
  request_code text, full_name text, equipment_name text, brand text,
  status public.repair_status, customer_visible_note text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.request_code, r.full_name, r.equipment_name, r.brand,
         r.status, r.customer_visible_note, r.created_at, r.updated_at
  FROM public.repair_requests r
  WHERE r.request_code = _code
    AND (r.mobile = _contact OR lower(r.email) = lower(_contact) OR r.whatsapp = _contact)
$$;
GRANT EXECUTE ON FUNCTION public.track_repair(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_repair_history(_code text, _contact text)
RETURNS TABLE (status public.repair_status, note text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT h.status, h.note, h.created_at
  FROM public.repair_status_history h
  JOIN public.repair_requests r ON r.id = h.request_id
  WHERE r.request_code = _code
    AND (r.mobile = _contact OR lower(r.email) = lower(_contact) OR r.whatsapp = _contact)
  ORDER BY h.created_at ASC
$$;
GRANT EXECUTE ON FUNCTION public.track_repair_history(text, text) TO anon, authenticated;

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text,
  organisation text,
  subject text,
  message text NOT NULL,
  enquiry_type text DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit enquiry" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "Admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  organisation text,
  city text,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL,
  is_sample boolean NOT NULL DEFAULT true,
  is_approved boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_approved = true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.testimonials (customer_name, organisation, city, rating, feedback, is_sample, is_featured, sort_order) VALUES
('Sample Biomedical Head','Multispeciality Hospital (Sample)','—',5,'Sample testimonial content — replace or approve from the admin panel. Arise handled a component-level camera head repair professionally and returned the equipment tested and ready to use.',true,true,1),
('Sample Endoscopy Nurse','Endoscopy Centre (Sample)','—',5,'Sample testimonial content — replace or approve from the admin panel. Fast diagnosis, transparent quotation and clear communication throughout the repair.',true,true,2),
('Sample Purchase Manager','Diagnostic Centre (Sample)','—',4,'Sample testimonial content — replace or approve from the admin panel. Reliable partner for rigid scope and processor servicing.',true,true,3);

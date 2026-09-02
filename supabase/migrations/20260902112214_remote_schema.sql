-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM service_role;

CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE TYPE public.clearance_level AS ENUM (
  'public',
  'auth',
  'known',
  'friends',
  'close',
  'admin'
);

CREATE FUNCTION public.admin_guestbook()
  RETURNS TABLE (
    id           uuid,
    user_id      uuid,
    strokes      jsonb,
    created_at   date,
    updated_at   timestamp with time zone,
    display_name text,
    email        text,
    avatar_url   text
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT
    g.id,
    g.user_id,
    g.strokes,
    g.created_at,
    g.updated_at,
    g.display_name,
    u.email,
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') AS avatar_url
  FROM public.guestbook g
  LEFT JOIN auth.users u ON u.id = g.user_id
  WHERE public.get_my_role() = 'admin';
$function$;

REVOKE ALL ON FUNCTION public.admin_guestbook() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_guestbook() TO authenticated;

GRANT ALL ON FUNCTION public.admin_guestbook() TO service_role;

CREATE FUNCTION public.admin_set_role (
  target_user_id uuid,
  new_role       text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  IF public.get_my_role() <> 'admin' THEN
    RAISE insufficient_privilege USING message = 'Only admins can change roles';
  END IF;

  IF new_role NOT IN ('public','auth','known','friends','close','admin') THEN
    RAISE invalid_parameter_value USING message = 'Invalid role value';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_role(uuid, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_set_role(uuid, text) TO authenticated;

GRANT ALL ON FUNCTION public.admin_set_role(uuid, text) TO service_role;

CREATE FUNCTION public.admin_user_roles()
  RETURNS TABLE (
    user_id             uuid,
    role                text,
    requested_clearance boolean,
    created_at          timestamp with time zone,
    email               text,
    full_name           text,
    avatar_url          text,
    last_sign_in_at     timestamp with time zone
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT
    ur.user_id,
    ur.role,
    COALESCE(ur.requested_clearance,
      (au.raw_user_meta_data->>'requested_clearance')::boolean,
      (au.raw_user_meta_data->>'requestedClearance')::boolean, false) AS requested_clearance,
    ur.created_at,
    au.email,
    au.raw_user_meta_data->>'full_name' AS full_name,
    au.raw_user_meta_data->>'avatar_url' AS avatar_url,
    au.last_sign_in_at
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON au.id = ur.user_id
  WHERE public.get_my_role() = 'admin';
$function$;

REVOKE ALL ON FUNCTION public.admin_user_roles() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_user_roles() TO authenticated;

GRANT ALL ON FUNCTION public.admin_user_roles() TO service_role;

CREATE FUNCTION public.clearance_rank (
  lvl public.clearance_level
)
  RETURNS integer
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO ''
  AS $function$
  SELECT CASE lvl
    WHEN 'public'  THEN 0
    WHEN 'auth'    THEN 1
    WHEN 'known'   THEN 2
    WHEN 'friends' THEN 3
    WHEN 'close'   THEN 4
    WHEN 'admin'   THEN 5
  END;
$function$;

GRANT ALL ON FUNCTION public.clearance_rank(public.clearance_level) TO anon;

GRANT ALL ON FUNCTION public.clearance_rank(public.clearance_level) TO authenticated;

GRANT ALL ON FUNCTION public.clearance_rank(public.clearance_level) TO service_role;

CREATE FUNCTION public.get_my_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

GRANT ALL ON FUNCTION public.get_my_role() TO anon;

GRANT ALL ON FUNCTION public.get_my_role() TO authenticated;

GRANT ALL ON FUNCTION public.get_my_role() TO service_role;

CREATE FUNCTION public.handle_new_user_discord()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  webhook_url text;
  avatar      text;
  full_name   text;
  provider    text;
  embed       jsonb;
  payload     jsonb;
BEGIN
  SELECT value INTO webhook_url FROM public.app_config WHERE key = 'discord_webhook_url';
  IF webhook_url IS NULL OR webhook_url = '' THEN
    RETURN NEW;
  END IF;

  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name',
                        NEW.raw_user_meta_data->>'name', 'Unknown');
  provider  := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  avatar    := COALESCE(NEW.raw_user_meta_data->>'avatar_url',
                        NEW.raw_user_meta_data->>'picture');

  embed := jsonb_build_object(
    'title',     'New signup — ' || full_name,
    'url',       'https://psiderman.com/suitlady',
    'color',     5793266,
    'timestamp', NEW.created_at,
    'fields', jsonb_build_array(
      jsonb_build_object('name', 'Name',     'value', full_name,              'inline', true),
      jsonb_build_object('name', 'Email',    'value', COALESCE(NEW.email, '—'),'inline', true),
      jsonb_build_object('name', 'Provider', 'value', provider,               'inline', true)
    )
  );

  IF avatar IS NOT NULL AND avatar ~ '^https?://' THEN
    embed := jsonb_set(embed, '{thumbnail}', jsonb_build_object('url', avatar));
  END IF;

  payload := jsonb_build_object('embeds', jsonb_build_array(embed));

  BEGIN
    PERFORM net.http_post(
      url     := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body    := payload
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_auth_user_created_discord
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_discord();

GRANT ALL ON FUNCTION public.handle_new_user_discord() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user_discord() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user_discord() TO service_role;

CREATE FUNCTION public.handle_new_user_role()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role, requested_clearance)
  VALUES (new.id, 'auth', COALESCE((new.raw_user_meta_data->>'requested_clearance')::boolean,
    (new.raw_user_meta_data->>'requestedClearance')::boolean, false))
  ON CONFLICT (user_id) DO UPDATE
  SET requested_clearance = EXCLUDED.requested_clearance
  WHERE user_roles.role = 'auth' AND EXCLUDED.requested_clearance = true;
  RETURN new;
END;
$function$;

GRANT ALL ON FUNCTION public.handle_new_user_role() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user_role() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user_role() TO service_role;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'auth')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

CREATE FUNCTION public.handle_storage_image_delete()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  IF OLD.bucket_id = 'travel' THEN
    DELETE FROM public.trip_images
    WHERE storage_path = OLD.name OR storage_object_id = OLD.id;
  END IF;
  RETURN OLD;
END;
$function$;

GRANT ALL ON FUNCTION public.handle_storage_image_delete() TO anon;

GRANT ALL ON FUNCTION public.handle_storage_image_delete() TO authenticated;

GRANT ALL ON FUNCTION public.handle_storage_image_delete() TO service_role;

CREATE FUNCTION public.handle_storage_image_upsert()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  payload jsonb;
  secret_value text;
BEGIN
  IF NEW.bucket_id = 'travel' AND NEW.name NOT LIKE '.%' AND NEW.name NOT LIKE '%/.%' THEN
    SELECT value INTO secret_value FROM public.app_config WHERE key = 'webhook_secret';

    payload := jsonb_build_object(
      'type', TG_OP,
      'record', jsonb_build_object(
        'id', NEW.id, 'bucket_id', NEW.bucket_id, 'name', NEW.name,
        'metadata', NEW.metadata, 'updated_at', NEW.updated_at
      ),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('id', OLD.id, 'name', OLD.name) ELSE NULL END
    );

    PERFORM net.http_post(
      url := 'https://wacdcdmjviaakotdsltf.supabase.co/functions/v1/process-trip-image',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'webhook-secret', secret_value
      ),
      body := payload
    );
  END IF;
  RETURN NEW;
END;
$function$;

GRANT ALL ON FUNCTION public.handle_storage_image_upsert() TO anon;

GRANT ALL ON FUNCTION public.handle_storage_image_upsert() TO authenticated;

GRANT ALL ON FUNCTION public.handle_storage_image_upsert() TO service_role;

CREATE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

GRANT ALL ON FUNCTION public.handle_updated_at() TO anon;

GRANT ALL ON FUNCTION public.handle_updated_at() TO authenticated;

GRANT ALL ON FUNCTION public.handle_updated_at() TO service_role;

CREATE FUNCTION public.has_clearance (
  uid                uuid,
  required_clearance public.clearance_level
)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE
  user_role text;
  user_rank integer := 0;
BEGIN
  IF required_clearance = 'public' THEN RETURN true; END IF;
  IF uid IS NULL THEN RETURN false; END IF;

  SELECT role INTO user_role FROM public.user_roles WHERE user_id = uid;

  IF user_role IS NULL THEN
    user_rank := 1;
  ELSE
    BEGIN
      user_rank := public.clearance_rank(user_role::public.clearance_level);
    EXCEPTION WHEN invalid_text_representation THEN
      user_rank := 1;
    END;
  END IF;

  RETURN user_rank >= public.clearance_rank(required_clearance);
END;
$function$;

GRANT ALL ON FUNCTION public.has_clearance(uuid, public.clearance_level) TO anon;

GRANT ALL ON FUNCTION public.has_clearance(uuid, public.clearance_level) TO authenticated;

GRANT ALL ON FUNCTION public.has_clearance(uuid, public.clearance_level) TO service_role;

CREATE FUNCTION public.is_friend (
  user_id uuid
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  return exists (
    select 1 from public.user_roles
    where user_roles.user_id = $1
    and user_roles.role in ('friend', 'admin')
  );
end;
$function$;

GRANT ALL ON FUNCTION public.is_friend(uuid) TO anon;

GRANT ALL ON FUNCTION public.is_friend(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.is_friend(uuid) TO service_role;

CREATE FUNCTION public.record_page_view (
  p_path text
)
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  INSERT INTO public.user_page_views (user_id, path)
  SELECT auth.uid(), p_path
  WHERE auth.uid() IS NOT NULL
    AND public.get_my_role() <> 'admin'
  ON CONFLICT (user_id, path)
  DO UPDATE SET
    views = public.user_page_views.views + 1,
    last_visited_at = now();
  $function$;

GRANT ALL ON FUNCTION public.record_page_view(text) TO anon;

GRANT ALL ON FUNCTION public.record_page_view(text) TO authenticated;

GRANT ALL ON FUNCTION public.record_page_view(text) TO service_role;

CREATE TABLE public.app_config (
  key   text NOT NULL,
  value text NOT NULL
);

ALTER TABLE public.app_config
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.app_config
  ADD CONSTRAINT app_config_pkey PRIMARY KEY (key);

GRANT ALL ON public.app_config TO service_role;

CREATE TABLE public.blog (
  slug       text                     NOT NULL,
  title      text                     NOT NULL,
  excerpt    text,
  date       date                     DEFAULT CURRENT_DATE NOT NULL,
  clearance  public.clearance_level   DEFAULT 'admin'::public.clearance_level NOT NULL,
  is_active  boolean                  DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  minutes    numeric
);

ALTER TABLE public.blog
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.blog
  ADD CONSTRAINT blog_minutes_check CHECK (minutes > 0::numeric);

ALTER TABLE public.blog
  ADD CONSTRAINT blog_pkey PRIMARY KEY (slug);

GRANT ALL ON public.blog TO anon;

GRANT ALL ON public.blog TO authenticated;

GRANT ALL ON public.blog TO service_role;

CREATE TRIGGER set_blog_updated_at
  BEFORE UPDATE ON public.blog
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Admins can manage blog" ON public.blog
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Anyone can view active blog posts" ON public.blog
  FOR SELECT
  USING (is_active);

CREATE POLICY "Service role full access on blog" ON public.blog
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.guestbook (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id      uuid                     NOT NULL,
  display_name text                     NOT NULL,
  strokes      jsonb                    NOT NULL,
  updated_at   timestamp with time zone DEFAULT now(),
  created_at   date
);

ALTER TABLE public.guestbook
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.guestbook
  ADD CONSTRAINT guestbook_pkey PRIMARY KEY (id);

ALTER TABLE public.guestbook
  ADD CONSTRAINT guestbook_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

GRANT ALL ON public.guestbook TO anon;

GRANT ALL ON public.guestbook TO authenticated;

GRANT ALL ON public.guestbook TO service_role;

CREATE INDEX guestbook_user_id_idx ON public.guestbook (user_id);

CREATE POLICY "Admins can delete guestbook" ON public.guestbook
  FOR DELETE
  TO authenticated
  USING ((public.get_my_role() = 'admin'::text));

CREATE POLICY "Anyone can view guestbook entries" ON public.guestbook
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own guestbook entries" ON public.guestbook
  FOR INSERT
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Users can update their own guestbook entries" ON public.guestbook
  FOR UPDATE
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.quotes (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  content    text                     NOT NULL,
  date       date                     DEFAULT CURRENT_DATE NOT NULL,
  clearance  public.clearance_level   DEFAULT 'public'::public.clearance_level NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  title      text                     NOT NULL
);

ALTER TABLE public.quotes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);

GRANT ALL ON public.quotes TO anon;

GRANT ALL ON public.quotes TO authenticated;

GRANT ALL ON public.quotes TO service_role;

CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Admins can manage quotes" ON public.quotes
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Allow select quotes based on clearance" ON public.quotes
  FOR SELECT
  USING ((public.has_clearance(( SELECT auth.uid() AS uid), clearance) OR (( SELECT public.get_my_role() AS get_my_role) = 'admin'::text)));

CREATE POLICY "Service role full access on quotes" ON public.quotes
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.trip_images (
  id                uuid                     DEFAULT gen_random_uuid() NOT NULL,
  storage_object_id uuid,
  storage_path      text                     NOT NULL,
  trip_slug         text                     NOT NULL,
  date_taken        timestamp with time zone,
  lat               double precision,
  lng               double precision,
  width             integer,
  height            integer,
  caption           text,
  sort_order        integer,
  created_at        timestamp with time zone DEFAULT now() NOT NULL,
  updated_at        timestamp with time zone DEFAULT now() NOT NULL,
  clearance         public.clearance_level   DEFAULT 'public'::public.clearance_level NOT NULL
);

ALTER TABLE public.trip_images
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trip_images
  ADD CONSTRAINT trip_images_pkey PRIMARY KEY (id);

ALTER TABLE public.trip_images
  ADD CONSTRAINT trip_images_storage_object_id_fkey FOREIGN KEY (storage_object_id) REFERENCES storage.objects(id) ON DELETE CASCADE;

ALTER TABLE public.trip_images
  ADD CONSTRAINT trip_images_storage_path_key UNIQUE (storage_path);

GRANT ALL ON public.trip_images TO anon;

GRANT ALL ON public.trip_images TO authenticated;

GRANT ALL ON public.trip_images TO service_role;

CREATE INDEX trip_images_trip_slug_idx ON public.trip_images (trip_slug, sort_order);

CREATE INDEX idx_trip_images_date_taken ON public.trip_images (date_taken);

CREATE INDEX idx_trip_images_trip_slug ON public.trip_images (trip_slug);

CREATE INDEX trip_images_storage_object_id_idx ON public.trip_images (storage_object_id);

CREATE TRIGGER set_trip_images_updated_at
  BEFORE UPDATE ON public.trip_images
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "Admins can manage trip_images" ON public.trip_images
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Allow select trip_images based on clearance" ON public.trip_images
  FOR SELECT
  USING ((public.has_clearance(( SELECT auth.uid() AS uid), clearance) OR (( SELECT public.get_my_role() AS get_my_role) = 'admin'::text)));

CREATE POLICY "Service role full access on trip_images" ON public.trip_images
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.trips (
  slug           text                     NOT NULL,
  title          text                     NOT NULL,
  date           date                     NOT NULL,
  description    text[]                   DEFAULT '{}'::text[] NOT NULL,
  instagram_link text,
  maps_list_link text,
  repeat_visit   boolean                  DEFAULT false NOT NULL,
  created_at     timestamp with time zone DEFAULT now() NOT NULL,
  subtitle       text,
  clearance      public.clearance_level   DEFAULT 'public'::public.clearance_level NOT NULL
);

ALTER TABLE public.trips
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_pkey PRIMARY KEY (slug);

ALTER TABLE public.trip_images
  ADD CONSTRAINT trip_images_trip_slug_fkey FOREIGN KEY (trip_slug) REFERENCES public.trips(slug) ON DELETE CASCADE;

GRANT ALL ON public.trips TO anon;

GRANT ALL ON public.trips TO authenticated;

GRANT ALL ON public.trips TO service_role;

CREATE POLICY "Admins can manage trips" ON public.trips
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Allow select trips based on clearance" ON public.trips
  FOR SELECT
  USING ((public.has_clearance(( SELECT auth.uid() AS uid), clearance) OR (( SELECT public.get_my_role() AS get_my_role) = 'admin'::text)));

CREATE TABLE public.user_page_views (
  user_id         uuid                     NOT NULL,
  path            text                     NOT NULL,
  views           integer                  DEFAULT 1 NOT NULL,
  last_visited_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_page_views
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_page_views
  ADD CONSTRAINT user_page_views_pkey PRIMARY KEY (user_id, path);

ALTER TABLE public.user_page_views
  ADD CONSTRAINT user_page_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.user_page_views TO anon;

GRANT ALL ON public.user_page_views TO authenticated;

GRANT ALL ON public.user_page_views TO service_role;

CREATE POLICY "Admins can read page views" ON public.user_page_views
  FOR SELECT
  TO authenticated
  USING ((public.get_my_role() = 'admin'::text));

CREATE TABLE public.user_roles (
  user_id             uuid                     NOT NULL,
  role                text                     DEFAULT 'auth'::text NOT NULL,
  created_at          timestamp with time zone DEFAULT now(),
  requested_clearance boolean                  DEFAULT false
);

ALTER TABLE public.user_roles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id);

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check CHECK (role = ANY (ARRAY['public'::text, 'auth'::text, 'known'::text, 'friends'::text, 'close'::text, 'admin'::text]));

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.user_roles TO anon;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON public.user_roles TO authenticated;

GRANT UPDATE (requested_clearance) ON public.user_roles TO authenticated;

GRANT ALL ON public.user_roles TO service_role;

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Users can update own requested clearance" ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (role = ( SELECT user_roles_1.role
   FROM public.user_roles user_roles_1
  WHERE (user_roles_1.user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT public.get_my_role() AS get_my_role) = 'admin'::text)));

CREATE TABLE public.work_people (
  "orgId"     text NOT NULL,
  name        text NOT NULL,
  "imageName" text NOT NULL,
  linkedin    text,
  quote       text
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.blog, TABLE public.guestbook, TABLE public.trips, TABLE public.user_roles, TABLE public.work_people;

ALTER TABLE public.work_people
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.work_people
  ADD CONSTRAINT work_people_pkey PRIMARY KEY ("orgId", name);

GRANT ALL ON public.work_people TO anon;

GRANT ALL ON public.work_people TO authenticated;

GRANT ALL ON public.work_people TO service_role;

CREATE POLICY "Admins can manage work_people" ON public.work_people
  TO authenticated
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = 'admin'::text));

CREATE POLICY "Enable read access for all users" ON public.work_people
  FOR SELECT
  USING (true);

CREATE TRIGGER on_storage_travel_image_deleted
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_image_delete();

CREATE TRIGGER on_storage_travel_image_upsert
  AFTER INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_image_upsert();

-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM service_role;

CREATE TABLE public.variables (
  id         text                     DEFAULT ''::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  value      json                     NOT NULL
);

ALTER TABLE public.variables
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.variables
  ADD CONSTRAINT variables_pkey PRIMARY KEY (id);

GRANT ALL ON public.variables TO anon;

GRANT ALL ON public.variables TO authenticated;

GRANT ALL ON public.variables TO service_role;

CREATE POLICY "Enable read access for all users" ON public.variables
  FOR SELECT
  USING (true);

CREATE TABLE public.work (
  org_id     text,
  start_date date    NOT NULL,
  end_date   date,
  org_name   text    NOT NULL,
  role       text,
  is_left    boolean DEFAULT true NOT NULL,
  emoji      text
);

ALTER TABLE public.work
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.work
  ADD CONSTRAINT work_pkey PRIMARY KEY (start_date, org_name);

GRANT ALL ON public.work TO anon;

GRANT ALL ON public.work TO authenticated;

GRANT ALL ON public.work TO service_role;

CREATE POLICY "Enable read access for all users" ON public.work
  FOR SELECT
  USING (true);

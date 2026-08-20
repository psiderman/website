create table public.movies (
  id text primary key,
  title text not null,
  rating numeric,
  cover text,
  review text,
  link text,
  watched_date timestamp with time zone
);

alter table public.movies enable row level security;
create policy "Allow public read access" on public.movies for select using (true);

CREATE TABLE IF NOT EXISTS public.spotify_recently_played (
    track_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration INT NOT NULL,
    song_url TEXT NOT NULL,
    played_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.spotify_recently_played ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public Read Access"
ON public.spotify_recently_played
FOR SELECT
TO public
USING (true);

import fetch from 'node-fetch';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

export default async function handler(req, res) {
    if (!client_id || !client_secret || !refresh_token) {
        return res.status(500).json({ error: "Missing Spotify credentials" });
    }

    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    let access_token;
    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${basic}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
            }),
        });

        if (!tokenResponse.ok) {
            const errorDetails = await tokenResponse.text();
            return res.status(tokenResponse.status).json({
                error: "Failed to fetch access token",
                details: errorDetails,
            });
        }

        const tokenData = await tokenResponse.json();
        access_token = tokenData.access_token;

        if (!access_token) {
            return res.status(401).json({ error: "Access token missing in response" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Token fetch failed", message: err.message });
    }

    try {
        const nowPlaying = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (nowPlaying.status === 204 || nowPlaying.status >= 400) {
            // Fallback to recently played
            const recentlyPlayed = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!recentlyPlayed.ok) {
                const errorText = await recentlyPlayed.text();
                return res.status(recentlyPlayed.status).json({
                    error: "Failed to fetch recently played",
                    details: errorText,
                });
            }

            const data = await recentlyPlayed.json();
            const track = data?.items?.[0];

            if (!track) {
                return res.status(200).json({ isPlaying: false });
            }

            return res.status(200).json({
                isPlaying: false,
                lastPlayed: true,
                playedAt: track.played_at,
                title: track.track?.name,
                artist: track.track?.artists?.map(a => a.name).join(", "),
                album: track.track?.album?.name,
                albumImageUrl: track.track?.album?.images?.[0]?.url,
                songUrl: track.track?.external_urls?.spotify,
            });
        }

        const song = await nowPlaying.json();

        if (!song?.item) {
            return res.status(200).json({ isPlaying: false });
        }

        return res.status(200).json({
            isPlaying: song.is_playing,
            lastPlayed: false,
            title: song.item.name,
            artist: song.item.artists.map(a => a.name).join(", "),
            album: song.item.album.name,
            albumImageUrl: song.item.album.images[0].url,
            songUrl: song.item.external_urls.spotify,
        });

    } catch (err) {
        return res.status(500).json({ error: "Playback fetch failed", message: err.message });
    }
}

import fetch from 'node-fetch';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

export default async function handler(req, res) {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

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

    const { access_token } = await tokenResponse.json();

    // Fetch now playing
    const nowPlaying = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (nowPlaying.status === 204 || nowPlaying.status >= 400) {

        // Nothing currently playing, fallback to recently played
        const recentlyPlayed = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (recentlyPlayed.ok) {
            const data = await recentlyPlayed.json();

            const track = data.items[0];

            return res.status(200).json({
                isPlaying: false,
                lastPlayed: true,
                playedAt: track.played_at,
                title: track.track.name,
                artist: track.track.artists.map((a) => a.name).join(", "),
                album: track.track.album.name,
                albumImageUrl: track.track.album.images[0].url,
                songUrl: track.track.external_urls.spotify,
            });
        } else {
            return res.status(200).json({ isPlaying: false });
        }
    }

    const song = await nowPlaying.json();

    res.status(200).json({
        isPlaying: song.is_playing,
        lastPlayed: false,
        title: song.item.name,
        artist: song.item.artists.map((a) => a.name).join(", "),
        album: song.item.album.name,
        albumImageUrl: song.item.album.images[0].url,
        songUrl: song.item.external_urls.spotify,
    });
}

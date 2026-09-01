![cover image](/public/og.png)
*why are you looking at my repo, when you could be looking at my [website](https://psiderman.com) instead?*


# psiderman.com

i’ve always wanted to have a website that’s more than just my design portfolio. a website that’s an extension of me, and not just my work self.

i think i’ve landed on an iteration that’s here to stay. i hope you find all the little easter eggs i’ve left in here.

if there is something that you’d like to see on here, let me know.
 want to build your own?

if you're a designer and you like what you see, and you want to make your own personal website, go ahead, fork this, copy it, edit, use it to guide your own personal website. the code is under the MIT license.

of course, please don't reuse any of my copyrighted content from the assets folder, or the words i've written.

if you're a dev, the stack below should be enough for you to figure it out.

# what do you need?

a dedicated domain name, free-tier subscriptions on a few platforms, a belief that code isn't that difficult, and a can-do attitude.

i'm not being preachy, and i'm not joking. you literally can run this entire project for free. the domain name is necessary in the later stages.

# stack
- **[Figma](https://www.figma.com)** for designs
- **[Vue 3](https://vuejs.org)** + **[Vite](https://vite.dev)** + **[Tailwind v4](https://tailwindcss.com)** for the static code
- **[Vercel](https://vercel.com)** for hosting + serverless functions for APIs (spotify, letterboxd, etc.).
- **[Supabase](https://supabase.com)** for a managed database, login, storage, realtime cursors on the page, processing and cleanup edge functions.
- **[Cloudflare](https://www.cloudflare.com)** for DNS, and an optional `media.yourdomain.com` in front of storage so you avoid supabase egress charges especially if you want to recreate the travel bit
- **[Mapbox](https://www.mapbox.com)** for the interactive travel map
- **[Spotify](https://developer.spotify.com)** if you want to expose your listening activity. they require you to be on the premium plan to access the api, but since you're only connecting one account, you can continue using it in dev mode.
- **[Sentry](https://sentry.io)** for errors.
- **[Simple Analytics](https://www.simpleanalytics.com)** for privacy-first visitor count.

# quick guide

1. clone this repo
2. `npm install`
3. copy `.env.example` to `.env` and fill in your API keys
4. `npm run dev:all`

# credits

Built with a handful of excellent free tools and assets:

- **Fonts** — PP Neue Montreal and Tiny (local, in `src/assets/fonts/`); Bricolage Grotesque, Kalam, and Source Serif Pro via the Fontsource packages.
- **Icons** — Lucide and Font Awesome brands
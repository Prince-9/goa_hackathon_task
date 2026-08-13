# Frame in Goa — HH Goa 2026

A single Next.js app with two shareable-graphic generators for the HH Goa 2026
shortlisting task:

- **`/`** — PFP Frame/Overlay (Format A): wraps an uploaded photo in an
  on-brand sunset ring, sized for an X profile picture.
- **`/card`** — Builder ID Card (Format B): photo + name + stack/role + a
  generated "builder title," laid out like an event badge.

Everything (upload, HEIC conversion, cropping/zoom, and the final PNG render)
happens client-side on `<canvas>`, so results are near-instant. There's no
login wall and no server-side storage of user photos.

## Share to X

Clicking **Share to X**:

1. Renders the canvas to a PNG blob.
2. POSTs it to `/api/upload` (a tiny server route) which forwards it to a
   free, anonymous image host (catbox.moe, falling back to 0x0.st) and gets
   back a public image URL. No accounts/API keys needed.
3. Opens `/share?img=<url>&text=<caption>` — a page whose `generateMetadata`
   sets `og:image` / `twitter:image` to that URL — inside an X intent link,
   so when the tweet is posted the link preview shows the actual graphic.
4. If the upload step fails for any reason, it falls back to opening X with
   just the caption pre-filled, and the UI tells the user to attach the
   downloaded PNG manually.

## Running locally

```bash
npm install
npm run dev
```

## Deploying

This build agent's sandbox has no general internet egress (only package
registries), so it can't push this to a host itself. From this project
folder on your own computer it's a two-minute job:

```bash
npx vercel        # first run: log in via the browser prompt, accept defaults
npx vercel --prod # promote to your production URL
```

That's it — Vercel builds the Next.js app and gives you a public HTTPS URL
you can paste straight into the shortlisting form.

Netlify works too (`npx netlify deploy --build --prod`), as does any host
that runs a standard Next.js app (the `/api/upload` and `/share` routes need
a Node server, not a static export).

## Customizing the brand

There's no confirmed official HH Goa 2026 logo/color kit available yet, so
the palette and wordmark in `src/lib/theme.js` and `src/lib/drawFrame.js` /
`src/lib/drawCard.js` are an original sunset/hacker-house look. Swap the
`THEME` colors or redraw the wordmark there if official assets show up.

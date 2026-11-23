# Lotus Garden invitation

Independent React, JavaScript, Tailwind CSS, Vite and Motion project. Start in this directory:

```sh
npm ci
npm run dev
```

The development server defaults to port 5174. Use `npm run build` for a static production site in `dist/` and `npm run preview` to preview it.

Update `src/event.js` to change the guests of honour, date, local timezone, venue, map or background music. Update the document title and description in `index.html` when changing the couple. The music preview streams when a guest opens the invitation.

The production build uses `VITE_SITE_URL` for canonical links, social preview image URLs, and the sitemap. On Vercel it uses `VERCEL_PROJECT_PRODUCTION_URL` automatically when no override is set. For another host, set `VITE_SITE_URL` to the public invitation URL before building. Include the path if the invitation is hosted in a subdirectory.

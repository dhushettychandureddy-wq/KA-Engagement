import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const publicUrl = env.VITE_SITE_URL || (vercelDomain ? `https://${vercelDomain}` : '')
  const site = publicUrl ? new URL(publicUrl) : null
  if (site) {
    if (!['https:', 'http:'].includes(site.protocol)) {
      throw new Error('VITE_SITE_URL must be an absolute HTTP or HTTPS URL.')
    }
    site.hash = ''
    site.search = ''
    if (!site.pathname.endsWith('/')) site.pathname += '/'
  }
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
  return {
    base: site?.pathname || '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'invitation-social-metadata',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            if (!site) return html
            const canonical = escape(site.href)
            const image = escape(new URL('invitation-share.jpg', site).href)
            return html
              .replaceAll('content="%BASE_URL%invitation-share.jpg"', `content="${image}"`)
              .replace('<!-- canonical-url -->', `<link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />`)
          },
        },
        generateBundle() {
          let robots = 'User-agent: *\nAllow: /\n'
          if (site) {
            robots += `Sitemap: ${new URL('sitemap.xml', site).href}\n`
            this.emitFile({
              type: 'asset', fileName: 'sitemap.xml',
              source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(site.href)}</loc></url></urlset>\n`,
            })
          }
          this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
        },
      },
    ],
  }
})

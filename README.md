# SPRINTER website

Static site — no build step.

Deploy on Vercel: import this folder (or drag it into vercel.com/new), Framework preset "Other", no build command, output directory = root.

- `index.html` — all sections (storyboard pages 1–16)
- `css/style.css` — design tokens + styles
- `js/main.js` — GSAP / ScrollTrigger / Lenis animations, route checker, earnings calculator
- `assets/img/` — images taken from the SPRINTER deck
- `assets/img/robots/` — robot fleet photos (3 featured in `#fleet`, the rest in the carousel); `assets/img/Sprinter/` holds the original JPEG exports

Before launch: connect the contact form in `js/main.js` (search "contactForm") to your email/CRM (e.g. Formspree, Resend, HubSpot).

## SEO (how to manage it)

All SEO lives in plain files, so it moves with the site to any host:

- `index.html`, top of `<head>`, block marked **SEO SETTINGS**: page title, meta description, canonical URL, social-share (Open Graph / Twitter) tags, Google Search Console tag, Google Analytics ID (`window.SPRINTER_GA_ID`) and structured data (JSON-LD: Organization, WebSite, Service).
- `robots.txt`: lets all search engines crawl and points them to the sitemap.
- `sitemap.xml`: list of pages for Google. Update `<lastmod>` when content changes.
- `assets/img/og-image.jpg`: 1200x630 image shown when the link is shared.

Domain: everything points to `https://sprinterone.us`. If the domain changes, replace it in the SEO block, `robots.txt` and `sitemap.xml`.

Go-live checklist:
1. Point sprinterone.us to this site (Vercel: Project > Settings > Domains).
2. Google Search Console: add the domain property, verify by DNS, then submit `https://sprinterone.us/sitemap.xml`.
3. Google Analytics 4: create a property, paste the Measurement ID (G-...) into `window.SPRINTER_GA_ID`.

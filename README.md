# SPRINTER website

Static site — no build step.

Deploy on Vercel: import this folder (or drag it into vercel.com/new), Framework preset "Other", no build command, output directory = root.

- `index.html` — all sections (storyboard pages 1–16)
- `css/style.css` — design tokens + styles
- `js/main.js` — GSAP / ScrollTrigger / Lenis animations, route checker, earnings calculator
- `assets/img/` — images taken from the SPRINTER deck

Before launch: connect the contact form in `js/main.js` (search "contactForm") to your email/CRM (e.g. Formspree, Resend, HubSpot).

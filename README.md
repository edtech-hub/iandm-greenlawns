# I&M Services website prototype

Redesign prototype for I & M Services Inc. (Coral Springs, FL), prepared by White Phoenix.

Live: https://iandmgreenlawns.whitephoenixconsulting.com

Plain HTML, CSS and a small vanilla JS file. No build step.

## Built from official WordPress sources
- `assets/css/wp-blocks.css` is a subset of `@wordpress/block-library` 11.2.0 (the core block styles) for the blocks used: Cover, Columns, Group, Buttons, Image (with lightbox), Media & Text, Quote, Details, List, Separator.
- Markup uses core block classes (`wp-block-cover`, `wp-block-columns`, `wp-block-media-text`, `wp-block-details` ...).
- Layout and section structure follow Twenty Twenty-Five patterns (business home, services-3-col, testimonials-large, text-faqs, cta-centered-heading, overlapped-images, footer-columns). Spacing and type scale come from its `theme.json`.
- Forms follow Gravity Forms markup and wording (multi-page progress bar, validation messages).
- Motion: cover parallax, image lightbox zoom, page View Transitions and Speculative Loading (WordPress Performance team), plus light fade-ins on scroll.

## Pages
`index.html`, `services/`, `about-us/`, `reviews/`, `contact-us/`, `quote/`, `404.html`

Run locally: `python3 -m http.server` here, then open http://localhost:8000.

## Prototype notes
- Forms validate and show a confirmation, but nothing is sent.
- Every page is `noindex` so the preview never competes with the client's live site.
- Copy uses only facts the client already publishes. License number, years in business and guarantees are left out until confirmed.

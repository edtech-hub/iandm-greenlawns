# I&M Services website prototype

Redesign prototype for I & M Services Inc. (Coral Springs, FL), prepared by White Phoenix as a proposal for iandmgreenlawns.com.

Preview: https://iandmgreenlawns.whitephoenixconsulting.com

Plain HTML, CSS and a small vanilla JS file. No build step.

```
index.html            Home
services/             Services (fertilization, weed control, pest control, perimeter)
about-us/             About
reviews/              Reviews
contact-us/           Contact
quote/                3-step quote request
404.html
assets/css/site.css   All styles
assets/js/site.js     Open/closed status, mobile menu, quote and contact forms
assets/img/           Optimized WebP images from the client's current site
```

Run locally: `python3 -m http.server` in this folder, then open http://localhost:8000.

Prototype notes
- Forms are front end only: they validate and show a confirmation, but nothing is sent.
- Every page is `noindex` so the preview never competes with the client's live site.
- Copy uses only facts the client already publishes (site, reviews, truck lettering). License number, years in business and any guarantee are left out until the client confirms them.

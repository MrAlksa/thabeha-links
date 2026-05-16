# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thabeha Links is a zero-dependency static social links landing page for the Thabeha business. It generates link buttons and a QR code from a single JavaScript config object. There is no build step, no package manager, and no framework.

## Running Locally

Open `index.html` directly in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

There is no build, lint, or test command.

## Architecture

All customisation lives in the `config` object at the top of `script.js`. Everything else is driven from it:

- `businessName`, `tagline`, `logoUrl` — header content
- `shareUrl` — the URL both the QR code encodes and the "Copy Link" button copies
- `links[]` — each entry has `id`, `title`, `url`, `subtitle`, `color` (hex for the icon background), `icon` (emoji)

`index.html` is a static shell with empty placeholder elements. `script.js` populates them on `DOMContentLoaded`:
1. Fills header text and logo
2. Renders each `config.links` entry as an `<a class="link-btn">` inside `#links`
3. Generates a 200×200 QR code via the CDN-loaded `QRCode` library (qrcodejs 1.0.0)
4. Wires up "Download QR" (canvas/img → PNG) and "Copy Link" (Clipboard API with prompt fallback)

`style.css` uses CSS custom properties (`--bg`, `--card`, `--accent`, `--muted`, `--white`) for theming. The dark colour scheme is defined in `:root`.

External dependencies loaded via CDN (no local copies):
- `qrcodejs` 1.0.0 — QR generation
- Google Fonts — Inter (400/600/700)

## Making Changes

**Add or edit a social link:** modify the `links` array in `script.js`. Each entry needs `id` (unique string), `title`, `url`, `subtitle`, `color`, and `icon`.

**Change the QR target URL:** update `config.shareUrl` in `script.js`.

**Change the logo:** update `config.logoUrl` in `script.js` with any publicly accessible image URL.

**Theming:** edit CSS custom properties in `style.css :root`.

## Deployment

Push to GitHub and enable Pages on the repository root (or `gh-pages` branch). The site can also be deployed by dropping the directory into Netlify or Vercel — no build command or output directory needed.

## Repository Notes

The file named `new` at the repo root contains scratch git commands used during initial setup. It is not part of the site and can be ignored or deleted.

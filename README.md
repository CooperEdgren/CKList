# Satellite TV Guide (minimal PWA)

This is a small Progressive Web App that displays a simple personal satellite TV guide. It's intentionally minimal and keeps channel configuration modular in `channels.json`.

Files created:
- `index.html` — app shell
- `styles.css` — styling
- `app.js` — main logic, loads `channels.json` and registers the service worker
- `service-worker.js` — caches assets for offline
- `manifest.json` — PWA manifest
- `channels.json` — modular channel list (edit this to add/remove channels)
- `icons/` — sample SVG icons

How to run locally:
1. Serve the folder with a static server (required for service worker). For example using Python 3:

```
python3 -m http.server 8000
```

2. Open `http://localhost:8000` in your browser.

Notes:
- Edit `channels.json` to add your channels. Each channel object supports the following fields:
	- `number` (string): channel number
	- `name` (string): text fallback label
	- `icon` (string, optional): square channel icon path
	- `desc` (string, optional): short description
	- `nameSvg` (string, optional): preferred SVG path for the channel name/logo. If present the app will try to load this SVG and render it in place of the text name; the `name` field remains for accessibility and fallback.
- Service worker caches the basic app shell. To update assets, bump cache name in `service-worker.js`.

Mobile & accessibility:
- The UI is mobile-first with larger touch targets and stacked layout on narrow screens.
- When `nameSvg` is present but fails to load, the app falls back to the text `name`.

# Superboo Frontend

Superboo is the consumer AI agent interface for chat, bots, connectors, onboarding, pricing, and the always-on agent flow.

## Web App

```bash
npm install
npm run dev
```

Create a production web build with:

```bash
npm run build
```

## macOS App

The macOS desktop app is an Electron wrapper around the same React app.

Run the desktop app in development:

```bash
npm run dev:desktop
```

Build the desktop renderer bundle:

```bash
npm run build:desktop
```

Create an unpacked macOS app bundle:

```bash
npm run pack:mac
```

Create a DMG build in `release/`:

```bash
npm run dist:mac
```

## Notes

- The web app keeps `BrowserRouter`.
- The desktop app switches to `HashRouter` so packaged `file://` navigation works correctly.
- Desktop builds are emitted to `dist-desktop/`.
- Electron artifacts are emitted to `release/`.

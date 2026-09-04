# Weekly Ad Navigation Prototype

A lightweight frontend prototype for evaluating native flyer navigation, zoom, panning, page selection, and a synchronized item list.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_SITE_PASSWORD_HASH` to the SHA-256 hash of the disposable passphrase used to open the prototype.

## Hosting

Pushes to `main` are built and published with GitHub Pages. The password screen is a client-side gate intended only to discourage casual access; it is not secure authentication.


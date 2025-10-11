# JWT Decoder

A fast, client-side JWT inspector built with Bun and React. Paste a JSON Web Token to view and copy its header and payload. The interface is localized and automatically uses your browser’s language (English or German).

## Features

- Instant, client-side JWT header and payload decoding
- Syntax-highlighted views with copy-to-clipboard actions
- Human-friendly timestamps and helpful tooltips
- Internationalization (en, de) with automatic browser language detection
	- Override via URL: `?lng=en` or `?lng=de`
- Built with [shadcn/ui](https://ui.shadcn.com/) components on top of Radix UI
- Tailwind CSS styling
- Zero backend required

## Requirements

- Bun ≥ 1.3.0

## Getting started

Install dependencies:
```bash
bun install
```

Start a development server (with HMR):
```bash
bun dev
```

Run in production:
```bash
bun start
```

Windows note: if inline environment variables do not work in your shell, you can run:
```powershell
$env:NODE_ENV = "production"
bun src/index.tsx
```

Build:
```bash
bun run build
```

## Internationalization (i18n)

- The app auto-detects your browser locale and switches between English (en) and German (de).
- To force a language, add `?lng=en` or `?lng=de` to the URL.
- To add more translations, edit the i18n configuration and resources (commonly in `src/i18n.ts`).

## UI components (shadcn/ui + Radix)

- UI primitives live in `src/components/ui` and are based on Radix UI via shadcn/ui.

## Tech stack

- Bun runtime
- React 19
- i18next + react-i18next + browser language detector
- shadcn/ui, Radix UI, Tailwind CSS
- jose (JWT utilities)
- react-syntax-highlighter

## Project scripts

- `bun dev` – start dev server with hot reload
- `bun start` – run the app in production mode
- `bun run build` – build the project

## License

[MIT LICENSE](./LICENSE)

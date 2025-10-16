# Shindig - Next.js Starter Template

A modern Next.js starter template with Tailwind CSS, DaisyUI, and Sentry integration.

## Features

- ⚡ Next.js 14 with App Router
- 💨 Tailwind CSS for utility-first styling
- 🌼 DaisyUI for beautiful pre-built components
- 🛡️ Sentry for error monitoring
- 🔤 Geist fonts optimized
- 🧪 TypeScript for type safety
- 📦 ESLint and Prettier configured
- 🗂️ Organized with src directory structure

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN_HERE
NEXT_PUBLIC_SENTRY_ENABLED=false
```

## Sentry Configuration

This project includes Sentry for error monitoring. To use it:

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new Next.js project in Sentry
3. Copy the DSN value and add it to your `.env.local` file
4. Optionally set `NEXT_PUBLIC_SENTRY_ENABLED=true` to enable Sentry in development
5. For production builds, follow Sentry's documentation for source maps upload

## DaisyUI Themes

This template includes multiple themes from DaisyUI. You can change themes by modifying the `data-theme` attribute in `src/app/layout.tsx` or by using DaisyUI's theme selector classes.

Available themes include: light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

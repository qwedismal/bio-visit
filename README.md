# ecstasy — bio visit

Personal bio website with 3D navigation, WebGL shader background, and cyberpunk aesthetics.

## Tech Stack
- **Three.js** — 3D navigation ring with raycaster
- **WebGL** — fragment shader fluid background
- **Vite** — build tool
- **Vanilla JS** — no frameworks

## Features
- 3D interactive navigation ring (drag to rotate, click to scroll)
- WebGL fragment shader background (flowing waves)
- Custom cursor + mouse trail + spotlight
- Glitch text effect on hero title
- Animated gradient background (canvas)
- Particle system with mouse interaction
- FAB compass for section navigation
- Glassmorphism cards with glare effect
- Infinite tech marquee
- Scroll progress bar
- CRT scanlines overlay
- Noise/Grain overlay
- Page transitions
- Handwriting SVG animation
- 3D ASCII art crystal polyhedron
- Fully responsive (360px — 4K)

## Setup

```bash
npm install
npm run dev       # development server at localhost:3000
npm run build     # production build in dist/
```

## Deploy
Upload `dist/` folder to Cloudflare Pages, Vercel, or any static hosting.
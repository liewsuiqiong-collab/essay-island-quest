// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves the site under /essay-island-quest/. Only apply that base
// when GITHUB_PAGES=1 so the Lovable preview keeps working at the root path.
const PAGES_BASE = "/essay-island/";
const isPages = process.env["GITHUB_PAGES"] === "1";

export default defineConfig({
  vite: {
    ...(isPages ? { base: PAGES_BASE } : {}),
    optimizeDeps: {
      // Prebundle shared UI dependencies before serving pages. Discovering them
      // during HMR can otherwise leave a tab with mismatched React bundles.
      include: [
        "lucide-react",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // SPA mode: the production build is a fully static site (no server runtime),
    // so it can be exported and hosted on GitHub Pages or any static host.
    spa: { enabled: true },
    ...(isPages ? { router: { basepath: PAGES_BASE } } : {}),
  },
});

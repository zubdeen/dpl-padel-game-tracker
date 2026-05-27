// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split UI components into separate chunk
          ui: [
            "src/components/ui/accordion.tsx",
            "src/components/ui/alert-dialog.tsx",
            "src/components/ui/alert.tsx",
            "src/components/ui/avatar.tsx",
            "src/components/ui/badge.tsx",
            "src/components/ui/button.tsx",
            "src/components/ui/card.tsx",
            "src/components/ui/checkbox.tsx",
            "src/components/ui/dialog.tsx",
            "src/components/ui/form.tsx",
            "src/components/ui/input.tsx",
            "src/components/ui/label.tsx",
            "src/components/ui/popover.tsx",
            "src/components/ui/select.tsx",
            "src/components/ui/sheet.tsx",
            "src/components/ui/sidebar.tsx",
            "src/components/ui/table.tsx",
            "src/components/ui/tabs.tsx",
            "src/components/ui/textarea.tsx",
            "src/components/ui/toggle.tsx",
            "src/components/ui/tooltip.tsx",
          ],
          // Split sections into separate chunk
          sections: [
            "src/components/sections/PlayersSection.tsx",
            "src/components/sections/TeamsSection.tsx",
            "src/components/sections/StandingsSection.tsx",
            "src/components/sections/FixturesSection.tsx",
            "src/components/sections/schedule-section.tsx",
          ],
          // Split vendor libraries
          react: ["react", "react-dom"],
          tanstack: ["@tanstack/react-router", "@tanstack/react-query"],
        },
      },
    },
  },
});

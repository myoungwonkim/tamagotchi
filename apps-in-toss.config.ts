import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "abysspet",
  brand: {
    primaryColor: "#58b8c8",
  },
  permissions: [],
  // Vite outDir + copy-ait-static.mjs output (index.html lives here).
  webBundleDir: "dist",
});

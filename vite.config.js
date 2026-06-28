import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: ".",
    publicDir: false,
    define: {
      "import.meta.env.VITE_AD_INTERSTITIAL_ID": JSON.stringify(
        env.VITE_AD_INTERSTITIAL_ID || "ait-ad-test-interstitial-id",
      ),
      "import.meta.env.VITE_AD_REWARDED_ID": JSON.stringify(
        env.VITE_AD_REWARDED_ID || "ait-ad-test-rewarded-id",
      ),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(process.cwd(), "index.html"),
      },
    },
  };
});

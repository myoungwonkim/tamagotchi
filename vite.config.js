import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // `npm run build:play` uses --mode play so `.env.play` unit IDs are baked in.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: ".",
    // Relative asset URLs so Capacitor Android WebView resolves hashed bundles.
    base: "./",
    publicDir: false,
    define: {
      "import.meta.env.VITE_AD_INTERSTITIAL_ID": JSON.stringify(
        env.VITE_AD_INTERSTITIAL_ID || "ait-ad-test-interstitial-id",
      ),
      "import.meta.env.VITE_AD_REWARDED_ID": JSON.stringify(
        env.VITE_AD_REWARDED_ID || "ait-ad-test-rewarded-id",
      ),
      "import.meta.env.VITE_ADMOB_INTERSTITIAL_ID": JSON.stringify(
        env.VITE_ADMOB_INTERSTITIAL_ID || "ca-app-pub-3940256099942544/1033173712",
      ),
      "import.meta.env.VITE_ADMOB_REWARDED_ID": JSON.stringify(
        env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-3940256099942544/5224354917",
      ),
      "import.meta.env.VITE_ADMOB_REWARDED_INTERSTITIAL_ID": JSON.stringify(
        env.VITE_ADMOB_REWARDED_INTERSTITIAL_ID || "ca-app-pub-3940256099942544/5354046379",
      ),
      "import.meta.env.VITE_PLAY_ADS": JSON.stringify(env.VITE_PLAY_ADS || "1"),
      "import.meta.env.VITE_ADMOB_FORCE_TEST": JSON.stringify(env.VITE_ADMOB_FORCE_TEST || "0"),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "es2022",
      rollupOptions: {
        input: resolve(process.cwd(), "index.html"),
      },
    },
  };
});

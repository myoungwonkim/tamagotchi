import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "deepsea-tamagotchi",
  brand: {
    displayName: "심해 다마고치",
    primaryColor: "#58b8c8",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite --port 5173 --host",
      build: "npm run build",
    },
  },
  permissions: [],
  outdir: "dist",
});

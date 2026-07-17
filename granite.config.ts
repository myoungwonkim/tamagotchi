import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "abysspet",
  brand: {
    displayName: "어비스펫: 심해 가상 펫",
    primaryColor: "#58b8c8",
    // 콘솔 로고 업로드 URL로 교체. 임시: 커스텀 도메인 정적 호스팅
    icon: "https://nolsoopgames.com/abysspet/assets/ait-store/app-logo-light.png",
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

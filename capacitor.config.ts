import type { CapacitorConfig } from "@capacitor/cli";

// Alternativa nativa (APK directo sin pasar por Play):
//   npm i -D @capacitor/cli @capacitor/core @capacitor/android
//   npx cap init "PaLoMuchacho" "app.palomuchacho.arcade" --web-dir=client/dist
//   npx cap add android
//   npm run build && npx cap sync && npx cap open android
// Requiere Android Studio. La vía recomendada para Play es la TWA
// (twa-manifest.json + Bubblewrap), que reutiliza esta misma PWA.
const config: CapacitorConfig = {
  appId: "app.palomuchacho.arcade",
  appName: "PaLoMuchacho",
  webDir: "client/dist",
  backgroundColor: "#12060f",
  android: {
    allowMixedContent: false,
  },
};

export default config;

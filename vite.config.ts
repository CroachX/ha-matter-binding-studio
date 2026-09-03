import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Let Vite choose React's production branches while bundling.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "custom_components/matter_binding_studio/frontend",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // React's CommonJS compatibility wrapper remains in the final ES
        // bundle. Give that wrapper its expected environment marker without
        // relying on a Node global in Home Assistant's browser runtime.
        banner: "const process = { env: { NODE_ENV: 'production' } };",
      },
    },
    lib: {
      entry: "src/panel.tsx",
      formats: ["es"],
      fileName: "matter-binding-studio-panel",
    },
  },
});

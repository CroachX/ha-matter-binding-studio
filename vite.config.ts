import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "custom_components/matter_binding_studio/frontend",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: "src/panel.tsx",
      formats: ["es"],
      fileName: "matter-binding-studio-panel",
    },
  },
});

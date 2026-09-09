import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index"
    },
    outDir: "build",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "index-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        inlineDynamicImports: true
      }
    }
  }
});

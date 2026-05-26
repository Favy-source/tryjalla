import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // tailwindcss() must come before reactRouter()
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true, // reads tsconfig paths (@ alias) natively
  },
});

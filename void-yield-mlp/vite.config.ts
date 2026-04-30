import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
//
// `base` is overridden in CI so the GitHub-Pages build resolves assets under
// /VoidWeb2/. Locally `npm run dev` and previews stay at /.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? "/",
});

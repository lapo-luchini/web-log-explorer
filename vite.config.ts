import { defineConfig } from "vite";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  // By default, there is 1 HTML file generated, 1 JS file generated, and 1 CSS file generated.
  // For ease of deployment, all three files are bundled into a single HTML file.
  // The browser needs all three files to render the page, so bundling them does not add overhead.
  plugins: [svelte(), viteSingleFile()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
});

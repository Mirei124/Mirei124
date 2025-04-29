// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";

import { remarkModifiedTime } from "./src/remark-modified-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://Mirei124.github.io",
  integrations: [mdx(), sitemap(), vue()],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
});

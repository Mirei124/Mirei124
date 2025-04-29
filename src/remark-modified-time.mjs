import { statSync } from "fs";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    const result = statSync(filepath);
    if (!file.data.astro.frontmatter.updatedDate) {
      file.data.astro.frontmatter.updatedDate = result.mtime.toISOString();
    }
  };
}

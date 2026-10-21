// Prepares the static build for GitHub Pages:
// - index.html serves the app shell at /essay-island-quest/
// - 404.html lets deep links (e.g. /essay-island-quest/report) load the app
// - .nojekyll stops GitHub from ignoring files that start with "_"
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const candidates = [".output/public", "dist/client"];
const out = candidates.find((d) => existsSync(join(d, "_shell.html")));
if (!out) {
  console.error("postbuild-pages: could not find _shell.html in", candidates.join(", "));
  process.exit(1);
}
const shell = join(out, "_shell.html");
copyFileSync(shell, join(out, "index.html"));
copyFileSync(shell, join(out, "404.html"));
writeFileSync(join(out, ".nojekyll"), "");
console.log(`postbuild-pages: prepared ${out} for GitHub Pages`);

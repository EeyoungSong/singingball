const fs = require("fs");
const path = require("path");
const { compositeChecker, removeInteriorWhiteHoles } = require("./png_rgba_tools");

const sourceDir = "/Users/song-eeyoung/Downloads/singing_bowl_cat_8frames_transparent_fixed";
const outputDir = path.resolve("assets/cat-hit");
const previewDir = path.resolve("tmp/cat-hit-preview");

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

for (let index = 1; index <= 8; index += 1) {
  const number = String(index).padStart(2, "0");
  const input = path.join(sourceDir, `cat_singing_bowl_hit_${number}.png`);
  const output = path.join(outputDir, `hit_${number}.png`);
  const preview = path.join(previewDir, `hit_${number}_checker.png`);
  fs.copyFileSync(input, output);
  const removed = removeInteriorWhiteHoles(output, output);
  compositeChecker(output, preview);
  console.log(`hit_${number}.png removed ${removed.length} component(s):`, removed);
}

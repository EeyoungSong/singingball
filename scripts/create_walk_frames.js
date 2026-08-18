const fs = require("fs");
const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const sourceDir = "/Users/song-eeyoung/Downloads/cat_walk_8frames_clean_redo";
const outputDir = path.resolve("assets/cat-walk");
const previewDir = path.resolve("tmp/cat-walk-preview");
const sourceFiles = Array.from({ length: 8 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return path.join(sourceDir, `cat_walk_frame_${number}.png`);
});

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

const bounds = sourceFiles.reduce(
  (box, file) => {
    const png = readPng(file);
    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        const alpha = png.data[(y * png.width + x) * 4 + 3];
        if (alpha <= 8) continue;
        box.minX = Math.min(box.minX, x);
        box.minY = Math.min(box.minY, y);
        box.maxX = Math.max(box.maxX, x);
        box.maxY = Math.max(box.maxY, y);
      }
    }
    return box;
  },
  { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
);

const padding = 12;
const crop = {
  minX: Math.max(0, bounds.minX - padding),
  minY: Math.max(0, bounds.minY - padding),
  maxX: bounds.maxX + padding,
  maxY: bounds.maxY + padding,
};

for (let index = 0; index < sourceFiles.length; index += 1) {
  const png = readPng(sourceFiles[index]);
  const width = crop.maxX - crop.minX + 1;
  const height = crop.maxY - crop.minY + 1;
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = crop.minX + x;
      const sourceY = crop.minY + y;
      const sourceOffset = (sourceY * png.width + sourceX) * 4;
      const targetOffset = (y * width + x) * 4;
      png.data.copy(data, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  const number = String(index + 1).padStart(2, "0");
  const output = path.join(outputDir, `walk_${number}.png`);
  const preview = path.join(previewDir, `walk_${number}_checker.png`);
  writePng(output, { width, height, data });
  compositeChecker(output, preview);
  console.log(`${path.basename(output)} ${width}x${height}`);
}

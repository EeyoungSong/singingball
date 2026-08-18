const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const outputDir = path.resolve("assets/cat-walk");
const previewDir = path.resolve("tmp/cat-walk-preview");
const targetBottomY = 444;

function getAlphaBounds(png) {
  const bounds = {
    minX: png.width,
    minY: png.height,
    maxX: 0,
    maxY: 0,
  };

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] <= 12) continue;
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  }

  return bounds;
}

function shiftPng(png, dy) {
  const output = Buffer.alloc(png.data.length);

  for (let y = 0; y < png.height; y += 1) {
    const targetY = y + dy;
    if (targetY < 0 || targetY >= png.height) continue;

    const sourceStart = y * png.width * 4;
    const sourceEnd = sourceStart + png.width * 4;
    const targetStart = targetY * png.width * 4;
    png.data.copy(output, targetStart, sourceStart, sourceEnd);
  }

  return { width: png.width, height: png.height, data: output };
}

for (let index = 1; index <= 8; index += 1) {
  const number = String(index).padStart(2, "0");
  const input = path.join(outputDir, `walk_${number}.png`);
  const preview = path.join(previewDir, `walk_${number}_checker.png`);
  const png = readPng(input);
  const before = getAlphaBounds(png);
  const dy = targetBottomY - before.maxY;
  const aligned = shiftPng(png, dy);
  writePng(input, aligned);
  compositeChecker(input, preview);
  const after = getAlphaBounds(aligned);
  console.log(`walk_${number}.png dy=${dy}`, { before, after });
}

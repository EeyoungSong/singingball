const fs = require("fs");
const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const sourcePath = "/Users/song-eeyoung/Downloads/7f48a39c-bf99-4421-aafb-32a0454e8569.png";
const outputDir = path.resolve("assets/props/radios");
const previewDir = path.resolve("tmp/radio-preview");
const columns = 4;
const rows = 3;
const padding = 6;

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

const sheet = readPng(sourcePath);
const cellWidth = Math.floor(sheet.width / columns);
const cellHeight = Math.floor(sheet.height / rows);

function cropCell(index, col, row) {
  const cellX = col * cellWidth;
  const cellY = row * cellHeight;
  const cellMaxX = col === columns - 1 ? sheet.width : cellX + cellWidth;
  const cellMaxY = row === rows - 1 ? sheet.height : cellY + cellHeight;
  let minX = cellMaxX;
  let minY = cellMaxY;
  let maxX = cellX;
  let maxY = cellY;

  for (let y = cellY; y < cellMaxY; y += 1) {
    for (let x = cellX; x < cellMaxX; x += 1) {
      const alpha = sheet.data[(y * sheet.width + x) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    throw new Error(`No visible pixels found for radio ${index}`);
  }

  minX = Math.max(cellX, minX - padding);
  minY = Math.max(cellY, minY - padding);
  maxX = Math.min(cellMaxX - 1, maxX + padding);
  maxY = Math.min(cellMaxY - 1, maxY + padding);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = ((minY + y) * sheet.width + minX + x) * 4;
      const targetOffset = (y * width + x) * 4;
      sheet.data.copy(data, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }

  const number = String(index).padStart(2, "0");
  const output = path.join(outputDir, `radio_${number}.png`);
  writePng(output, { width, height, data });
  compositeChecker(output, path.join(previewDir, `radio_${number}_checker.png`));
  console.log(`radio_${number}.png ${width}x${height}`);
}

let index = 1;
for (let row = 0; row < rows; row += 1) {
  for (let col = 0; col < columns; col += 1) {
    cropCell(index, col, row);
    index += 1;
  }
}

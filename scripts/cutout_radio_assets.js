const fs = require("fs");
const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const radioDir = path.resolve("assets/props/radios");
const previewDir = path.resolve("tmp/radio-preview");

fs.mkdirSync(previewDir, { recursive: true });

function isWhiteBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min > 224 && max - min < 26;
}

function floodClearWhiteBackground(png) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(pixel) {
    if (pixel < 0 || pixel >= width * height || visited[pixel]) return;
    const offset = pixel * 4;
    if (!isWhiteBackground(data[offset], data[offset + 1], data[offset + 2])) return;
    visited[pixel] = 1;
    queue.push(pixel);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  let head = 0;
  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    const x = current % width;
    const neighbors = [current - 1, current + 1, current - width, current + width];

    for (const next of neighbors) {
      if (next < 0 || next >= width * height) continue;
      const nx = next % width;
      if ((next === current - 1 && nx !== x - 1) || (next === current + 1 && nx !== x + 1)) continue;
      enqueue(next);
    }
  }

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (!visited[pixel]) continue;
    const offset = pixel * 4;
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }

  return queue.length;
}

for (let index = 1; index <= 5; index += 1) {
  const number = String(index).padStart(2, "0");
  const pngPath = path.join(radioDir, `radio_${number}.png`);
  const png = readPng(pngPath);
  const cleared = floodClearWhiteBackground(png);
  writePng(pngPath, png);
  compositeChecker(pngPath, path.join(previewDir, `radio_${number}_checker.png`));
  console.log(`radio_${number}.png cleared ${cleared} background pixels`);
}

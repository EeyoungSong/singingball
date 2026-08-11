const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const input = "/Users/song-eeyoung/Downloads/ChatGPT Image 2026년 8월 12일 오전 12_10_46.png";
const output = path.resolve("assets/props/wall-clock.png");
const preview = path.resolve("tmp/props/wall-clock-checker.png");

const png = readPng(input);
const { width, height, data } = png;

const cx = width * 0.5;
const cy = height * 0.49;
const rx = width * 0.385;
const ry = height * 0.335;
const feather = 0.045;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * 4;
    const normalized =
      ((x - cx) * (x - cx)) / (rx * rx) +
      ((y - cy) * (y - cy)) / (ry * ry);

    if (normalized <= 1) {
      continue;
    }

    if (normalized < 1 + feather) {
      const keep = Math.max(0, 1 - (normalized - 1) / feather);
      data[offset + 3] = Math.round(data[offset + 3] * keep);
      continue;
    }

    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }
}

writePng(output, png);
compositeChecker(output, preview);
console.log(`wrote ${output}`);
console.log(`wrote ${preview}`);

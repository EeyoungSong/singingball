const path = require("path");
const { readPng, writePng, compositeChecker } = require("./png_rgba_tools");

const input = path.resolve("assets/backgrounds/room-window.png");
const output = path.resolve("assets/backgrounds/room-window-overlay.png");
const preview = path.resolve("tmp/room-window-overlay-checker.png");

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

const png = readPng(input);
const { width, height, data } = png;

// Coordinates are based on room-window.png at 1055x1491.
// They clear the glass panes while leaving the outer border, wall, floor, and main frame visible.
const sx = width / 1055;
const sy = height / 1491;
const scale = ([x, y]) => [x * sx, y * sy];
const windowPanes = [
  [
    [21, 21],
    [705, 21],
    [705, 890],
    [21, 1120],
  ].map(scale),
];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (!windowPanes.some((polygon) => pointInPolygon(x, y, polygon))) {
      continue;
    }

    const offset = (y * width + x) * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Keep dark pencil frame lines even when they cross the cleared pane area.
    if (r < 105 && g < 105 && b < 105) {
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

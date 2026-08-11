const fs = require("fs");
const zlib = require("zlib");

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(raw, width, height, channels) {
  const stride = width * channels;
  const out = Buffer.alloc(width * height * channels);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[inputOffset];
    inputOffset += 1;
    const rowOffset = y * stride;
    const prevOffset = rowOffset - stride;

    for (let x = 0; x < stride; x += 1) {
      const rawValue = raw[inputOffset + x];
      const left = x >= channels ? out[rowOffset + x - channels] : 0;
      const up = y > 0 ? out[prevOffset + x] : 0;
      const upLeft = y > 0 && x >= channels ? out[prevOffset + x - channels] : 0;

      let value;
      if (filter === 0) value = rawValue;
      else if (filter === 1) value = rawValue + left;
      else if (filter === 2) value = rawValue + up;
      else if (filter === 3) value = rawValue + Math.floor((left + up) / 2);
      else if (filter === 4) value = rawValue + paeth(left, up, upLeft);
      else throw new Error(`Unsupported PNG filter ${filter}`);

      out[rowOffset + x] = value & 255;
    }

    inputOffset += stride;
  }

  return out;
}

function filterNone(data, width, height) {
  const stride = width * 4;
  const out = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const target = y * (stride + 1);
    out[target] = 0;
    data.copy(out, target + 1, y * stride, (y + 1) * stride);
  }

  return out;
}

function readPng(path) {
  const file = fs.readFileSync(path);
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`Not a PNG: ${path}`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString("ascii");
    const data = file.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Only 8-bit RGB/RGBA PNG is supported. Got bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const decoded = unfilter(inflated, width, height, channels);

  if (channels === 4) {
    return { width, height, data: decoded };
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    rgba[pixel * 4] = decoded[pixel * 3];
    rgba[pixel * 4 + 1] = decoded[pixel * 3 + 1];
    rgba[pixel * 4 + 2] = decoded[pixel * 3 + 2];
    rgba[pixel * 4 + 3] = 255;
  }

  return { width, height, data: rgba };
}

function writeChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(path, png) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(png.width, 0);
  ihdr.writeUInt32BE(png.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(filterNone(png.data, png.width, png.height), { level: 9 });
  const output = Buffer.concat([
    PNG_SIGNATURE,
    writeChunk("IHDR", ihdr),
    writeChunk("IDAT", compressed),
    writeChunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path, output);
}

function compositeChecker(inputPath, outputPath) {
  const png = readPng(inputPath);
  const out = Buffer.alloc(png.data.length);
  const tile = 32;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const dark = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
      const bg = dark ? [210, 222, 238] : [255, 255, 255];
      const alpha = png.data[offset + 3] / 255;

      out[offset] = Math.round(png.data[offset] * alpha + bg[0] * (1 - alpha));
      out[offset + 1] = Math.round(png.data[offset + 1] * alpha + bg[1] * (1 - alpha));
      out[offset + 2] = Math.round(png.data[offset + 2] * alpha + bg[2] * (1 - alpha));
      out[offset + 3] = 255;
    }
  }

  writePng(outputPath, { width: png.width, height: png.height, data: out });
}

function isNearWhite(r, g, b, a) {
  return a > 180 && r > 238 && g > 234 && b > 226 && Math.max(r, g, b) - Math.min(r, g, b) < 24;
}

function removeInteriorWhiteHoles(inputPath, outputPath) {
  const png = readPng(inputPath);
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];
  const components = [];

  for (let i = 0; i < width * height; i += 1) {
    if (visited[i]) continue;
    const offset = i * 4;
    if (!isNearWhite(data[offset], data[offset + 1], data[offset + 2], data[offset + 3])) continue;

    visited[i] = 1;
    queue.length = 0;
    queue.push(i);
    let head = 0;
    let count = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    while (head < queue.length) {
      const current = queue[head];
      head += 1;
      count += 1;
      const x = current % width;
      const y = Math.floor(current / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [current - 1, current + 1, current - width, current + width];
      for (const next of neighbors) {
        if (next < 0 || next >= width * height || visited[next]) continue;
        const nx = next % width;
        if ((next === current - 1 && nx !== x - 1) || (next === current + 1 && nx !== x + 1)) continue;
        const no = next * 4;
        if (!isNearWhite(data[no], data[no + 1], data[no + 2], data[no + 3])) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }

    components.push({ count, minX, minY, maxX, maxY, pixels: queue.slice() });
  }

  const removed = [];
  for (const component of components) {
    const boxWidth = component.maxX - component.minX + 1;
    const boxHeight = component.maxY - component.minY + 1;
    const inProblemArea =
      component.minX > width * 0.30 &&
      component.maxX < width * 0.70 &&
      component.minY > height * 0.43 &&
      component.maxY < height * 0.76;
    const looksLikeHole =
      component.count > 80 &&
      component.count < 18000 &&
      boxWidth < width * 0.24 &&
      boxHeight < height * 0.22;

    if (inProblemArea && looksLikeHole) {
      for (const pixel of component.pixels) {
        const offset = pixel * 4;
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
      }
      removed.push({ count: component.count, minX: component.minX, minY: component.minY, maxX: component.maxX, maxY: component.maxY });
    }
  }

  writePng(outputPath, png);
  return removed;
}

module.exports = {
  readPng,
  writePng,
  compositeChecker,
  removeInteriorWhiteHoles,
};

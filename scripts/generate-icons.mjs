import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const BRAND = [0xd6, 0x30, 0x1f]; // #d6301f
const WHITE = [0xff, 0xff, 0xff];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** Renders the PDFKit mark (brand-red rounded square + folded-corner page glyph) at size x size. */
function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = Math.round(size * 0.22);

  function setPixel(x, y, [r, g, b], a = 255) {
    const i = (y * size + x) * 4;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = a;
  }

  function inRoundedSquare(x, y) {
    const corners = [
      [radius, radius],
      [size - radius, radius],
      [radius, size - radius],
      [size - radius, size - radius],
    ];
    if (x >= radius && x <= size - radius) return true;
    if (y >= radius && y <= size - radius) return true;
    return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius);
  }

  // Background: brand-red rounded square.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inRoundedSquare(x, y)) setPixel(x, y, BRAND);
    }
  }

  // Foreground: a simple white "page with folded corner" glyph, centered.
  const pageW = size * 0.42;
  const pageH = size * 0.54;
  const px0 = Math.round((size - pageW) / 2);
  const py0 = Math.round((size - pageH) / 2);
  const fold = size * 0.12;

  for (let y = Math.round(py0); y < Math.round(py0 + pageH); y++) {
    for (let x = Math.round(px0); x < Math.round(px0 + pageW); x++) {
      const relX = x - px0;
      const relY = y - py0;
      // Cut the top-right corner to form a folded-page look.
      if (relX > pageW - fold && relY < fold && relX - (pageW - fold) > fold - relY) {
        continue;
      }
      setPixel(x, y, WHITE);
    }
  }

  // A small red triangle marking the folded corner.
  for (let y = 0; y < Math.round(fold); y++) {
    for (let x = 0; x < Math.round(fold); x++) {
      if (x + y < fold) {
        setPixel(Math.round(px0 + pageW - fold + x), Math.round(py0 + y), BRAND);
      }
    }
  }

  return pixels;
}

function encodePng(size, rgbaPixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgbaPixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw));

  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function writeIcon(size, outPath) {
  const pixels = renderIcon(size);
  const png = encodePng(size, pixels);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${size}x${size})`);
}

writeIcon(32, join(rootDir, "app/icon.png"));
writeIcon(180, join(rootDir, "app/apple-icon.png"));
writeIcon(192, join(rootDir, "public/icons/192.png"));
writeIcon(512, join(rootDir, "public/icons/512.png"));

/* Generates the app icons (blush background + white flower with sage center)
   as PNGs, using only Node's built-in zlib — no native image libraries needed.
   Run with: node gen-icons.js */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 (for PNG chunks)
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(size, scale, transparentBg, file) {
  const W = size, H = size;
  const cx = W / 2, cy = H / 2;
  const R = W * 0.17 * scale, pr = W * 0.115 * scale, cr = W * 0.092 * scale;
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (-Math.PI / 2) + (2 * Math.PI * i / 5);
    petals.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
  }
  const stride = 1 + W * 4;
  const raw = Buffer.alloc(H * stride);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < W; x++) {
      let r = 232, g = 126, b = 148, a = transparentBg ? 0 : 255; // blush bg
      for (const [px, py] of petals) {
        const dx = x - px, dy = y - py;
        if (dx * dx + dy * dy <= pr * pr) { r = 255; g = 255; b = 255; a = 255; break; }
      }
      const dxc = x - cx, dyc = y - cy;
      if (dxc * dxc + dyc * dyc <= cr * cr) { r = 109; g = 145; b = 121; a = 255; } // sage center
      const o = y * stride + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(__dirname, file), png);
  console.log('wrote', file, png.length, 'bytes');
}

makePNG(1024, 1.0, false, 'icon.png');            // app icon (full blush)
makePNG(1024, 0.62, false, 'adaptive-icon.png');  // Android adaptive (flower in safe zone)
makePNG(1024, 0.55, true, 'splash-icon.png');     // splash (transparent bg, flower only)
makePNG(48, 1.0, false, 'favicon.png');           // web favicon

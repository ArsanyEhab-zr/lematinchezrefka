import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const brandLogoPath = path.resolve(__dirname, '../public/brand-logo.png')
const outDir = path.resolve(__dirname, '../public/pwa')
fs.mkdirSync(outDir, { recursive: true })

const COLORS = {
  cream: [253, 251, 247, 255],
  olive: [62, 66, 43, 255],
  oliveDark: [45, 48, 30, 255],
  blush: [242, 213, 213, 255],
  gold: [176, 130, 72, 255],
  goldBright: [212, 166, 102, 255],
  kraft: [217, 195, 169, 255],
}

const FONT_5X7 = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
}

const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c >>> 0
}

const crc32 = (buffer) => {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i++) c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const paethPredictor = (a, b, c) => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

const decodePng = (filePath) => {
  const bytes = fs.readFileSync(filePath)
  const magic = '89504e470d0a1a0a'
  if (bytes.subarray(0, 8).toString('hex') !== magic) {
    throw new Error(`Invalid PNG signature in ${filePath}`)
  }

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatParts = []

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii')
    const data = bytes.subarray(offset + 8, offset + 8 + length)
    offset += 12 + length

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
        throw new Error(`Unsupported PNG format: depth=${bitDepth}, colorType=${colorType}`)
      }
    } else if (type === 'IDAT') {
      idatParts.push(data)
    } else if (type === 'IEND') {
      break
    }
  }

  const bpp = colorType === 6 ? 4 : 3
  const stride = width * bpp
  const inflated = zlib.inflateSync(Buffer.concat(idatParts))
  const decoded = Buffer.alloc(stride * height)

  for (let y = 0; y < height; y++) {
    const srcRow = y * (stride + 1)
    const filter = inflated[srcRow]
    const dstRow = y * stride

    for (let x = 0; x < stride; x++) {
      const raw = inflated[srcRow + 1 + x]
      const a = x >= bpp ? decoded[dstRow + x - bpp] : 0
      const b = y > 0 ? decoded[(y - 1) * stride + x] : 0
      const c = y > 0 && x >= bpp ? decoded[(y - 1) * stride + x - bpp] : 0

      let value = raw
      if (filter === 1) value = (raw + a) & 0xff
      else if (filter === 2) value = (raw + b) & 0xff
      else if (filter === 3) value = (raw + ((a + b) >> 1)) & 0xff
      else if (filter === 4) value = (raw + paethPredictor(a, b, c)) & 0xff
      decoded[dstRow + x] = value
    }
  }

  if (colorType === 6) return { width, height, data: decoded }

  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0, j = 0; i < decoded.length; i += 3, j += 4) {
    rgba[j] = decoded[i]
    rgba[j + 1] = decoded[i + 1]
    rgba[j + 2] = decoded[i + 2]
    rgba[j + 3] = 255
  }
  return { width, height, data: rgba }
}

const makeChunk = (type, data) => {
  const typeBytes = Buffer.from(type, 'ascii')
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  typeBytes.copy(out, 4)
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

const encodePng = (width, height, rgba) => {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    const dst = y * (stride + 1)
    raw[dst] = 0
    rgba.copy(raw, dst + 1, y * stride, (y + 1) * stride)
  }

  const compressed = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const createCanvas = (size) => {
  const buf = Buffer.alloc(size * size * 4)

  const blend = (x, y, color, coverage = 1) => {
    if (x < 0 || y < 0 || x >= size || y >= size || coverage <= 0) return
    const idx = (y * size + x) * 4
    const srcA = (color[3] / 255) * coverage
    const dstA = buf[idx + 3] / 255
    const outA = srcA + dstA * (1 - srcA)
    if (outA <= 0) return
    buf[idx] = Math.round((color[0] * srcA + buf[idx] * dstA * (1 - srcA)) / outA)
    buf[idx + 1] = Math.round((color[1] * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA)
    buf[idx + 2] = Math.round((color[2] * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA)
    buf[idx + 3] = Math.round(outA * 255)
  }

  const drawImageResized = (img, dx, dy, dw, dh) => {
    const scaleX = img.width / dw
    const scaleY = img.height / dh
    const xEnd = Math.min(size, dx + dw)
    const yEnd = Math.min(size, dy + dh)
    for (let py = Math.max(0, dy); py < yEnd; py++) {
      const sy0 = (py - dy) * scaleY
      const sy1 = (py - dy + 1) * scaleY
      for (let px = Math.max(0, dx); px < xEnd; px++) {
        const sx0 = (px - dx) * scaleX
        const sx1 = (px - dx + 1) * scaleX
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        let wSum = 0

        for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) {
          const wy = Math.min(sy + 1, sy1) - Math.max(sy, sy0)
          if (wy <= 0 || sy < 0 || sy >= img.height) continue
          for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
            const wx = Math.min(sx + 1, sx1) - Math.max(sx, sx0)
            if (wx <= 0 || sx < 0 || sx >= img.width) continue
            const w = wx * wy
            const sIdx = (sy * img.width + sx) * 4
            const alpha = img.data[sIdx + 3] * w
            r += img.data[sIdx] * alpha
            g += img.data[sIdx + 1] * alpha
            b += img.data[sIdx + 2] * alpha
            a += alpha
            wSum += w
          }
        }

        if (a > 0) {
          blend(px, py, [r / a, g / a, b / a, a / wSum], 1)
        }
      }
    }
  }

  const sdRoundedRect = (px, py, x, y, w, h, r) => {
    const cx = x + w / 2
    const cy = y + h / 2
    const qx = Math.abs(px - cx) - (w / 2 - r)
    const qy = Math.abs(py - cy) - (h / 2 - r)
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  }

  const fillRoundedRect = (x, y, w, h, r, color) => {
    const x0 = Math.max(0, Math.floor(x) - 2)
    const y0 = Math.max(0, Math.floor(y) - 2)
    const x1 = Math.min(size - 1, Math.ceil(x + w) + 2)
    const y1 = Math.min(size - 1, Math.ceil(y + h) + 2)
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const d = sdRoundedRect(px + 0.5, py + 0.5, x, y, w, h, r)
        if (d < 1) blend(px, py, color, Math.max(0, Math.min(1, 0.5 - d)))
      }
    }
  }

  const strokeRoundedRect = (x, y, w, h, r, thickness, color) => {
    const x0 = Math.max(0, Math.floor(x - thickness) - 2)
    const y0 = Math.max(0, Math.floor(y - thickness) - 2)
    const x1 = Math.min(size - 1, Math.ceil(x + w + thickness) + 2)
    const y1 = Math.min(size - 1, Math.ceil(y + h + thickness) + 2)
    const half = thickness / 2
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const d = Math.abs(sdRoundedRect(px + 0.5, py + 0.5, x, y, w, h, r)) - half
        if (d < 1) blend(px, py, color, Math.max(0, Math.min(1, 0.5 - d)))
      }
    }
  }

  const fillCircle = (cx, cy, r, color) => {
    const x0 = Math.max(0, Math.floor(cx - r) - 2)
    const y0 = Math.max(0, Math.floor(cy - r) - 2)
    const x1 = Math.min(size - 1, Math.ceil(cx + r) + 2)
    const y1 = Math.min(size - 1, Math.ceil(cy + r) + 2)
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const d = Math.hypot(px + 0.5 - cx, py + 0.5 - cy) - r
        if (d < 1) blend(px, py, color, Math.max(0, Math.min(1, 0.5 - d)))
      }
    }
  }

  const drawSegment = (ax, ay, bx, by, thickness, color) => {
    const minX = Math.max(0, Math.floor(Math.min(ax, bx) - thickness) - 2)
    const minY = Math.max(0, Math.floor(Math.min(ay, by) - thickness) - 2)
    const maxX = Math.min(size - 1, Math.ceil(Math.max(ax, bx) + thickness) + 2)
    const maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by) + thickness) + 2)
    const vx = bx - ax
    const vy = by - ay
    const lenSq = vx * vx + vy * vy || 1
    const r = thickness / 2
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const t = Math.max(0, Math.min(1, ((px + 0.5 - ax) * vx + (py + 0.5 - ay) * vy) / lenSq))
        const d = Math.hypot(px + 0.5 - (ax + vx * t), py + 0.5 - (ay + vy * t)) - r
        if (d < 1) blend(px, py, color, Math.max(0, Math.min(1, 0.5 - d)))
      }
    }
  }

  const drawText = (label, centerX, centerY, pixelSize, color) => {
    const glyphs = [...label].map((ch) => FONT_5X7[ch] || FONT_5X7[' '])
    const gap = Math.max(2, Math.round(pixelSize * 0.9))
    const totalW =
      glyphs.reduce((sum, g) => sum + g[0].length * pixelSize, 0) +
      Math.max(0, glyphs.length - 1) * gap
    const totalH = 7 * pixelSize
    let cursorX = Math.round(centerX - totalW / 2)
    const startY = Math.round(centerY - totalH / 2)

    for (const glyph of glyphs) {
      const cols = glyph[0].length
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < cols; col++) {
          if (glyph[row][col] === '1') {
            fillRoundedRect(
              cursorX + col * pixelSize - 0.5,
              startY + row * pixelSize - 0.5,
              pixelSize + 1.1,
              pixelSize + 1.1,
              1.1,
              color,
            )
          }
        }
      }
      cursorX += cols * pixelSize + gap
    }
  }

  return { buf, drawImageResized, fillRoundedRect, strokeRoundedRect, fillCircle, drawSegment, drawText }
}

const downsample = (src, srcSize, dstSize) => {
  const dst = Buffer.alloc(dstSize * dstSize * 4)
  const scale = srcSize / dstSize
  for (let dy = 0; dy < dstSize; dy++) {
    const sy0 = dy * scale
    const sy1 = (dy + 1) * scale
    for (let dx = 0; dx < dstSize; dx++) {
      const sx0 = dx * scale
      const sx1 = (dx + 1) * scale
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let weightSum = 0

      for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) {
        const wy = Math.min(sy + 1, sy1) - Math.max(sy, sy0)
        if (wy <= 0 || sy < 0 || sy >= srcSize) continue
        for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
          const wx = Math.min(sx + 1, sx1) - Math.max(sx, sx0)
          if (wx <= 0 || sx < 0 || sx >= srcSize) continue
          const w = wx * wy
          const idx = (sy * srcSize + sx) * 4
          const alpha = src[idx + 3] * w
          r += src[idx] * alpha
          g += src[idx + 1] * alpha
          b += src[idx + 2] * alpha
          a += alpha
          weightSum += w
        }
      }
      const outIdx = (dy * dstSize + dx) * 4
      if (a > 0) {
        dst[outIdx] = Math.round(r / a)
        dst[outIdx + 1] = Math.round(g / a)
        dst[outIdx + 2] = Math.round(b / a)
        dst[outIdx + 3] = Math.round(a / weightSum)
      }
    }
  }
  return dst
}

const brandLogo = decodePng(brandLogoPath)

const renderStorefrontIcon512 = () => {
  const c = createCanvas(512)
  // Clean centered authentic circular emblem with comfortable launcher safe zone
  c.drawImageResized(brandLogo, 10, 10, 492, 492)
  return c.buf
}

const renderAdminIcon512 = () => {
  const c = createCanvas(512)

  // Base graphic: authentic circular "Le Matin chez Refka" brand logo
  c.drawImageResized(brandLogo, 10, 10, 492, 492)

  // Overlay 1 (Top-Right Corner): crisp Dashboard analytics chart badge (📊)
  const bx = 342
  const by = 22
  const bSize = 148
  c.fillRoundedRect(bx + 4, by + 6, bSize, bSize, 36, [45, 48, 30, 90])
  c.fillRoundedRect(bx, by, bSize, bSize, 36, COLORS.olive)
  c.strokeRoundedRect(bx, by, bSize, bSize, 36, 6, COLORS.cream)
  c.strokeRoundedRect(bx + 7, by + 7, bSize - 14, bSize - 14, 30, 3, COLORS.gold)

  // 3 rising bars inside top-right badge
  c.fillRoundedRect(bx + 30, by + 84, 22, 36, 6, COLORS.blush)
  c.fillRoundedRect(bx + 63, by + 62, 22, 58, 6, COLORS.gold)
  c.fillRoundedRect(bx + 96, by + 40, 22, 80, 6, COLORS.cream)
  c.fillRoundedRect(bx + 24, by + 122, 100, 6, 3, COLORS.goldBright)
  c.drawSegment(bx + 41, by + 72, bx + 74, by + 50, 5, COLORS.goldBright)
  c.drawSegment(bx + 74, by + 50, bx + 107, by + 30, 5, COLORS.goldBright)
  c.fillCircle(bx + 107, by + 30, 6, COLORS.goldBright)

  // Overlay 2 (Bottom Edge): sleek Olive & Gold ribbon clearly marked "DASHBOARD"
  const rx = 56
  const ry = 398
  const rw = 400
  const rh = 78
  c.fillRoundedRect(rx + 2, ry + 5, rw, rh, 39, [45, 48, 30, 100])
  c.fillRoundedRect(rx, ry, rw, rh, 39, COLORS.olive)
  c.strokeRoundedRect(rx, ry, rw, rh, 39, 5, COLORS.gold)
  c.drawText('DASHBOARD', 256, ry + rh / 2 + 1, 5.5, COLORS.cream)

  return c.buf
}

const store512 = renderStorefrontIcon512()
const store192 = downsample(store512, 512, 192)
const admin512 = renderAdminIcon512()
const admin192 = downsample(admin512, 512, 192)

fs.writeFileSync(path.join(outDir, 'store-icon-512.png'), encodePng(512, 512, store512))
fs.writeFileSync(path.join(outDir, 'store-icon-192.png'), encodePng(192, 192, store192))
fs.writeFileSync(path.join(outDir, 'admin-icon-512.png'), encodePng(512, 512, admin512))
fs.writeFileSync(path.join(outDir, 'admin-icon-192.png'), encodePng(192, 192, admin192))

console.log('Generated authentic logo-based PWA assets from:', brandLogoPath)

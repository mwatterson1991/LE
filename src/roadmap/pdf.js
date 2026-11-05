// /roadmap: builds the visitor's roadmap PDF in the browser and downloads it.
//
// The print dialog renders differently on every OS (Windows applies its own
// margins, paper size, and header/footer stamps), so the Download button makes
// a real PDF file instead. roadmap.html exposes window.RoadmapPdfData() with
// the function, the 3 builds, and each build's blueprint text.
import { jsPDF } from 'jspdf'

const C = {
  ink: '#222222',
  body: '#333333',
  muted: '#6B6B6B',
  rust: '#A14E22',
  yellow: '#FFD667',
  yellowText: '#FFD96F',
  cream: '#F3F1E6',
  line: '#E3E1D8',
  dark: '#222222',
  onDark: '#DADADA',
  onDarkDim: '#9A9A9A',
}
const W = 612
const H = 792
const MX = 50
const TOP = 78
const BOTTOM = 60
const CW = W - MX * 2
const PROGRAM_URL = 'https://leland.ai/program'
const SCHOLARSHIP_URL =
  'https://joinleland.typeform.com/to/TEiacu5G?utm_campaign=landing_page_cta&utm_source=website&utm_medium=web&utm_content=roadmap-pdf'

const FONTS = [
  ['Season-Medium.ttf', 'Season', 'normal'],
  ['Macan-Regular.ttf', 'Macan', 'normal'],
  ['Macan-Medium.ttf', 'Macan', 'medium'],
  ['Macan-SemiBold.ttf', 'Macan', 'bold'],
]

let assetsPromise = null

function toBase64(buf) {
  const u = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000))
  return btoa(s)
}

async function imagePng(url, scale = 4) {
  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error(`Could not load ${url}`))
    i.src = url
  })
  const w = img.naturalWidth
  const h = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = w * scale
  c.height = h * scale
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return { data: c.toDataURL('image/png'), ratio: w / h }
}

function loadAssets() {
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      Promise.all(FONTS.map(([file]) => fetch(`/assets/roadmap/pdf/${file}`).then(r => r.arrayBuffer()).then(toBase64))),
      imagePng('/assets/logo-white.svg'),
      imagePng('/assets/logo-dark.svg'),
      imagePng('/assets/logos/aibp-light.png', 1),
    ]).then(([fonts, logoWhite, logoDark, aibpLight]) => ({ fonts, logoWhite, logoDark, aibpLight }))
    assetsPromise.catch(() => {
      assetsPromise = null
    })
  }
  return assetsPromise
}

// ---------- text layout ----------

function setFont(doc, style, size) {
  const [family, weight] = {
    serif: ['Season', 'normal'],
    regular: ['Macan', 'normal'],
    medium: ['Macan', 'medium'],
    bold: ['Macan', 'bold'],
  }[style]
  doc.setFont(family, weight)
  doc.setFontSize(size)
}

// Word-wraps runs of mixed styles: [{ t, style, color }].
function layoutRuns(doc, runs, size, maxW) {
  const lines = [[]]
  let x = 0
  for (const run of runs) {
    setFont(doc, run.style, size)
    const space = doc.getTextWidth(' ')
    const words = String(run.t).split(/\s+/).filter(Boolean)
    for (const word of words) {
      const w = doc.getTextWidth(word)
      const line = lines[lines.length - 1]
      const lead = line.length ? space : 0
      if (line.length && x + lead + w > maxW) {
        lines.push([{ t: word, x: 0, style: run.style, color: run.color }])
        x = w
      } else {
        line.push({ t: word, x: x + lead, style: run.style, color: run.color })
        x += lead + w
      }
    }
  }
  return lines.filter(l => l.length)
}

function drawLine(doc, line, x, y, size) {
  for (const seg of line) {
    setFont(doc, seg.style, size)
    doc.setTextColor(seg.color || C.body)
    doc.text(seg.t, x + seg.x, y, { baseline: 'top' })
  }
}

function eyebrow(doc, text, x, y, color) {
  setFont(doc, 'bold', 8)
  doc.setTextColor(color)
  doc.text(text.toUpperCase(), x, y, { baseline: 'top', charSpace: 1.1 })
}

// ---------- document ----------

function makeDoc(assets) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
  FONTS.forEach(([file, family, weight], i) => {
    doc.addFileToVFS(file, assets.fonts[i])
    doc.addFont(file, family, weight)
  })
  doc.setProperties({ title: 'My AI Build Roadmap', author: 'Leland', creator: 'leland.ai/roadmap' })
  return doc
}

function flow(doc, assets) {
  const f = { y: TOP, header: null }

  f.pageHeader = label => {
    const logo = assets.logoDark
    doc.addImage(logo.data, 'PNG', MX, 36, 15 * logo.ratio, 15)
    setFont(doc, 'medium', 8.5)
    doc.setTextColor(C.muted)
    doc.text(label, W - MX, 39, { baseline: 'top', align: 'right' })
    doc.setDrawColor(C.line)
    doc.setLineWidth(0.75)
    doc.line(MX, 60, W - MX, 60)
  }
  f.newPage = header => {
    doc.addPage()
    f.header = header === undefined ? f.header : header
    if (f.header) f.pageHeader(f.header)
    f.y = f.header ? TOP : 50
  }
  f.room = () => H - BOTTOM - f.y
  f.need = h => {
    if (h > f.room()) f.newPage(f.header ? `${f.header.replace(/ \(continued\)$/, '')} (continued)` : null)
  }
  // Paragraph of runs, breaking across pages line by line.
  f.para = (runs, { size = 10.5, lh = size * 1.5, x = MX, maxW = CW, after = 0 } = {}) => {
    const lines = layoutRuns(doc, runs, size, maxW)
    for (const line of lines) {
      f.need(lh)
      drawLine(doc, line, x, f.y, size)
      f.y += lh
    }
    f.y += after
  }
  f.section = (text, keep = 40) => {
    f.need(keep + 16)
    f.y += 14
    eyebrow(doc, text, MX, f.y, C.rust)
    f.y += 18
  }
  return f
}

function cover(doc, assets, data, f) {
  // Dark band.
  const lead = layoutRuns(doc, [{ t: data.blurb, style: 'regular', color: C.onDark }], 12, CW - 64)
  setFont(doc, 'serif', 38)
  const title = doc.splitTextToSize('Your AI build roadmap', CW - 64)
  const bandH = 26 + 22 + 26 + 18 + title.length * 42 + 6 + lead.length * 18 + 12 + 10 + 24
  const x0 = MX
  const y0 = 44
  doc.setFillColor(C.dark)
  doc.roundedRect(x0, y0, CW, bandH, 14, 14, 'F')
  let y = y0 + 26
  const lw = assets.logoWhite
  doc.addImage(lw.data, 'PNG', x0 + 32, y + 3, 16 * lw.ratio, 16)
  const divX = x0 + 32 + 16 * lw.ratio + 12
  doc.setDrawColor('#5A5A5A')
  doc.setLineWidth(0.75)
  doc.line(divX, y + 2, divX, y + 20)
  const ab = assets.aibpLight
  doc.addImage(ab.data, 'PNG', divX + 12, y - 1, 24 * ab.ratio, 24)
  y += 22 + 26
  eyebrow(doc, `AI Build Roadmap · ${data.fn}`, x0 + 32, y, C.yellowText)
  y += 18
  setFont(doc, 'serif', 38)
  doc.setTextColor('#FFFFFF')
  title.forEach(t => {
    doc.text(t, x0 + 32, y, { baseline: 'top' })
    y += 42
  })
  y += 6
  lead.forEach(line => {
    drawLine(doc, line, x0 + 32, y, 12)
    y += 18
  })
  y += 12
  setFont(doc, 'regular', 8.5)
  doc.setTextColor(C.onDarkDim)
  doc.text(`Made on ${data.date} at leland.ai/roadmap`, x0 + 32, y, { baseline: 'top' })
  f.y = y0 + bandH

  // The 3 builds.
  f.section('Your 3 builds')
  const pad = 14
  const textX = MX + pad + 30 + 14
  const textW = CW - (textX - MX) - pad
  data.builds.forEach((b, i) => {
    setFont(doc, 'serif', 17)
    const tLines = doc.splitTextToSize(b.title, textW)
    const dLines = layoutRuns(doc, [{ t: b.desc, style: 'regular', color: C.body }], 10, textW)
    const h = pad + 11 + 4 + tLines.length * 21 + 2 + dLines.length * 14.5 + 6 + 12 + pad
    f.need(h + 8)
    const top = f.y
    doc.setDrawColor(C.line)
    doc.setLineWidth(0.9)
    doc.roundedRect(MX, top, CW, h, 10, 10, 'S')
    doc.setFillColor(C.yellow)
    doc.circle(MX + pad + 15, top + pad + 15, 15, 'F')
    setFont(doc, 'bold', 12)
    doc.setTextColor(C.ink)
    doc.text(String(i + 1), MX + pad + 15, top + pad + 15, { align: 'center', baseline: 'middle' })
    let y = top + pad
    setFont(doc, 'regular', 8.5)
    doc.setTextColor(C.muted)
    doc.text(`${b.type} · ${b.focus}`, textX, y, { baseline: 'top' })
    y += 15
    setFont(doc, 'serif', 17)
    doc.setTextColor(C.ink)
    tLines.forEach(t => {
      doc.text(t, textX, y, { baseline: 'top' })
      y += 21
    })
    y += 2
    dLines.forEach(line => {
      drawLine(doc, line, textX, y, 10)
      y += 14.5
    })
    y += 6
    drawLine(doc, layoutRuns(doc, [{ t: 'Moves', style: 'regular', color: C.muted }, { t: b.metric, style: 'bold', color: C.ink }], 9, textW)[0], textX, y, 9)
    f.y = top + h + 8
  })

  // Keep the cover to one page: show the note only if it fits.
  const how = layoutRuns(
    doc,
    [
      {
        t: 'Drop this PDF into a new chat in Claude or ChatGPT and say “Help me build #1 from this roadmap.” Your AI walks you through it. Finish one build before you start the next.',
        style: 'regular',
        color: C.body,
      },
    ],
    10.5,
    CW,
  )
  if (f.room() >= 14 + 18 + how.length * 15.75) {
    f.y += 14
    eyebrow(doc, 'How to use it', MX, f.y, C.rust)
    f.y += 18
    how.forEach(line => {
      drawLine(doc, line, MX, f.y, 10.5)
      f.y += 15.75
    })
  }
}

function chips(doc, f, items) {
  const size = 8.5
  const padX = 9
  const h = 18
  let x = MX
  f.need(h + 6)
  for (const [label, value] of items) {
    setFont(doc, 'regular', size)
    const lw = label ? doc.getTextWidth(label + ' ') : 0
    setFont(doc, 'bold', size)
    const vw = doc.getTextWidth(value)
    const w = padX * 2 + lw + vw
    if (x + w > W - MX) {
      x = MX
      f.y += h + 6
      f.need(h + 6)
    }
    doc.setFillColor(C.cream)
    doc.roundedRect(x, f.y, w, h, 9, 9, 'F')
    if (label) {
      setFont(doc, 'regular', size)
      doc.setTextColor(C.muted)
      doc.text(label, x + padX, f.y + h / 2, { baseline: 'middle' })
    }
    setFont(doc, 'bold', size)
    doc.setTextColor(C.ink)
    doc.text(value, x + padX + lw, f.y + h / 2, { baseline: 'middle' })
    x += w + 6
  }
  f.y += h + 4
}

function steps(doc, f, list) {
  const size = 10.5
  const lh = size * 1.5
  const indent = 30
  list.forEach(([lead, text], i) => {
    const lines = layoutRuns(doc, [{ t: lead, style: 'bold', color: C.ink }, { t: text, style: 'regular', color: C.body }], size, CW - indent)
    f.need(Math.min(lines.length, 2) * lh + 6)
    doc.setFillColor(C.yellow)
    doc.circle(MX + 10, f.y + 7, 10, 'F')
    setFont(doc, 'bold', 9)
    doc.setTextColor(C.ink)
    doc.text(String(i + 1), MX + 10, f.y + 7.5, { align: 'center', baseline: 'middle' })
    lines.forEach(line => {
      f.need(lh)
      drawLine(doc, line, MX + indent, f.y, size)
      f.y += lh
    })
    f.y += 6
  })
}

function calloutBox(doc, f, runs) {
  const size = 10
  const lh = size * 1.5
  const pad = 12
  const lines = layoutRuns(doc, runs, size, CW - pad * 2)
  const h = lines.length * lh + pad * 2 - 3
  f.need(h + 8)
  doc.setFillColor(C.cream)
  doc.roundedRect(MX, f.y, CW, h, 8, 8, 'F')
  let y = f.y + pad
  lines.forEach(line => {
    drawLine(doc, line, MX + pad, y, size)
    y += lh
  })
  f.y += h + 8
}

function bullets(doc, f, items) {
  const size = 10.5
  const lh = size * 1.5
  items.forEach(([lead, text]) => {
    const lines = layoutRuns(doc, [{ t: `${lead}.`, style: 'bold', color: C.ink }, { t: text, style: 'regular', color: C.body }], size, CW - 16)
    f.need(lh)
    doc.setFillColor(C.ink)
    doc.circle(MX + 3, f.y + 7.5, 1.8, 'F')
    lines.forEach(line => {
      f.need(lh)
      drawLine(doc, line, MX + 16, f.y, size)
      f.y += lh
    })
    f.y += 3
  })
}

// Monospace-free code box that splits across pages.
function textBox(doc, f, text) {
  const size = 9
  const lh = size * 1.55
  const pad = 14
  setFont(doc, 'regular', size)
  const lines = []
  String(text)
    .split('\n')
    .forEach(raw => {
      if (!raw.trim()) lines.push('')
      else doc.splitTextToSize(raw, CW - pad * 2 - 4).forEach(l => lines.push(l))
    })
  let i = 0
  while (i < lines.length) {
    let fit = Math.floor((f.room() - pad * 2) / lh)
    if (fit < 4) {
      f.need(H)
      fit = Math.floor((f.room() - pad * 2) / lh)
    }
    const chunk = lines.slice(i, i + fit)
    const h = chunk.length * lh + pad * 2 - 4
    doc.setFillColor(C.cream)
    doc.roundedRect(MX, f.y, CW, h, 8, 8, 'F')
    doc.setFillColor(C.yellow)
    doc.rect(MX, f.y, 3, h, 'F')
    setFont(doc, 'regular', size)
    doc.setTextColor(C.ink)
    let y = f.y + pad
    chunk.forEach(l => {
      if (l) doc.text(l, MX + pad + 4, y, { baseline: 'top' })
      y += lh
    })
    f.y += h + 6
    i += chunk.length
  }
}

function blueprint(doc, f, b, n, total) {
  f.newPage(`Blueprint ${n} of ${total}`)
  eyebrow(doc, `${b.fn} · ${b.type}`, MX, f.y, C.rust)
  f.y += 16
  setFont(doc, 'serif', 28)
  doc.setTextColor(C.ink)
  doc.splitTextToSize(b.title, CW).forEach(t => {
    doc.text(t, MX, f.y, { baseline: 'top' })
    f.y += 32
  })
  f.y += 2
  if (b.sub) f.para([{ t: b.sub, style: 'regular', color: C.body }], { size: 13, lh: 19, after: 8 })
  const c = [
    ['Moves', b.metric],
    ['Works in', 'Claude or ChatGPT'],
  ]
  if (b.time) c.push(['', b.time])
  chips(doc, f, c)
  if (b.lead) {
    f.y += 8
    f.para([{ t: b.lead, style: 'regular', color: C.body }], { size: 10.5 })
  }
  f.section('Step by step')
  steps(doc, f, b.steps)
  if (b.watch) calloutBox(doc, f, [{ t: 'Watch for:', style: 'bold', color: C.ink }, { t: b.watch, style: 'regular', color: C.body }])
  if (b.need && b.need.length) {
    f.section('What you need')
    bullets(doc, f, b.need)
  }
  f.section(b.boxLabel, 110)
  textBox(doc, f, b.box)
}

function closing(doc, assets, f) {
  f.newPage(null)
  const x0 = MX
  const y0 = 50
  const pad = 36
  setFont(doc, 'serif', 32)
  const head = doc.splitTextToSize('Build the rest of your roadmap with us.', CW - pad * 2)
  const lead = layoutRuns(
    doc,
    [
      {
        t: 'These 3 blueprints get you started. The AI Builder Program gives you the full build library, live guided sessions, and a TA who helps you ship each build.',
        style: 'regular',
        color: C.onDark,
      },
    ],
    12.5,
    CW - pad * 2,
  )
  const list = [
    [{ t: '$1,499', style: 'bold', color: '#FFFFFF' }, { t: 'for three months of full access', style: 'regular', color: C.onDark }],
    [{ t: 'A live cohort that starts every two weeks', style: 'regular', color: C.onDark }],
    [{ t: 'Weekly office hours with your own TA', style: 'regular', color: C.onDark }],
    [{ t: 'The full build library and a verified certificate', style: 'regular', color: C.onDark }],
  ]
  const boxH = pad + 24 + 40 + 20 + head.length * 36 + 14 + lead.length * 19 + 18 + list.length * 22 + 26 + 40 + 26 + 16 + pad
  doc.setFillColor(C.dark)
  doc.roundedRect(x0, y0, CW, boxH, 14, 14, 'F')
  let y = y0 + pad
  const lw = assets.logoWhite
  doc.addImage(lw.data, 'PNG', x0 + pad, y + 3, 16 * lw.ratio, 16)
  const divX = x0 + pad + 16 * lw.ratio + 12
  doc.setDrawColor('#5A5A5A')
  doc.setLineWidth(0.75)
  doc.line(divX, y + 2, divX, y + 20)
  const ab = assets.aibpLight
  doc.addImage(ab.data, 'PNG', divX + 12, y - 1, 24 * ab.ratio, 24)
  y += 24 + 40
  eyebrow(doc, 'Your next step', x0 + pad, y, C.yellowText)
  y += 20
  setFont(doc, 'serif', 32)
  doc.setTextColor('#FFFFFF')
  head.forEach(t => {
    doc.text(t, x0 + pad, y, { baseline: 'top' })
    y += 36
  })
  y += 14
  lead.forEach(line => {
    drawLine(doc, line, x0 + pad, y, 12.5)
    y += 19
  })
  y += 18
  list.forEach(runs => {
    doc.setFillColor(C.yellow)
    doc.circle(x0 + pad + 4, y + 7, 4, 'F')
    drawLine(doc, layoutRuns(doc, runs, 12, CW - pad * 2 - 20)[0], x0 + pad + 18, y, 12)
    y += 22
  })
  y += 26
  // Yellow button.
  setFont(doc, 'bold', 13)
  const label = 'Join at leland.ai/program'
  const bw = doc.getTextWidth(label) + 48
  doc.setFillColor(C.yellow)
  doc.roundedRect(x0 + pad, y, bw, 40, 20, 20, 'F')
  doc.setTextColor(C.ink)
  doc.text(label, x0 + pad + bw / 2, y + 20, { align: 'center', baseline: 'middle' })
  doc.link(x0 + pad, y, bw, 40, { url: PROGRAM_URL })
  y += 40 + 26
  setFont(doc, 'regular', 11)
  doc.setTextColor(C.onDark)
  const pre = 'Want to join, but the price is a stretch? '
  doc.text(pre, x0 + pad, y, { baseline: 'top' })
  const px = x0 + pad + doc.getTextWidth(pre)
  setFont(doc, 'bold', 11)
  doc.setTextColor('#FFFFFF')
  const link = 'Apply for a scholarship.'
  doc.text(link, px, y, { baseline: 'top' })
  const lwid = doc.getTextWidth(link)
  doc.setDrawColor('#FFFFFF')
  doc.setLineWidth(0.6)
  doc.line(px, y + 13.5, px + lwid, y + 13.5)
  doc.link(px, y, lwid, 14, { url: SCHOLARSHIP_URL })
}

function footers(doc) {
  const n = doc.getNumberOfPages()
  for (let i = 2; i <= n; i++) {
    doc.setPage(i)
    setFont(doc, 'regular', 8)
    doc.setTextColor(C.muted)
    doc.text('leland.ai/roadmap', MX, H - 34, { baseline: 'top' })
    doc.text(`${i} / ${n}`, W - MX, H - 34, { baseline: 'top', align: 'right' })
  }
}

export async function buildRoadmapPdf(data, preloaded) {
  const assets = preloaded || (await loadAssets())
  const doc = makeDoc(assets)
  const f = flow(doc, assets)
  cover(doc, assets, data, f)
  data.builds.forEach((b, i) => blueprint(doc, f, b, i + 1, data.builds.length))
  closing(doc, assets, f)
  footers(doc)
  return doc
}

if (typeof window !== 'undefined') {
  window.RoadmapPdf = async function () {
    const data = window.RoadmapPdfData()
    data.date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const doc = await buildRoadmapPdf(data)
    doc.save(`My AI Build Roadmap - ${data.fn}.pdf`)
  }
  // Warm the fonts and logos so the first click is fast.
  if ('requestIdleCallback' in window) window.requestIdleCallback(() => loadAssets().catch(() => {}))
}

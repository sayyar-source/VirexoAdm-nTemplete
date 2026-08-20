/**
 * Measures the *rendered* text contrast of every visible text node, in both
 * themes and all three locales, and fails on any WCAG 2.2 AA violation.
 *
 * This exists because several tokens are `color-mix()` expressions — their real
 * values only exist in the browser, so the only honest way to check them is to
 * read them back off the layout.
 *
 *   node scripts/contrast.mjs            # against a running `vite preview`
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'

const PAGES = ['/', '/analytics', '/crm/deals', '/crm/customers', '/products', '/orders', '/users', '/users/roles', '/settings']
const MODES = [
  { theme: 'light', locale: 'en' },
  { theme: 'dark', locale: 'en' },
  { theme: 'light', locale: 'ar' },
  { theme: 'dark', locale: 'tr' },
]

const AUDIT = () => {
  const parse = (value) => {
    const nums = value.match(/[\d.]+/g)?.map(Number) ?? []
    return { r: nums[0] ?? 0, g: nums[1] ?? 0, b: nums[2] ?? 0, a: nums[3] ?? 1 }
  }
  const lin = (c) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }

  const effectiveBg = (el) => {
    let node = el
    let acc = null
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor)
      if (bg.a > 0) acc = acc ? over(acc, bg) : bg
      if (acc && acc.a >= 0.999) return acc
      node = node.parentElement
    }
    return acc ?? { r: 255, g: 255, b: 255, a: 1 }
  }

  const results = []
  for (const el of document.querySelectorAll('body *')) {
    const ownText = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim())
      .join(' ')
    if (!ownText) continue
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    // Skip the sr-only table views — they are never rendered for sighted users.
    if (el.closest('.sr-only')) continue

    const size = parseFloat(style.fontSize)
    const weight = Number(style.fontWeight) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const required = large ? 3 : 4.5

    // SVG text is painted with `fill`; `color` there is just the inherited
    // currentColor and would report the wrong ink.
    const fg = parse(el.namespaceURI === 'http://www.w3.org/2000/svg' ? style.fill : style.color)
    const bg = effectiveBg(el)
    const measured = ratio(over(fg, bg), bg)

    results.push({
      text: ownText.slice(0, 42),
      selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? `.${el.className.split(/\s+/).slice(0, 2).join('.')}` : ''),
      size,
      weight,
      required,
      ratio: Math.round(measured * 100) / 100,
      pass: measured + 0.005 >= required,
    })
  }
  return results
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)

let checked = 0
const failures = []

for (const mode of MODES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const page = await context.newPage()
  await page.addInitScript((cfg) => {
    localStorage.setItem('nexora.config', JSON.stringify({ numerals: 'latn', ...cfg }))
  }, mode)

  for (const path of PAGES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    const rows = await page.evaluate(AUDIT)
    checked += rows.length
    for (const row of rows.filter((r) => !r.pass)) {
      failures.push({ ...row, mode: `${mode.theme}/${mode.locale}`, path })
    }
  }
  await context.close()
}

await browser.close()

console.log(`checked ${checked} rendered text nodes across ${PAGES.length} pages × ${MODES.length} modes`)
if (failures.length) {
  console.error(`\n${failures.length} AA failures:`)
  const seen = new Set()
  for (const f of failures) {
    const key = `${f.mode}|${f.selector}|${f.ratio}`
    if (seen.has(key)) continue
    seen.add(key)
    console.error(
      `  ${f.ratio.toFixed(2)}:1 (needs ${f.required}) ${f.mode} ${f.path} — ${f.selector} :: "${f.text}"`,
    )
  }
  process.exit(1)
}
console.log('no WCAG 2.2 AA text-contrast failures')

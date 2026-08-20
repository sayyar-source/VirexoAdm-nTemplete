/**
 * RTL guard rail. Fails the build on any physical direction utility or CSS
 * property in `src/`, because a single `ml-4` or `text-left` is invisible in
 * LTR review and only shows up as a broken Arabic screen later.
 *
 * A line that genuinely needs a physical value — an off-canvas slide, a chart
 * overlay positioned in visual pixels — opts out with a trailing
 * `// rtl-ok: <reason>` (or `/* rtl-ok: … *\/` in CSS) on the same line.
 *
 *   node scripts/logical-properties.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'

const RULES = [
  { re: /\b-?(?:ml|mr|pl|pr)-(?![\w-]*\()/g, use: 'ms-/me-/ps-/pe-' },
  { re: /\btext-(?:left|right)\b/g, use: 'text-start / text-end' },
  { re: /\bborder-(?:l|r)(?:-|\b)/g, use: 'border-s / border-e' },
  { re: /\brounded-(?:l|r|tl|tr|bl|br)(?:-|\b)/g, use: 'rounded-s / rounded-e' },
  { re: /\bfloat-(?:left|right)\b/g, use: 'float-start / float-end' },
  { re: /\b-?(?:left|right)-(?:\d|\[|full|px)/g, use: 'start-/end-' },
  { re: /\b-?translate-x-/g, use: 'inset-inline-start, or add an rtl: variant' },
  { re: /(?:^|[\s;{])(?:margin|padding)-(?:left|right)\s*:/g, use: '*-inline-start/end' },
  { re: /(?:^|[\s;{])(?:left|right)\s*:/g, use: 'inset-inline-start/end' },
  { re: /\bdirection\s*:\s*(?:ltr|rtl)/g, use: 'the document dir attribute' },
]

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(ROOT).filter((f) => /\.(tsx?|css)$/.test(f))
const problems = []

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    if (/rtl-ok/.test(line)) return
    for (const rule of RULES) {
      rule.re.lastIndex = 0
      const match = rule.re.exec(line)
      if (match) {
        problems.push({
          file: relative('.', file),
          line: index + 1,
          found: match[0].trim(),
          use: rule.use,
          text: line.trim().slice(0, 96),
        })
      }
    }
  })
}

console.log(`scanned ${files.length} files under ${ROOT}/`)
if (problems.length) {
  console.error(`\n${problems.length} physical-direction usages:`)
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  "${p.found}" → use ${p.use}\n      ${p.text}`)
  }
  console.error('\nIf a line genuinely needs it, append: // rtl-ok: <reason>')
  process.exit(1)
}
console.log('no physical-direction utilities or properties')

/**
 * Minimal ICU MessageFormat subset: `{name}` substitution plus
 * `{count, plural, one {# item} other {# items}}` with the full CLDR category
 * set (zero/one/two/few/many/other) and `=N` exact matches.
 *
 * Why not just `count === 1 ? a : b`: Arabic has six plural categories, Turkish
 * has one. Any hand-rolled ternary is wrong in at least one of the three
 * locales this template ships with. Intl.PluralRules is the only correct source.
 *
 * If the app grows beyond this, swap in `intl-messageformat` — the call
 * signature here is intentionally the same shape.
 */
export type MessageValues = Record<string, string | number>

/** Scan forward from the index of an opening brace to its matching close. */
function matchBrace(input: string, open: number): number {
  let depth = 0
  for (let i = open; i < input.length; i++) {
    if (input[i] === '{') depth++
    else if (input[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function parseOptions(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  let i = 0
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i]!)) i++
    let key = ''
    while (i < body.length && !/[\s{]/.test(body[i]!)) key += body[i++]
    while (i < body.length && /\s/.test(body[i]!)) i++
    if (body[i] !== '{') break
    const end = matchBrace(body, i)
    if (end === -1) break
    out[key] = body.slice(i + 1, end)
    i = end + 1
  }
  return out
}

export function formatMessage(
  template: string,
  values: MessageValues | undefined,
  plural: Intl.PluralRules,
  formatNumber: (n: number) => string,
): string {
  let out = ''
  let i = 0

  while (i < template.length) {
    const open = template.indexOf('{', i)
    if (open === -1) {
      out += template.slice(i)
      break
    }
    out += template.slice(i, open)
    const close = matchBrace(template, open)
    if (close === -1) {
      out += template.slice(open)
      break
    }

    const inner = template.slice(open + 1, close)
    const [rawName, rawType, ...rest] = inner.split(',')
    const name = rawName!.trim()
    const type = rawType?.trim()

    if (type === 'plural') {
      const count = Number(values?.[name] ?? 0)
      const options = parseOptions(rest.join(','))
      const branch =
        options[`=${count}`] ??
        options[plural.select(count)] ??
        options.other ??
        ''
      out += formatMessage(
        branch.replaceAll('#', formatNumber(count)),
        values,
        plural,
        formatNumber,
      )
    } else {
      const value = values?.[name]
      out += value === undefined
        ? `{${name}}`
        : typeof value === 'number'
          ? formatNumber(value)
          : value
    }
    i = close + 1
  }

  return out
}

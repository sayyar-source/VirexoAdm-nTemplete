import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge has to be told about this project's type scale.
 *
 * Out of the box it cannot tell `text-body-sm` (a font size) from
 * `text-primary-fg` (a colour) — both match `text-*` with a non-standard
 * value — so it treats them as one conflicting group and the later class
 * silently deletes the earlier one. Symptom: `<Button variant="primary">`
 * renders with `text-primary-fg` stripped and inherits body ink, giving a
 * 3.24:1 label on the indigo fill. Declaring the font-size scale explicitly
 * puts each utility in the right group.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['h1', 'h2', 'h3', 'body', 'body-sm', 'caption'] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

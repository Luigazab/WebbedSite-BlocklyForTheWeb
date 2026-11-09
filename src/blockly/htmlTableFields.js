import { Blockly } from './core.js'

function optionalInteger(value, min, max) {
  const text = String(value ?? '').trim()
  if (text === '') return ''
  if (!/^\d+$/.test(text)) return null
  const number = Number(text)
  return Number.isInteger(number) && number >= min && number <= max ? String(number) : null
}

// FieldNumber normalizes blank input to a number; a validated text field can
// preserve the distinction between an omitted attribute and an explicit value.
export const optionalSpanField = (min, max) => new Blockly.FieldTextInput('', value => optionalInteger(value, min, max))

export function cellSpanAttributes(block) {
  return [['COLSPAN', 'colspan', 1, 1000], ['ROWSPAN', 'rowspan', 0, 65534]]
    .map(([field, attribute, min, max]) => {
      const value = optionalInteger(block.getFieldValue(field), min, max)
      return value === null || value === '' ? '' : ` ${attribute}="${value}"`
    }).join('')
}

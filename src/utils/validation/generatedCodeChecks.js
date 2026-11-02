import { DOMParser } from 'linkedom'
import CSSOM from 'cssom'

// Shared by authoring and trusted validation; this only parses source, never runs it.
export const parseHtml = code => new DOMParser().parseFromString(code || '', 'text/html')
const text = value => value.replace(/\s+/g, ' ').trim()
export const ownText = node => text([...node.childNodes].filter(child => child.nodeType === 3).map(child => child.textContent).join(''))

export function elementSelector(node) {
  const parts = []
  while (node?.nodeType === 1) {
    if (node.id) {
      parts.unshift(`[id=${JSON.stringify(node.id)}]`)
      break
    }
    const tag = node.localName
    const siblings = [...(node.parentNode?.children || [])].filter(child => child.localName === tag)
    parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(node) + 1})`)
    node = node.parentNode
  }
  return parts.join(' > ')
}

export function cssDeclarations(code) {
  const result = new Map()
  function visit(rules, context = []) {
    for (const rule of rules) {
      if (rule.cssRules) {
        visit(rule.cssRules, [...context, rule.cssText.slice(0, rule.cssText.indexOf('{')).trim()])
      } else if (rule.style) {
        const selector = (rule.selectorText || rule.keyText || '@font-face').trim()
        for (let i = 0; i < rule.style.length; i++) {
          const property = rule.style[i]
          const declaration = { selector, property, context, value: rule.style.getPropertyValue(property).trim(), priority: rule.style.getPropertyPriority(property) }
          const key = JSON.stringify([context, selector, property])
          // Later declarations win unless an earlier declaration is important.
          if (!result.get(key)?.priority || declaration.priority) result.set(key, declaration)
        }
      }
    }
  }
  visit(CSSOM.parse(code || '').cssRules)
  return result
}

function cssChanges(initial, expected, extra = {}) {
  const before = cssDeclarations(initial), after = cssDeclarations(expected)
  const checks = []
  for (const [key, declaration] of after) {
    if (JSON.stringify(before.get(key)) !== JSON.stringify(declaration)) checks.push({ type: 'cssDeclaration', ...declaration, ...extra, message: `${declaration.selector}: set ${declaration.property} to ${declaration.value}${declaration.priority ? ' !important' : ''}.` })
  }
  for (const [key, declaration] of before) {
    if (!after.has(key)) checks.push({ type: 'cssAbsent', ...declaration, ...extra, message: `${declaration.selector}: remove ${declaration.property}.` })
  }
  return checks
}

export function generateCodeChecks(initial, expected, filename) {
  if (/\.js$/i.test(filename)) return [] // JavaScript authoring is intentionally deferred.
  if (/\.css$/i.test(filename)) return cssChanges(initial, expected)
  if (!/\.html$/i.test(filename)) return []
  const before = parseHtml(initial), after = parseHtml(expected)
  const checks = []
  const eligible = doc => [...doc.querySelectorAll('*')].filter(node => !['script', 'style'].includes(node.localName))
  for (const node of eligible(after)) {
    const selector = elementSelector(node)
    const previous = before.querySelector(selector)
    if (!previous) checks.push({ type: 'htmlExists', selector, message: `Add ${node.localName}${node.id ? ` (${node.id})` : ''}.` })
    if (ownText(node) !== (previous ? ownText(previous) : '')) checks.push({ type: 'htmlOwnText', selector, value: ownText(node), message: `Set ${node.localName} text to “${ownText(node)}”.` })
    for (const attribute of [...node.attributes]) {
      if (/^on/i.test(attribute.name)) continue
      if (attribute.name === 'style') {
        checks.push(...cssChanges(`element {${previous?.getAttribute('style') || ''}}`, `element {${attribute.value}}`, { element: selector }))
      } else if (previous?.getAttribute(attribute.name) !== attribute.value) {
        checks.push({ type: 'htmlAttribute', selector, attribute: attribute.name, value: attribute.value, message: `Set ${node.localName} ${attribute.name} to “${attribute.value}”.` })
      }
    }
    for (const attribute of [...(previous?.attributes || [])]) {
      if (!node.hasAttribute(attribute.name) && !/^on/i.test(attribute.name)) checks.push({ type: 'htmlAttributeAbsent', selector, attribute: attribute.name, message: `Remove ${node.localName} ${attribute.name}.` })
    }
  }
  for (const node of eligible(before)) {
    const selector = elementSelector(node)
    if (!after.querySelector(selector)) checks.push({ type: 'htmlAbsent', selector, message: `Remove ${node.localName}${node.id ? ` (${node.id})` : ''}.` })
  }
  const styles = doc => [...doc.querySelectorAll('style')].map(node => node.textContent).join('\n')
  checks.push(...cssChanges(styles(before), styles(after), { embedded: true }))
  return checks
}

export function capturedTests(initial, expected, filename, existing = []) {
  return [{ type: 'generatedChanges', checks: generateCodeChecks(initial, expected, filename) }, ...existing.filter(test => test.type !== 'generatedChanges')]
}

export function countChecks(tests = []) {
  return tests.reduce((count, test) => count + (test.type === 'generatedChanges' ? countChecks(test.checks) : test.enabled === false ? 0 : 1), 0)
}

export function checkCss(code, test) {
  let source = code
  if (test.element) {
    const node = parseHtml(code).querySelector(test.element)
    if (!node) return false
    source = `element {${node.getAttribute('style') || ''}}`
  } else if (test.embedded) source = [...parseHtml(code).querySelectorAll('style')].map(node => node.textContent).join('\n')
  const declaration = cssDeclarations(source).get(JSON.stringify([test.context || [], test.selector, test.property]))
  return test.type === 'cssAbsent' ? !declaration : !!declaration && declaration.value === test.value && declaration.priority === (test.priority || '')
}

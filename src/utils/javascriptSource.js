import { parse } from 'acorn'
import { DOMParser } from 'linkedom'

export function parseJavaScript(source, sourceType = 'script') {
  return parse(source, { ecmaVersion: 'latest', sourceType, locations: true })
}

export function sourceDiagnostics(code, filename = 'index.html') {
  const extension = filename.split('.').pop().toLowerCase()
  const issues = []
  const inspect = (source, sourceType, label) => {
    try { parseJavaScript(source, sourceType) }
    catch (error) { issues.push({ message: `${label}: ${error.message}`, line: error.loc?.line }) }
  }
  if (extension === 'js') inspect(code, 'script', filename)
  if (extension === 'html') {
    const document = new DOMParser().parseFromString(code, 'text/html')
    for (const [index, script] of [...document.querySelectorAll('script')].entries()) {
      if (script.hasAttribute('src')) continue
      const type = script.getAttribute('type')?.trim().toLowerCase()
      if (type && !['module', 'text/javascript', 'application/javascript'].includes(type)) continue
      inspect(script.textContent, type === 'module' ? 'module' : 'script', `${filename}, script ${index + 1}`)
    }
  }
  return issues
}

export function assertValidSource(code, filename) {
  const issues = sourceDiagnostics(code, filename)
  if (issues.length) throw new Error(issues.map(issue => issue.message).join(' • '))
}

export function instrumentLoops(source, sourceType = 'script') {
  const ast = parseJavaScript(source, sourceType)
  const edits = []
  const walk = node => {
    if (!node || typeof node !== 'object') return
    if (['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
      const body = node.body
      const guard = 'globalThis.__webbedTick();'
      if (body.type === 'BlockStatement') edits.push({ at: body.start + 1, text: guard })
      else { edits.push({ at: body.start, text: `{${guard}` }); edits.push({ at: body.end, text: '}' }) }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc') continue
      if (Array.isArray(value)) value.forEach(walk)
      else if (value?.type) walk(value)
    }
  }
  walk(ast)
  for (const edit of edits.sort((a, b) => b.at - a.at)) source = source.slice(0, edit.at) + edit.text + source.slice(edit.at)
  return source
}

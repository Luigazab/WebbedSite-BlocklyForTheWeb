import { Blockly } from './core.js'
import { javascriptGenerator, Order } from 'blockly/javascript'
import { parseExpressionAt } from 'acorn'

const reserved = new Set(('await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield').split(' '))
export const isIdentifier = value => /^[A-Za-z_$][\w$]*$/.test(value) && !reserved.has(value) && !value.startsWith('__webbed')
export const validateIdentifier = value => isIdentifier(value) ? value : null
export function isReference(value) {
  try {
    const expression = parseExpressionAt(value, 0, { ecmaVersion: 'latest' })
    return expression.end === value.trimEnd().length && ['Identifier', 'MemberExpression', 'ThisExpression'].includes(expression.type)
  } catch { return false }
}
export function validNameField(type, field, value) {
  if (field === 'NAME' && ['js_get_var', 'js_set_var', 'js_compound_assign', 'js_increment', 'js_function_call_stmt', 'js_function_call_expr', 'js_call', 'js_call_value'].includes(type)) return isReference(value)
  return isIdentifier(value)
}
export const quoteJS = value => "'" + String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + "'"
export const templateText = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
export const inlineScript = source => source.replace(/<\/script/gi, '<\\/script')
export const memberAccess = (object, property) => /^[A-Za-z_$][\w$]*$/.test(property) ? `${object}.${property}` : `${object}[${quoteJS(property)}]`
export const valueCode = (block, name, order = Order.ATOMIC, fallback = 'undefined') => javascriptGenerator.valueToCode(block, name, order) || fallback
export const statementCode = (block, name) => javascriptGenerator.statementToCode(block, name) || ''

const functionTypes = new Set(['js_function_def', 'js_arrow_function', 'js_async_function'])
const declarationTypes = new Set(['js_let', 'js_const', 'js_var_decl'])
export function scopeChain(block) {
  const scopes = []
  let current = block
  while (current?.getParent()) {
    const parent = current.getParent()
    const input = parent.inputList.find(input => input.connection?.targetBlock() === current)
    if (input?.type === Blockly.inputs.inputTypes.STATEMENT && !['html_script_inline', 'js_script_body', 'js_script_head'].includes(parent.type)) scopes.push(`${parent.id}:${input.name}`)
    current = parent
  }
  return [...scopes, 'global']
}

export function resolveNameBinding(block, name, renamed) {
  const scopes = scopeChain(block)
  const candidates = block.workspace.getAllBlocks(false).filter(candidate => (functionTypes.has(candidate.type) || declarationTypes.has(candidate.type))
    && (candidate === renamed?.block ? renamed.oldName : candidate.getFieldValue('NAME')) === name
    && scopes.includes(scopeChain(candidate)[0]))
  return candidates.sort((a, b) => scopes.indexOf(scopeChain(a)[0]) - scopes.indexOf(scopeChain(b)[0]))[0]
}

export function propagateNameChange(workspace, event) {
  if (event.type !== Blockly.Events.BLOCK_CHANGE || event.element !== 'field' || event.name !== 'NAME' || event.oldValue === event.newValue) return
  const declaration = workspace.getBlockById(event.blockId)
  const functions = functionTypes.has(declaration?.type)
  if (!functions && !declarationTypes.has(declaration?.type)) return
  const references = functions ? ['js_get_var', 'js_call', 'js_call_value', 'js_function_call_stmt', 'js_function_call_expr'] : ['js_get_var', 'js_set_var', 'js_compound_assign', 'js_increment']
  Blockly.Events.setGroup(event.group || true)
  try {
    if (!functions && scopeChain(declaration)[0] === 'global') {
      const map = workspace.getVariableMap()
      const legacy = map.getVariable(event.oldValue)
      if (legacy && !map.getVariable(event.newValue)) map.renameVariable(legacy, event.newValue)
    }
    for (const block of workspace.getAllBlocks(false)) {
      if (references.includes(block.type) && block.getFieldValue('NAME') === event.oldValue
        && resolveNameBinding(block, event.oldValue, { block: declaration, oldName: event.oldValue }) === declaration) block.setFieldValue(event.newValue, 'NAME')
    }
  } finally { Blockly.Events.setGroup(false) }
}

// Editable names remain serializable text fields, with a dropdown of visible
// names for references. This preserves legacy NAME fields and supports scope.
export function visibleNames(block, functions = false) {
  const names = new Set()
  for (const candidate of block.workspace.getAllBlocks(false)) {
    if (functions ? ['js_function_def', 'js_arrow_function', 'js_async_function'].includes(candidate.type)
      : ['js_let', 'js_const', 'js_var_decl'].includes(candidate.type) || (block.type === 'js_get_var' && functionTypes.has(candidate.type))) {
      if (scopeChain(block).includes(scopeChain(candidate)[0])) names.add(candidate.getFieldValue('NAME'))
    }
  }
  let parent = block.getSurroundParent?.()
  while (parent) {
    if (!functions) {
      if (parent.getField('PARAMS')) for (const name of parent.getFieldValue('PARAMS').split(',')) if (isIdentifier(name.trim())) names.add(name.trim())
      if (parent.getField('VAR')) names.add(parent.getFieldValue('VAR'))
      if (parent.type.includes('event_listener') || parent.type === 'js_window_event' || parent.type === 'js_listen') names.add('event')
      if (parent.type === 'js_fetch_get') names.add('data')
      if (parent.type === 'js_fetch_post') names.add('result')
      const scopes = scopeChain(block)
      if (parent.getField('RESULT') && (parent.type !== 'js_fetch_request' || scopes.includes(`${parent.id}:SUCCESS`))) names.add(parent.getFieldValue('RESULT'))
      if (parent.getField('ERR') && ['CATCH', 'ERROR'].some(input => scopes.includes(`${parent.id}:${input}`))) names.add(parent.getFieldValue('ERR'))
    }
    parent = parent.getSurroundParent?.()
  }
  return [...names].filter(isIdentifier)
}

export function addNamePicker(block, fieldName, functions = false) {
  const input = block.inputList.find(i => i.fieldRow.some(f => f.name === fieldName))
  if (!input) return
  input.appendField(new Blockly.FieldDropdown(() => {
    const names = visibleNames(block, functions)
    return [['names', '__choose__'], ...names.map(n => [n, n])]
  }, value => { if (value !== '__choose__') block.setFieldValue(value, fieldName); return '__choose__' }), `PICK_${fieldName}`)
}

import { Blockly } from './core.js'
import { isIdentifier, validNameField, addNamePicker, resolveNameBinding } from './jsSupport.js'
import { learningColour } from './learningColours.js'

const wrappers = new Set(['js_script_body', 'js_script_head', 'html_script_inline'])
const functions = new Set(['js_function_def', 'js_arrow_function', 'js_async_function', 'procedures_defreturn', 'procedures_defnoreturn', 'js_callback'])
const handlers = new Set(['js_add_event_listener', 'js_listen', 'js_window_event', 'js_dom_content_loaded', 'js_fetch_get', 'js_fetch_post', 'js_fetch_request', 'js_ask_text', 'js_timer_value', 'js_request_frame', 'js_set_timeout', 'js_set_interval', 'js_set_timeout_var', 'js_set_interval_var'])
const loops = new Set(['js_while', 'js_do_while', 'js_for_count', 'js_for_range', 'js_for_of', 'js_for_in', 'controls_repeat_ext', 'controls_whileUntil', 'controls_for', 'controls_forEach'])
const optional = new Set(['js_array_create', 'js_empty_array'])
const identifierFields = new Set(['NAME', 'VAR', 'ERR', 'RESULT', 'ITEM', 'INDEX_NAME'])

export function enhanceJSBlocks() {
  for (const [type, definition] of Object.entries(Blockly.Blocks)) {
    if (!type.startsWith('js_') && !wrappers.has(type)) continue
    const original = definition.init
    definition.init = function () {
      original.call(this)
      this.setColour(learningColour(this.getColour()))
      if (wrappers.has(type)) this.getInput('CONTENT')?.setCheck('JSStatement')
      else {
        if (this.previousConnection) this.setPreviousStatement(true, 'JSStatement')
        if (this.nextConnection) this.setNextStatement(true, 'JSStatement')
      }
      for (const input of this.inputList) {
        if (input.type === Blockly.inputs.inputTypes.STATEMENT && !wrappers.has(type)) input.setCheck('JSStatement')
        for (const field of input.fieldRow) {
          if (identifierFields.has(field.name) && field instanceof Blockly.FieldTextInput) field.setValidator(value => validNameField(type, field.name, value) ? value : null)
          if (field.name === 'PARAMS') field.setValidator(value => value.trim() === '' || value.split(',').every(n => isIdentifier(n.trim())) ? value : null)
          if (field.name === 'CLASS' && ['js_new_instance', 'js_instanceof'].includes(type)) field.setValidator(value => value.split('.').every(isIdentifier) ? value : null)
        }
      }
      if (['js_get_var', 'js_set_var', 'js_compound_assign', 'js_increment'].includes(type)) addNamePicker(this, 'NAME')
      if (['js_call', 'js_call_value', 'js_function_call_stmt', 'js_function_call_expr'].includes(type)) addNamePicker(this, 'NAME', true)
      if (type === 'js_logic_op' || type === 'js_arithmetic') this.setOutput(true, null)
      if (type === 'js_get_style') this.setTooltip('Get an inline style value. Use computed style to read CSS stylesheet values.')
      if (type === 'js_event_target') this.inputList[0].fieldRow[0].setValue('event.target (element that triggered the event)')
      if (type === 'js_for_range') this.setTooltip('Count from start up to, but excluding, end; increases by 1.')
    }
  }
}

export function workspaceDiagnostics(workspace, filename = 'index.html') {
  const issues = []
  const extension = filename.split('.').pop().toLowerCase()
  const issue = (block, message, severity = 'error') => issues.push({ blockId: block.id, message, severity })
  for (const block of workspace.getAllBlocks(false)) {
    if (!block.isEnabled()) continue
    const type = block.type
    const ancestors = []
    let parent = block.getSurroundParent()
    while (parent) { ancestors.push(parent); parent = parent.getSurroundParent() }
    const boundary = ancestors.find(p => functions.has(p.type) || handlers.has(p.type))
    const script = ancestors.find(p => wrappers.has(p.type))
    if (['js_alert', 'js_confirm', 'js_prompt'].includes(type)) issue(block, 'Browser dialogs may be blocked in preview. Use page dialog blocks for reliable practice.', 'hint')
    const reusableLanguage = type === 'webbed_reusable' ? block.definition?.language : null
    const isJS = reusableLanguage === 'js' || type.startsWith('js_') || type.startsWith('procedures_') || type.startsWith('variables_') || type.startsWith('controls_')
    if (reusableLanguage && reusableLanguage !== extension && !(extension === 'html' && reusableLanguage === 'js' && script)) issue(block, `This reusable block belongs in a .${reusableLanguage} file.`)
    if (script && !isJS && !['math_number', 'text', 'logic_boolean', 'logic_null'].includes(type)) issue(block, 'Use JavaScript blocks inside a script tag.')
    if (extension === 'js' && !isJS && !['math_number', 'text', 'logic_boolean', 'logic_null'].includes(type)) issue(block, 'This block belongs in an HTML or CSS file.')
    if (extension === 'css' && isJS) issue(block, 'JavaScript belongs in a .js file or an HTML script tag.')
    if (extension === 'html' && isJS && !wrappers.has(type) && !script && !type.startsWith('procedures_def') && !ancestors.some(p => p.type.startsWith('procedures_def'))) issue(block, 'Put JavaScript inside a script tag, or use a .js file.')
    if (['js_return', 'js_return_void'].includes(type) && !boundary) issue(block, 'Return needs a function or callback.')
    if (type === 'js_await' && !['js_async_function', 'js_fetch_get', 'js_fetch_post', 'js_fetch_request'].includes(boundary?.type)) issue(block, 'Await needs an async function.')
    if (['js_break', 'js_continue'].includes(type)) {
      const containers = []
      for (const ancestor of ancestors) {
        if (functions.has(ancestor.type) || handlers.has(ancestor.type)) break
        containers.push(ancestor.type)
      }
      if (!containers.some(t => loops.has(t) || (type === 'js_break' && t === 'js_switch'))) issue(block, `${type === 'js_break' ? 'Break' : 'Continue'} needs a surrounding loop${type === 'js_break' ? ' or switch' : ''}.`)
    }
    if (type.startsWith('js_event_') || ['js_prevent_default', 'js_stop_propagation'].includes(type)) {
      if (!ancestors.some(p => ['js_add_event_listener', 'js_window_event', 'js_listen'].includes(p.type))) issue(block, 'Event information belongs inside an event handler.')
    }
    if (type === 'js_spread' && !['js_array_create', 'js_array_new', 'js_call', 'js_call_value'].includes(block.getParent()?.type)) issue(block, 'Spread belongs in an array or argument list.')
    if (['js_set_var', 'js_compound_assign', 'js_increment', 'variables_set'].includes(type)) {
      const name = type === 'variables_set' ? block.getField('VAR').getVariable()?.name : block.getFieldValue('NAME')
      if (['js_const', 'js_arrow_function'].includes(resolveNameBinding(block, name)?.type)) issue(block, `${name} is a constant. Use let if you need to assign a new value.`)
    }
    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        if (type.startsWith('js_') && identifierFields.has(field.name) && field instanceof Blockly.FieldTextInput && !validNameField(type, field.name, field.getValue())) issue(block, `Choose a valid ${field.name.toLowerCase()} without spaces or reserved words.`)
      }
      if (type.startsWith('js_') && input.type === Blockly.inputs.inputTypes.VALUE && !input.connection.targetBlock() && !optional.has(type) && !['END', 'DEFAULT', 'BODY_DATA', 'ITEMS'].includes(input.name)) issue(block, `Connect a value to ${input.name.toLowerCase().replaceAll('_', ' ')}.`)
    }
  }
  return issues
}

export function showWorkspaceDiagnostics(workspace, filename) {
  const issues = workspaceDiagnostics(workspace, filename)
  for (const block of workspace.getAllBlocks(false)) {
    const messages = issues.filter(issue => issue.blockId === block.id).map(issue => issue.message)
    block.setWarningText(messages.length ? messages.join('\n') : null, 'javascript-learning')
  }
  return issues
}

import { Blockly } from './core.js'
import { javascriptGenerator, Order } from 'blockly/javascript'
import { quoteJS, valueCode as value, statementCode as statements, validateIdentifier } from './jsSupport.js'

const colours = { data: '#E6A817', list: '#9B59B6', function: '#8E44AD', dom: '#2471A3', event: '#E74C3C', logic: '#4285F4', api: '#607D8B' }
const buttonImage = label => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" rx="4" fill="#ffffff33"/><text x="10" y="15" text-anchor="middle" fill="white" font-size="18">${label}</text></svg>`)
function resize(block, count) {
  const before = JSON.stringify(block.saveExtraState())
  Blockly.Events.setGroup(true)
  try {
    block.itemCount_ = Math.max(block.minimum_ ?? 0, Math.min(32, count))
    block.updateShape_()
    const after = JSON.stringify(block.saveExtraState())
    if (before !== after) Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, before, after))
  } finally { Blockly.Events.setGroup(false) }
}
function controls(block, label) {
  block.appendDummyInput('HEADER').appendField(label)
    .appendField(new Blockly.FieldImage(buttonImage('+'), 20, 20, 'Add item', () => resize(block, block.itemCount_ + 1)))
    .appendField(new Blockly.FieldImage(buttonImage('−'), 20, 20, 'Remove last item', () => resize(block, block.itemCount_ - 1)))
}
const counted = {
  saveExtraState() { return { itemCount: this.itemCount_ } },
  loadExtraState(state) {
    this.itemCount_ = Math.max(this.minimum_ ?? 0, Math.min(32, Number.isInteger(state.itemCount) ? state.itemCount : 0))
    this.updateShape_()
  },
  mutationToDom() { const node = Blockly.utils.xml.createElement('mutation'); node.setAttribute('items', this.itemCount_); return node },
  domToMutation(node) { this.loadExtraState({ itemCount: Number(node.getAttribute('items')) }) },
}
function inputs(block, prefix, count, decorate) {
  for (let i = 0; i < count; i++) if (!block.getInput(`${prefix}${i}`)) decorate(block.appendValueInput(`${prefix}${i}`).setCheck(null), i)
  for (let i = count; block.getInput(`${prefix}${i}`); i++) block.removeInput(`${prefix}${i}`)
}
function shape(block, colour, output = null, statement = false) {
  block.setColour(colour)
  block.setInputsInline(false)
  if (statement) { block.setPreviousStatement(true, 'JSStatement'); block.setNextStatement(true, 'JSStatement') }
  else block.setOutput(true, output)
}
function jsonBlock(type, message0, args0, output, colour, tooltip, statement = false) {
  Blockly.Blocks[type] = { init() {
    this.jsonInit({ message0, args0, ...(statement ? { previousStatement: 'JSStatement', nextStatement: 'JSStatement' } : { output }), colour, tooltip,
      helpUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting' })
  } }
}
const socket = name => ({ type: 'input_value', name })
const text = (name, value) => ({ type: 'field_input', name, text: value })
const dropdown = (name, options) => ({ type: 'field_dropdown', name, options })

export function defineJSLearningBlocks() {
  Blockly.Blocks.js_array_new = {
    ...counted,
    init() { this.itemCount_ = 2; controls(this, 'list'); shape(this, colours.list, 'Array'); this.updateShape_(); this.setTooltip('Add or remove connected list items. Zero items makes an empty array.') },
    updateShape_() { inputs(this, 'ITEM', this.itemCount_, (input, index) => input.appendField(`item ${index + 1}`)) },
  }
  javascriptGenerator.forBlock.js_array_new = block => [`[${Array.from({ length: block.itemCount_ }, (_, i) => value(block, `ITEM${i}`, Order.COMMA)).join(', ')}]`, Order.ATOMIC]

  Blockly.Blocks.js_object_new = {
    ...counted,
    init() { this.itemCount_ = 2; controls(this, 'object'); shape(this, colours.list); this.updateShape_(); this.setTooltip('Connect values to named properties. Values can be strings, numbers, booleans, lists, or objects.') },
    updateShape_() { inputs(this, 'VALUE', this.itemCount_, (input, i) => input.appendField(new Blockly.FieldTextInput(`key${i + 1}`), `KEY${i}`).appendField(':')) },
  }
  javascriptGenerator.forBlock.js_object_new = block => [`({ ${Array.from({ length: block.itemCount_ }, (_, i) => `${quoteJS(block.getFieldValue(`KEY${i}`))}: ${value(block, `VALUE${i}`, Order.COMMA)}`).join(', ')} })`, Order.ATOMIC]

  for (const [type, statement] of [['js_call', true], ['js_call_value', false]]) {
    Blockly.Blocks[type] = {
      ...counted,
      init() {
        this.itemCount_ = 1; controls(this, statement ? 'call function' : 'function result')
        this.getInput('HEADER').appendField(new Blockly.FieldTextInput('myFunction', validateIdentifier), 'NAME')
        shape(this, colours.function, null, statement); this.updateShape_()
        this.setTooltip('Choose a function name and connect one value per argument. Use + or − to change the number of arguments.')
      },
      updateShape_() { inputs(this, 'ARG', this.itemCount_, (input, i) => input.appendField(`argument ${i + 1}`)) },
    }
    javascriptGenerator.forBlock[type] = block => {
      const code = `${block.getFieldValue('NAME')}(${Array.from({ length: block.itemCount_ }, (_, i) => value(block, `ARG${i}`, Order.COMMA)).join(', ')})`
      return statement ? `${code};\n` : [code, Order.FUNCTION_CALL]
    }
  }

  Blockly.Blocks.js_callback = {
    init() {
      this.appendDummyInput().appendField('callback (').appendField(new Blockly.FieldTextInput('item, index'), 'PARAMS').appendField(')')
      this.appendStatementInput('BODY').setCheck('JSStatement').appendField('do')
      shape(this, colours.function); this.setTooltip('A function value for map, filter, find, or forEach. Add return inside to supply a result.')
    },
  }
  javascriptGenerator.forBlock.js_callback = block => [`((${block.getFieldValue('PARAMS')}) => {\n${statements(block, 'BODY')}})`, Order.ATOMIC]

  Blockly.Blocks.js_if_expandable = {
    ...counted,
    init() {
      this.itemCount_ = 1; this.minimum_ = 1; controls(this, 'choose'); shape(this, colours.logic, null, true)
      this.updateShape_(); this.setTooltip('Add else-if branches with +. The else branch runs when no condition matches.')
    },
    updateShape_() {
      if (this.getInput('ELSE')) this.removeInput('ELSE')
      for (let i = 0; i < this.itemCount_; i++) {
        if (!this.getInput(`COND${i}`)) this.appendValueInput(`COND${i}`).appendField(i ? 'else if' : 'if')
        if (!this.getInput(`BODY${i}`)) this.appendStatementInput(`BODY${i}`).setCheck('JSStatement').appendField('do')
      }
      for (let i = this.itemCount_; this.getInput(`COND${i}`); i++) { this.removeInput(`COND${i}`); this.removeInput(`BODY${i}`) }
      this.appendStatementInput('ELSE').setCheck('JSStatement').appendField('else')
    },
  }
  // Keep the else connection when branches are resized.
  const updateConditional = Blockly.Blocks.js_if_expandable.updateShape_
  Blockly.Blocks.js_if_expandable.updateShape_ = function () {
    const connection = this.getInput('ELSE')?.connection.targetConnection
    updateConditional.call(this)
    if (connection) connection.reconnect(this, 'ELSE')
  }
  javascriptGenerator.forBlock.js_if_expandable = block => Array.from({ length: block.itemCount_ }, (_, i) => `${i ? 'else ' : ''}if (${value(block, `COND${i}`)}) {\n${statements(block, `BODY${i}`)}} `).join('') + `else {\n${statements(block, 'ELSE')}}\n`

  jsonBlock('js_array_transform', '%1 %2 with %3', [socket('ARR'), dropdown('METHOD', [['map each item', 'map'], ['filter matching items', 'filter'], ['find first match', 'find']]), socket('CALLBACK')], null, colours.list, 'Map returns a new list, filter keeps matching items, and find returns the first match or undefined.')
  javascriptGenerator.forBlock.js_array_transform = block => [`${value(block, 'ARR')}.${block.getFieldValue('METHOD')}(${value(block, 'CALLBACK')})`, Order.FUNCTION_CALL]
  jsonBlock('js_for_each', 'for each item in %1 run %2', [socket('ARR'), socket('CALLBACK')], null, colours.list, 'Run a callback for each item. forEach does not return a list.', true)
  javascriptGenerator.forBlock.js_for_each = block => `${value(block, 'ARR')}.forEach(${value(block, 'CALLBACK')});\n`
  jsonBlock('js_array_take', 'remove and return %1 item of %2', [dropdown('METHOD', [['last', 'pop'], ['first', 'shift']]), socket('ARR')], null, colours.list, 'Remove one item and use its value. An empty list returns undefined.')
  javascriptGenerator.forBlock.js_array_take = block => [`${value(block, 'ARR')}.${block.getFieldValue('METHOD')}()`, Order.FUNCTION_CALL]
  jsonBlock('js_array_sort_numeric', 'sort numbers in %1 %2', [socket('ARR'), dropdown('DIRECTION', [['ascending', 'ASC'], ['descending', 'DESC']])], null, colours.list, 'Sort the original list by numeric value.', true)
  javascriptGenerator.forBlock.js_array_sort_numeric = block => `${value(block, 'ARR')}.sort((a, b) => ${block.getFieldValue('DIRECTION') === 'ASC' ? 'a - b' : 'b - a'});\n`
  jsonBlock('js_expression_statement', 'run %1', [socket('VALUE')], null, colours.function, 'Run an expression and discard its result.', true)
  javascriptGenerator.forBlock.js_expression_statement = block => `${value(block, 'VALUE')};\n`

  jsonBlock('js_coalesce', '%1 or, if missing, %2', [socket('VALUE'), socket('FALLBACK')], null, colours.logic, 'Use the fallback only for null or undefined. Zero and empty strings are kept.')
  javascriptGenerator.forBlock.js_coalesce = block => [`${value(block, 'VALUE')} ?? ${value(block, 'FALLBACK')}`, Order.LOGICAL_OR]
  jsonBlock('js_optional_property', 'optional property %1 of %2', [text('PROP', 'name'), socket('OBJ')], null, colours.list, 'Read a property safely when an object may be null or undefined.')
  javascriptGenerator.forBlock.js_optional_property = block => [`${value(block, 'OBJ')}?.[${quoteJS(block.getFieldValue('PROP'))}]`, Order.MEMBER]

  jsonBlock('js_set_attribute_value', 'set attribute %1 of %2 to %3', [text('ATTR', 'aria-label'), socket('ELEM'), socket('VALUE')], null, colours.dom, 'Set an attribute using a connected value.', true)
  javascriptGenerator.forBlock.js_set_attribute_value = block => `${value(block, 'ELEM')}.setAttribute(${quoteJS(block.getFieldValue('ATTR'))}, ${value(block, 'VALUE')});\n`
  jsonBlock('js_set_style_value', 'set CSS property %1 of %2 to %3', [text('PROP', 'background-color'), socket('ELEM'), socket('VALUE')], null, colours.dom, 'Use CSS names such as background-color. Connect a text or number value.', true)
  javascriptGenerator.forBlock.js_set_style_value = block => `${value(block, 'ELEM')}.style.setProperty(${quoteJS(block.getFieldValue('PROP'))}, ${value(block, 'VALUE')});\n`
  jsonBlock('js_get_computed_style', 'computed CSS property %1 of %2', [text('PROP', 'color'), socket('ELEM')], 'String', colours.dom, 'Read the rendered style, including values from CSS stylesheets.')
  javascriptGenerator.forBlock.js_get_computed_style = block => [`getComputedStyle(${value(block, 'ELEM')}).getPropertyValue(${quoteJS(block.getFieldValue('PROP'))})`, Order.FUNCTION_CALL]
  jsonBlock('js_class_value', '%1 class %2 on %3', [dropdown('METHOD', [['add', 'add'], ['remove', 'remove'], ['toggle', 'toggle']]), socket('VALUE'), socket('ELEM')], null, colours.dom, 'Change a CSS class using a connected class name.', true)
  javascriptGenerator.forBlock.js_class_value = block => `${value(block, 'ELEM')}.classList.${block.getFieldValue('METHOD')}(${value(block, 'VALUE')});\n`
  jsonBlock('js_form_property', '%1 of %2', [dropdown('PROP', [['checked state', 'checked'], ['selected index', 'selectedIndex'], ['validation message', 'validationMessage']]), socket('ELEM')], null, colours.event, 'Read checkbox state, selected option index, or form validation feedback.')
  javascriptGenerator.forBlock.js_form_property = block => [`${value(block, 'ELEM')}.${block.getFieldValue('PROP')}`, Order.MEMBER]
  jsonBlock('js_set_checked', 'set checked state of %1 to %2', [socket('ELEM'), socket('VALUE')], null, colours.event, 'Check or uncheck a checkbox using true or false.', true)
  javascriptGenerator.forBlock.js_set_checked = block => `${value(block, 'ELEM')}.checked = ${value(block, 'VALUE')};\n`
  jsonBlock('js_form_valid', 'is %1 valid?', [socket('ELEM')], 'Boolean', colours.event, 'Check HTML validation rules such as required, type, min, and pattern.')
  javascriptGenerator.forBlock.js_form_valid = block => [`${value(block, 'ELEM')}.checkValidity()`, Order.FUNCTION_CALL]
  jsonBlock('js_focus', 'focus %1', [socket('ELEM')], null, colours.event, 'Move keyboard focus to an element.', true)
  javascriptGenerator.forBlock.js_focus = block => `${value(block, 'ELEM')}.focus();\n`
  jsonBlock('js_event_current_target', 'event.currentTarget (element with the listener)', [], null, colours.event, 'The element whose event listener is currently running.')
  javascriptGenerator.forBlock.js_event_current_target = () => ['event.currentTarget', Order.MEMBER]

  Blockly.Blocks.js_listen = { init() {
    this.appendValueInput('ELEM').appendField('when')
    this.appendDummyInput().appendField(new Blockly.FieldTextInput('click'), 'EVENT').appendField(new Blockly.FieldDropdown([['every time', 'NORMAL'], ['once', 'ONCE']]), 'OPTION')
    this.appendStatementInput('HANDLER').setCheck('JSStatement').appendField('do (event)')
    shape(this, colours.event, null, true); this.setTooltip('Listen for any event name. event is available inside this handler.')
  } }
  javascriptGenerator.forBlock.js_listen = block => `${value(block, 'ELEM')}.addEventListener(${quoteJS(block.getFieldValue('EVENT'))}, function(event) {\n${statements(block, 'HANDLER')}}, { once: ${block.getFieldValue('OPTION') === 'ONCE'} });\n`
  jsonBlock('js_remove_listener', 'remove %1 listener %2 from %3', [text('EVENT', 'click'), socket('HANDLER'), socket('ELEM')], null, colours.event, 'Use the same named function reference that was passed to addEventListener.', true)
  javascriptGenerator.forBlock.js_remove_listener = block => `${value(block, 'ELEM')}.removeEventListener(${quoteJS(block.getFieldValue('EVENT'))}, ${value(block, 'HANDLER')});\n`
  jsonBlock('js_listener_ref', 'listen for %1 on %2 using %3 %4', [text('EVENT', 'click'), socket('ELEM'), socket('HANDLER'), dropdown('OPTION', [['every time', 'NORMAL'], ['once', 'ONCE']])], null, colours.event, 'Connect a named function reference so the same listener can be removed later.', true)
  javascriptGenerator.forBlock.js_listener_ref = block => `${value(block, 'ELEM')}.addEventListener(${quoteJS(block.getFieldValue('EVENT'))}, ${value(block, 'HANDLER')}, { once: ${block.getFieldValue('OPTION') === 'ONCE'} });\n`

  jsonBlock('js_array_splice_value', 'splice %1 at %2 remove %3 insert items %4 (optional)', [socket('ARR'), socket('START'), socket('COUNT'), socket('ITEMS')], 'Array', colours.list, 'Modify the original array and return removed items. Connect an array of new items to insert, or leave it empty.')
  javascriptGenerator.forBlock.js_array_splice_value = block => {
    const items = javascriptGenerator.valueToCode(block, 'ITEMS', Order.ATOMIC)
    return [`${value(block, 'ARR')}.splice(${value(block, 'START')}, ${value(block, 'COUNT')}${items ? `, ...${items}` : ''})`, Order.FUNCTION_CALL]
  }
  Blockly.Blocks.js_timer_value = { init() {
    this.appendValueInput('DELAY').appendField(new Blockly.FieldDropdown([['after', 'setTimeout'], ['every', 'setInterval']]), 'METHOD')
    this.appendDummyInput().appendField('milliseconds')
    this.appendStatementInput('BODY').setCheck('JSStatement').appendField('do')
    shape(this, '#0C7563', 'Number'); this.setTooltip('Start a timer and return its ID. Store the result to cancel it later.')
  } }
  javascriptGenerator.forBlock.js_timer_value = block => [`${block.getFieldValue('METHOD')}(function() {\n${statements(block, 'BODY')}}, ${value(block, 'DELAY')})`, Order.FUNCTION_CALL]
  jsonBlock('js_cancel_timer', 'cancel %1 %2', [dropdown('METHOD', [['timeout', 'clearTimeout'], ['interval', 'clearInterval']]), socket('ID')], null, '#0C7563', 'Connect the ID returned by the timer.', true)
  javascriptGenerator.forBlock.js_cancel_timer = block => `${block.getFieldValue('METHOD')}(${value(block, 'ID')});\n`
  Blockly.Blocks.js_request_frame = { init() {
    this.appendDummyInput().appendField('on next animation frame (time)').appendField(new Blockly.FieldTextInput('time', validateIdentifier), 'VAR')
    this.appendStatementInput('BODY').setCheck('JSStatement').appendField('do')
    shape(this, '#0C7563', 'Number'); this.setTooltip('Run once before the next repaint. Returns an ID that can cancel this frame; the named time is in milliseconds.')
  } }
  javascriptGenerator.forBlock.js_request_frame = block => [`requestAnimationFrame(function(${block.getFieldValue('VAR')}) {\n${statements(block, 'BODY')}})`, Order.FUNCTION_CALL]
  jsonBlock('js_cancel_frame', 'cancel animation frame %1', [socket('ID')], null, '#0C7563', 'Cancel a pending animation frame using its ID.', true)
  javascriptGenerator.forBlock.js_cancel_frame = block => `cancelAnimationFrame(${value(block, 'ID')});\n`

  Blockly.Blocks.js_fetch_request = { init() {
    this.appendValueInput('URL').appendField('request').appendField(new Blockly.FieldDropdown([['GET', 'GET'], ['POST', 'POST']]), 'METHOD')
    this.appendValueInput('BODY_DATA').appendField('JSON body (POST only)')
    this.appendDummyInput().appendField('read as').appendField(new Blockly.FieldDropdown([['JSON', 'json'], ['text', 'text'], ['no body', 'none']]), 'FORMAT')
    this.appendStatementInput('SUCCESS').setCheck('JSStatement').appendField('on success').appendField(new Blockly.FieldTextInput('data', validateIdentifier), 'RESULT')
    this.appendStatementInput('ERROR').setCheck('JSStatement').appendField('on error').appendField(new Blockly.FieldTextInput('error', validateIdentifier), 'ERR')
    shape(this, colours.api, null, true); this.setTooltip('Request data. Work with the result inside on success; handle HTTP and network errors inside on error. The following stack does not wait for the request.')
  } }
  javascriptGenerator.forBlock.js_fetch_request = block => {
    const options = block.getFieldValue('METHOD') === 'POST' ? `, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(${value(block, 'BODY_DATA')}) }` : ''
    const format = block.getFieldValue('FORMAT')
    return `(async () => {\n  try {\n    const response = await fetch(${value(block, 'URL')}${options});\n    if (!response.ok) throw new Error('HTTP ' + response.status);\n    const ${block.getFieldValue('RESULT')} = ${format === 'none' ? 'null' : `response.status === 204 ? null : await response.${format}()`};\n${statements(block, 'SUCCESS')}  } catch (${block.getFieldValue('ERR')}) {\n${statements(block, 'ERROR') || `    console.error(${block.getFieldValue('ERR')});\n`}  }\n})();\n`
  }
  jsonBlock('js_fetch_value', 'fetch response from %1', [socket('URL')], null, colours.api, 'A Promise for use with await in an async function. Check response.ok before reading the body.')
  javascriptGenerator.forBlock.js_fetch_value = block => [`fetch(${value(block, 'URL')})`, Order.FUNCTION_CALL]

  jsonBlock('js_show_dialog', 'show page dialog %1', [socket('TEXT')], null, colours.dom, 'Show a message in an HTML dialog with a Close button.', true)
  javascriptGenerator.forBlock.js_show_dialog = block => {
    const helper = javascriptGenerator.provideFunction_('__webbedShowPageDialog', [
      `function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(message) {`,
      '  const dialog = document.createElement("dialog");',
      '  const text = document.createElement("p"); text.textContent = String(message);',
      '  const close = document.createElement("button"); close.textContent = "Close";',
      '  close.addEventListener("click", () => dialog.close());',
      '  dialog.addEventListener("close", () => dialog.remove(), { once: true });',
      '  dialog.append(text, close); document.body.append(dialog); dialog.showModal();',
      '}',
    ])
    return `${helper}(${value(block, 'TEXT')});\n`
  }
  Blockly.Blocks.js_ask_text = { init() {
    this.appendValueInput('TEXT').appendField('ask for text')
    this.appendStatementInput('BODY').setCheck('JSStatement').appendField('on answer').appendField(new Blockly.FieldTextInput('answer', validateIdentifier), 'RESULT')
    shape(this, colours.dom, null, true); this.setTooltip('Ask using an HTML dialog. Use the named answer inside on answer. Escape cancels the question.')
  } }
  javascriptGenerator.forBlock.js_ask_text = block => {
    const helper = javascriptGenerator.provideFunction_('__webbedAskPageText', [
      `function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}(message) {`,
      '  return new Promise(resolve => {',
      '    const dialog = document.createElement("dialog");',
      '    const label = document.createElement("label"); label.textContent = String(message);',
      '    const input = document.createElement("input"); label.append(input);',
      '    const submit = document.createElement("button"); submit.textContent = "Submit";',
      '    let answer = null; submit.addEventListener("click", () => { answer = input.value; dialog.close(); });',
      '    dialog.addEventListener("close", () => { resolve(answer); dialog.remove(); }, { once: true });',
      '    dialog.append(label, submit); document.body.append(dialog); dialog.showModal(); input.focus();',
      '  });',
      '}',
    ])
    return `${helper}(${value(block, 'TEXT')}).then(function(${block.getFieldValue('RESULT')}) {\n${statements(block, 'BODY')}});\n`
  }
}

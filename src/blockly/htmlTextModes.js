import { Blockly } from './core.js'
import { javascriptGenerator, Order } from 'blockly/javascript'
import { escapeAttribute } from './htmlAttributes.js'

const tags = { heading: 'h', paragraph: 'p', a_tag: 'a', strong: 'strong', em: 'em', html_b: 'b', html_i: 'i', html_mark: 'mark', html_small: 'small', html_del: 'del', html_ins: 'ins', html_sub: 'sub', html_sup: 'sup' }
const escapeText = text => String(text ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const mixin = {
  saveExtraState() { return { mode: this.textMode_, text: this.getFieldValue('TEXT') ?? this.savedText_ ?? '' } },
  loadExtraState(state) {
    this.savedText_ = state.text ?? ''
    this.textMode_ = state.mode === 'BLOCKS' ? 'BLOCKS' : 'TEXT'
    this.updateTextShape_()
    this.loadingTextMode_ = true
    try { this.setFieldValue(this.textMode_, 'TEXT_MODE') } finally { this.loadingTextMode_ = false }
  },
  mutationToDom() {
    const node = Blockly.utils.xml.createElement('mutation')
    const state = this.saveExtraState()
    node.setAttribute('mode', state.mode); node.setAttribute('text', state.text)
    return node
  },
  domToMutation(node) { this.loadExtraState({ mode: node.getAttribute('mode'), text: node.getAttribute('text') }) },
  updateTextShape_() {
    if (this.textMode_ === 'BLOCKS') {
      if (this.getInput('TEXT_VALUE')) this.removeInput('TEXT_VALUE')
      if (!this.getInput('CONTENT')) this.appendStatementInput('CONTENT').setCheck('body_element')
      this.moveInputBefore('CONTENT', 'TEXT_CLOSE')
    } else {
      if (this.getInput('CONTENT')) this.removeInput('CONTENT')
      if (!this.getInput('TEXT_VALUE')) this.appendDummyInput('TEXT_VALUE').appendField(new Blockly.FieldTextInput(this.savedText_ ?? ''), 'TEXT')
      else this.setFieldValue(this.savedText_ ?? '', 'TEXT')
      this.moveInputBefore('TEXT_VALUE', 'TEXT_CLOSE')
    }
  },
  switchTextMode_(mode) {
    if (this.loadingTextMode_ || mode === this.textMode_ || !Blockly.Events.getRecordUndo()) return mode
    const children = []
    for (let child = this.getInputTargetBlock('CONTENT'); child; child = child.getNextBlock()) children.push(child)
    if (mode === 'TEXT' && children.some(child => child.type !== 'html_plain_text' || !child.isEnabled())) {
      this.setWarningText('This content includes elements. Move them out before switching to Text.', 'text-mode')
      return null
    }
    this.setWarningText(null, 'text-mode')
    const before = JSON.stringify(this.saveExtraState())
    const group = Blockly.Events.getGroup()
    Blockly.Events.setGroup(group || true)
    try {
      const text = mode === 'BLOCKS' ? this.getFieldValue('TEXT') : children.map(child => child.getFieldValue('TEXT')).join('')
      // Dispose before changing shape so undo restores the cavity before children.
      if (mode === 'TEXT' && children.length) children[0].dispose(false)
      this.savedText_ = text ?? ''
      this.textMode_ = mode
      this.updateTextShape_()
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, before, JSON.stringify(this.saveExtraState())))
      if (mode === 'BLOCKS') {
        const child = Blockly.serialization.blocks.append({ type: 'html_plain_text', fields: { TEXT: this.savedText_ } }, this.workspace, { recordUndo: true })
        this.getInput('CONTENT').connection.connect(child.previousConnection)
      }
      this.loadingTextMode_ = true
      try { this.setFieldValue(mode, 'TEXT_MODE') } finally { this.loadingTextMode_ = false }
    } finally { Blockly.Events.setGroup(group) }
    // The grouped inner change already updated the dropdown.
    return null
  },
}

export function defineTextModes() {
  for (const [type, tag] of Object.entries(tags)) {
    const definition = Blockly.Blocks[type], init = definition.init
    Object.assign(definition, mixin)
    definition.init = function () {
      init.call(this)
      this.savedText_ = this.getFieldValue('TEXT')
      this.textMode_ = 'TEXT'
      const oldInput = this.inputList.find(input => input.fieldRow.some(field => field.name === 'TEXT'))
      this.removeInput(oldInput.name)
      this.appendDummyInput('TEXT_OPEN').appendField('>')
        .appendField(new Blockly.FieldDropdown([['Text', 'TEXT'], ['Blocks', 'BLOCKS']], value => this.switchTextMode_(value)), 'TEXT_MODE')
      this.appendDummyInput('TEXT_CLOSE').appendField(`</${tag === 'h' ? 'h' : tag}>`)
      this.updateTextShape_()
      this.setInputsInline(true)
    }
  }
}

// Walk the statement chain without statementToCode's indentation. Known inline
// elements return exact content, preserving spaces and punctuation typed by users.
function inlineContent(block, generator) {
  let result = ''
  for (let child = block.getInputTargetBlock('CONTENT'); child; child = child.getNextBlock()) {
    if (!child.isEnabled()) continue
    result += generator.blockToCode(child, true)
  }
  return result
}

export function defineTextModeGenerators() {
  javascriptGenerator.forBlock.html_plain_text = block => escapeText(block.getFieldValue('TEXT'))
  for (const [type, tag] of Object.entries({ ...tags, span: 'span' })) {
    javascriptGenerator.forBlock[type] = (block, generator) => {
      const name = tag === 'h' ? `h${block.getFieldValue('LEVEL')}` : tag
      const attrs = generator.valueToCode(block, 'attributes', Order.ATOMIC) || ''
      const href = type === 'a_tag' ? ` href="${escapeAttribute(block.getFieldValue('URL'))}"` : ''
      const content = block.getInput('CONTENT') ? inlineContent(block, generator) : escapeText(block.getFieldValue('TEXT'))
      return `<${name}${href}${attrs}>${content}</${name}>\n`
    }
  }
}

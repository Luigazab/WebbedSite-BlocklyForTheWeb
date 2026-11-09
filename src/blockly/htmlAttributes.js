import { Blockly } from './core.js'
import { javascriptGenerator, Order } from 'blockly/javascript'

const colour = '#F5B945'
export const escapeAttribute = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const inputName = index => index === 0 ? 'body_style' : `ATTR_${index}` // Preserve saved projects.
const icon = sign => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="9" fill="none" stroke="white"/><path d="M5 10h10${sign === '+' ? 'M10 5v10' : ''}" stroke="white" stroke-width="2"/></svg>`)
const validName = name => /^[a-zA-Z_:][a-zA-Z0-9_.:-]*$/.test(name)

export function defineAttributeBlocks() {
  Blockly.Blocks.extra_attributes = {
    init() {
      this.itemCount_ = 1
      this.appendDummyInput('CONTROLS')
        .appendField(new Blockly.FieldImage(icon('+'), 20, 20, 'Add attribute', () => this.resizeAttributes_(this.itemCount_ + 1)))
        .appendField(new Blockly.FieldImage(icon('-'), 20, 20, 'Remove last attribute', () => this.resizeAttributes_(this.itemCount_ - 1)))
      this.setOutput(true, 'attributes')
      this.setInputsInline(true)
      this.setColour(colour)
      this.setTooltip('Combine attributes. + adds a slot; − removes the last slot and detaches its block.')
      this.updateShape_()
    },
    saveExtraState() { return { itemCount: this.itemCount_ } },
    loadExtraState(state) {
      this.itemCount_ = Math.max(0, Math.min(32, Number.isInteger(state?.itemCount) ? state.itemCount : 1))
      this.updateShape_()
    },
    mutationToDom() {
      const node = Blockly.utils.xml.createElement('mutation')
      node.setAttribute('items', this.itemCount_)
      return node
    },
    domToMutation(node) { this.loadExtraState({ itemCount: node.hasAttribute('items') ? Number(node.getAttribute('items')) : 1 }) },
    updateShape_() {
      for (let i = 0; i < this.itemCount_; i++) {
        if (!this.getInput(inputName(i))) this.appendValueInput(inputName(i)).setCheck('attributes')
      }
      for (let i = this.itemCount_; this.getInput(inputName(i)); i++) this.removeInput(inputName(i))
    },
    resizeAttributes_(count) {
      const before = JSON.stringify(this.saveExtraState())
      const group = Blockly.Events.getGroup()
      Blockly.Events.setGroup(group || true)
      try {
        this.loadExtraState({ itemCount: count })
        const after = JSON.stringify(this.saveExtraState())
        if (before !== after) Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, before, after))
      } finally { Blockly.Events.setGroup(group) }
    },
  }

  // Reuse the holder's serialization and undo logic with CSS-only sockets.
  Blockly.Blocks.inline_style_group = {
    ...Blockly.Blocks.extra_attributes,
    init() {
      this.itemCount_ = 1
      this.appendDummyInput('CONTROLS').appendField('styles')
        .appendField(new Blockly.FieldImage(icon('+'), 20, 20, 'Add style', () => this.resizeAttributes_(this.itemCount_ + 1)))
        .appendField(new Blockly.FieldImage(icon('-'), 20, 20, 'Remove last style', () => this.resizeAttributes_(this.itemCount_ - 1)))
      this.setOutput(true, 'internal_style')
      this.setInputsInline(true)
      this.setColour('#34A853')
      this.setTooltip('Combine CSS declarations or typed CSS. Removing a slot detaches its block.')
      this.updateShape_()
    },
    updateShape_() {
      for (let i = 0; i < this.itemCount_; i++) {
        if (!this.getInput(`STYLE_${i}`)) this.appendValueInput(`STYLE_${i}`).setCheck('internal_style')
      }
      for (let i = this.itemCount_; this.getInput(`STYLE_${i}`); i++) this.removeInput(`STYLE_${i}`)
    },
  }
  Blockly.Blocks.inline_style_text = {
    init() {
      this.appendDummyInput().appendField(new Blockly.FieldTextInput(''), 'CSS')
      this.setOutput(true, 'internal_style')
      this.setColour('#34A853')
      this.setTooltip('Type CSS declarations, such as color: red; font-weight: bold; (without a selector or braces).')
    },
  }

  const finish = block => {
    block.setOutput(true, 'attributes')
    block.setInputsInline(true)
    block.setColour(colour)
  }
  const options = names => names.map(name => [name, name])
  Blockly.Blocks.html_global_attribute = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(options(['title', 'lang', 'dir', 'tabindex', 'role', 'contenteditable', 'draggable', 'spellcheck', 'translate', 'accesskey'])), 'ATTR')
        .appendField('=').appendField(new Blockly.FieldTextInput('value'), 'VALUE')
      finish(this)
      this.setTooltip('An optional global attribute. Choose a value appropriate to the selected attribute.')
    },
  }
  for (const [type, prefix, name] of [['html_data_attribute', 'data-', 'name'], ['html_aria_attribute', 'aria-', 'label'], ['html_custom_attribute', '', 'title']]) {
    Blockly.Blocks[type] = {
      init() {
        this.appendDummyInput().appendField(prefix || 'attribute')
          .appendField(new Blockly.FieldTextInput(name, value => validName(value) ? value : null), 'ATTR')
          .appendField('=').appendField(new Blockly.FieldTextInput('value'), 'VALUE')
        finish(this)
        this.setTooltip(prefix ? `Enter the name after ${prefix} and its value.` : 'Optional name/value attribute. Do not repeat an attribute already on the element. Use the boolean block for boolean attributes.')
      },
    }
  }
  Blockly.Blocks.html_boolean_attribute = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(options(['hidden', 'inert', 'autofocus', 'disabled', 'required', 'readonly', 'checked', 'selected', 'multiple', 'open', 'controls', 'autoplay', 'loop', 'muted', 'defer', 'async', 'novalidate'])), 'ATTR')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ENABLED')
      finish(this)
      this.setTooltip('Checked: include the attribute. Unchecked: omit it. Use only on elements that support it.')
    },
  }
}

export function defineAttributeGenerators() {
  javascriptGenerator.forBlock.inline_style_text = block => [block.getFieldValue('CSS') || '', Order.ATOMIC]
  javascriptGenerator.forBlock.inline_style_group = (block, generator) => [
    Array.from({ length: block.itemCount_ }, (_, i) => {
      const css = (generator.valueToCode(block, `STYLE_${i}`, Order.ATOMIC) || '').trim()
      return css && !css.endsWith(';') ? `${css};` : css
    }).filter(Boolean).join(' '), Order.ATOMIC,
  ]
  javascriptGenerator.forBlock.extra_attributes = (block, generator) => [
    Array.from({ length: block.itemCount_ }, (_, i) => generator.valueToCode(block, inputName(i), Order.ATOMIC) || '').join(''),
    Order.ATOMIC,
  ]
  for (const [type, prefix] of [['html_global_attribute', ''], ['html_data_attribute', 'data-'], ['html_aria_attribute', 'aria-'], ['html_custom_attribute', '']]) {
    javascriptGenerator.forBlock[type] = block => {
      const name = prefix + block.getFieldValue('ATTR')
      return [validName(name) ? ` ${name}="${escapeAttribute(block.getFieldValue('VALUE'))}"` : '', Order.ATOMIC]
    }
  }
  javascriptGenerator.forBlock.html_boolean_attribute = block => [block.getFieldValue('ENABLED') === 'TRUE' ? ` ${block.getFieldValue('ATTR')}` : '', Order.ATOMIC]
}

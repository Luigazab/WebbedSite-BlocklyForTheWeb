import * as Blockly from 'blockly/core'
import { FieldColour } from '@blockly/field-colour'
import { defineBlocks } from './defineBlocks'
import { defineGenerators } from './defineGenerators'
import { defineCSSBlocks } from './defineCSSBlocks'
import { defineCSSGenerators } from './defineCSSGenerators'
import { defineJSBlocks } from './defineJSBlocks'
import { defineJSGenerators } from './defineJSGenerators'
import { registerToolboxLabel } from './toolboxLabel'
import { registerCustomCategory } from './customCategory'

let initialized = false

export function initBlockly() {
  if (initialized) return 
  initialized = true

  Blockly.fieldRegistry.register('field_colour', FieldColour)
  defineBlocks()
  defineGenerators()
  defineCSSBlocks()
  defineCSSGenerators()

  defineJSBlocks()
  defineJSGenerators()
  registerToolboxLabel()
  registerCustomCategory()
}
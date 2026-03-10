import * as Blockly from 'blockly/core'
import { FieldColour } from '@blockly/field-colour'
import { defineBlocks } from './defineBlocks'
import { defineGenerators } from './defineGenerators'
import { registerToolboxLabel } from './toolboxLabel'
import { registerCustomCategory } from './customCategory'

let initialized = false

export function initBlockly() {
  if (initialized) return 
  initialized = true

  Blockly.fieldRegistry.register('field_colour', FieldColour)
  defineBlocks()
  defineGenerators()
  registerToolboxLabel()
  registerCustomCategory()
}
import { registerReusableBlock } from './reusableBlocks.js'
import { Blockly } from './core.js'
import * as ColourModule from '@blockly/field-colour'
import { defineBlocks } from './defineBlocks.jsx'
import { defineGenerators } from './defineGenerators.jsx'
import { defineCSSBlocks } from './defineCSSBlocks.jsx'
import { defineCSSGenerators } from './defineCSSGenerators.jsx'
import { defineJSBlocks } from './defineJSBlocks.js'
import { defineJSGenerators } from './defineJSGenerators.js'
import { defineJSLearningBlocks } from './defineJSLearningBlocks.js'
import { enhanceJSBlocks } from './workspaceDiagnostics.js'
import { registerLegacyJSCompatibility } from './legacyJSCompatibility.js'
import { defineFileReferenceBlocks } from './fileReferenceBlocks.js'

let initialized = false
const FieldColour = ColourModule.FieldColour ?? ColourModule.default?.FieldColour
export function registerBlocklyBlocks() {
  if (initialized) return
  if (!Blockly.registry.hasItem(Blockly.registry.Type.FIELD, 'field_colour')) Blockly.fieldRegistry.register('field_colour', FieldColour)
  defineBlocks(); defineGenerators(); defineCSSBlocks(); defineCSSGenerators()
  defineJSBlocks(); defineJSGenerators(); defineJSLearningBlocks(); enhanceJSBlocks()
  registerLegacyJSCompatibility()
  defineFileReferenceBlocks([])
  registerReusableBlock()
  initialized = true
}

import { Blockly } from './core.js'
import * as ColourModule from '@blockly/field-colour'
import { DOMParser } from 'linkedom'
import { defineBlocks } from './defineBlocks.jsx'
import { defineGenerators } from './defineGenerators.jsx'
import { defineCSSBlocks } from './defineCSSBlocks.jsx'
import { defineCSSGenerators } from './defineCSSGenerators.jsx'
import { defineJSBlocks } from './defineJSBlocks.js'
import { defineJSGenerators } from './defineJSGenerators.js'
import { defineFileReferenceBlocks } from './fileReferenceBlocks.js'
import { codeGeneratorService } from '../services/codeGenerator.service.js'

let initialized = false
const FieldColour = ColourModule.FieldColour ?? ColourModule.default?.FieldColour
export function initializeTutorialRuntime() {
  if (initialized) return
  initialized = true
  // Headless workers have no browser document. Blockly's serialization/events
  // still need XML helpers; inject an inert document rather than a full browser.
  Blockly.utils.xml.injectDependencies({
    document: new DOMParser().parseFromString('<xml/>', 'text/xml'),
    DOMParser,
    XMLSerializer: class { serializeToString(node) { return node.toString() } },
  })
  if (!Blockly.registry.hasItem(Blockly.registry.Type.FIELD, 'field_colour')) Blockly.fieldRegistry.register('field_colour', FieldColour)
  defineBlocks(); defineGenerators(); defineCSSBlocks(); defineCSSGenerators(); defineJSBlocks(); defineJSGenerators()
}

function checkWorkspaceLimits(state) {
  let count = 0
  const visit = (value, depth) => {
    if (depth > 100) throw new Error('Workspace nesting exceeds the limit')
    if (value && typeof value === 'object') {
      if (typeof value.type === 'string' && ++count > 5000) throw new Error('Workspace exceeds the block limit')
      for (const child of Object.values(value)) visit(child, depth + 1)
    }
  }
  visit(state, 0)
}

// Ignore browser-supplied code for blocks. Never eval generated source.
export function canonicalTutorialFiles(files, mode, fileDefinitions) {
  if (!Array.isArray(files) || !files.length || files.length > 32) throw new Error('Submit between 1 and 32 files')
  if (!['block', 'text'].includes(mode)) throw new Error('Unsupported tutorial mode')
  const filenames = new Set()
  if (mode === 'block') { initializeTutorialRuntime(); defineFileReferenceBlocks(fileDefinitions) }
  return files.map(file => {
    if (!file || typeof file.filename !== 'string' || filenames.has(file.filename)) throw new Error('File names must be unique')
    if (!fileDefinitions.some(definition => definition.filename === file.filename)) throw new Error('Unknown tutorial file')
    filenames.add(file.filename)
    if (mode === 'text') {
      if (typeof file.code !== 'string') throw new Error('Text files must include source code')
      return { filename: file.filename, code: file.code, blocks_json: null }
    }
    if (!file.blocks_json || typeof file.blocks_json !== 'object' || Array.isArray(file.blocks_json)) throw new Error('Block files must include a workspace')
    checkWorkspaceLimits(file.blocks_json)
    return { filename: file.filename, blocks_json: file.blocks_json, code: codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) }
  })
}

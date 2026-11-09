import { registerBlocklyBlocks } from './registerBlocks.js'
import '@blockly/toolbox-search'
import { registerToolboxLabel } from './toolboxLabel'
import { registerCustomCategory } from './customCategory'

let initialized = false

export function initBlockly() {
  if (initialized) return 
  registerBlocklyBlocks()
  registerToolboxLabel()
  registerCustomCategory()
  initialized = true
}

import { registerBlocklyBlocks } from './registerBlocks.js'
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

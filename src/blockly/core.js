import * as BlocklyModule from 'blockly/core'

// Blockly exposes an ESM namespace in browsers and a CJS default in Node/Deno.
export const Blockly = Reflect.get(BlocklyModule, 'default') ?? BlocklyModule

// Load the standard library before plugins replace its mutators. Every runtime
// must register the same built-in types, including old saved workspaces.
import * as BlocklyModule from 'blockly'

// Blockly exposes an ESM namespace in browsers and a CJS default in Node/Deno.
export const Blockly = Reflect.get(BlocklyModule, 'default') ?? BlocklyModule

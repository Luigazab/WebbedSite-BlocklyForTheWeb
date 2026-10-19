import test from 'node:test'
import assert from 'node:assert/strict'
import { expandReusableState } from '../src/blockly/reusableBlocks.js'
const original={type:'webbed_reusable',extraState:{id:'saved-version',version:1,language:'js',workspace:{blocks:{blocks:[{type:'js_comment',fields:{TEXT:'hello'}}]}}},next:{block:{type:'js_comment',fields:{TEXT:'after'}}}}
test('composition expansion keeps following blocks and does not mutate saved versions',()=>{
 const state={blocks:{blocks:[original]}}
 const expanded=expandReusableState(state)
 assert.equal(expanded.blocks.blocks[0].type,'js_comment')
 assert.equal(expanded.blocks.blocks[0].next.block.fields.TEXT,'after')
 assert.equal(state.blocks.blocks[0].type,'webbed_reusable')
})
test('nested or malformed compositions fail before loading a workspace',()=>{
 assert.throws(()=>expandReusableState({blocks:{blocks:[{...original,extraState:{...original.extraState,workspace:{blocks:{blocks:[original]}}}}]}}),/cannot contain/)
 assert.throws(()=>expandReusableState({blocks:{blocks:[{type:'webbed_reusable',extraState:{version:1}}]}}),/Invalid/)
})

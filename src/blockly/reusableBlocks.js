import { Blockly } from './core.js'

export const REUSABLE_TYPE = 'webbed_reusable'
export function expandReusableState(input) {
 const state=structuredClone(input)
 let count=0
 const variables=[...(state?.variables??[])]
 function expand(block,inside=false){
  if(!block)return block
  if(++count>5000)throw new Error('Reusable block expansion exceeds 5000 blocks.')
  if(block.type===REUSABLE_TYPE){
   if(inside)throw new Error('Reusable blocks cannot contain reusable blocks.')
   const d=block.extraState
   if(!d||!d.id||!Number.isInteger(d.version)||!['html','css','js'].includes(d.language))throw new Error('Invalid reusable block version.')
   const roots=d.workspace?.blocks?.blocks
   if(!Array.isArray(roots)||roots.length!==1)throw new Error('A reusable block must contain exactly one connected stack.')
   for(const v of d.workspace.variables??[])if(!variables.some(x=>x.id===v.id))variables.push(v)
   const root=expand(structuredClone(roots[0]),true)
   let tail=root
   while(tail.next?.block)tail=tail.next.block
   if(block.next?.block)tail.next={block:expand(block.next.block,inside)}
   root.x=block.x;root.y=block.y
   return root
  }
  // Imported IDs must be unique when the same composition is used repeatedly.
  if(inside)delete block.id
  for(const input of Object.values(block.inputs??{})){
   if(input.block)input.block=expand(input.block,inside)
   if(input.shadow)input.shadow=expand(input.shadow,inside)
  }
  if(block.next?.block)block.next.block=expand(block.next.block,inside)
  return block
 }
 if(state?.blocks?.blocks)state.blocks.blocks=state.blocks.blocks.map(b=>expand(b))
 if(variables.length)state.variables=variables
 return state
}
export function registerReusableBlock(){
 if(Blockly.Blocks[REUSABLE_TYPE])return
 Blockly.Blocks[REUSABLE_TYPE]={
  init(){this.appendDummyInput().appendField('Reusable block','LABEL');this.setColour('#6450A8');this.setPreviousStatement(true);this.setNextStatement(true);this.setTooltip('A saved composition of supported blocks. Its version and contents travel with the project.')},
  saveExtraState(){return this.definition??null},
  loadExtraState(definition){
   expandReusableState({blocks:{blocks:[{type:REUSABLE_TYPE,extraState:definition}]}})
   this.definition=structuredClone(definition)
   this.setFieldValue(String(definition.label??'Reusable block').slice(0,80),'LABEL')
   this.setPreviousStatement(Boolean(definition.previousEnabled),definition.previousCheck??null)
   this.setNextStatement(Boolean(definition.nextEnabled),definition.nextCheck??null)
  },
 }
}
export function captureComposition(workspace,filename){
 const selected=Blockly.getSelected()
 const root=selected?.workspace===workspace?selected:workspace.getTopBlocks(true)[0]
 if(!root||root.outputConnection)throw new Error('Select a connected statement stack or page structure.')
 const saved=Blockly.serialization.blocks.save(root,{addCoordinates:false,doFullSerialization:true})
 let tail=root;while(tail.getNextBlock())tail=tail.getNextBlock()
 const state={blocks:{languageVersion:0,blocks:[saved]},variables:Blockly.serialization.workspaces.save(workspace).variables??[]}
 const visit=x=>{if(!x||typeof x!=='object')return;if(x.type===REUSABLE_TYPE)throw new Error('Nested reusable blocks are not supported. Capture original blocks.');Object.values(x).forEach(v=>Array.isArray(v)?v.forEach(visit):visit(v))};visit(state)
 return {workspace:state,language:filename.split('.').pop().toLowerCase(),previousEnabled:!!root.previousConnection,nextEnabled:!!tail.nextConnection,previousCheck:root.previousConnection?.getCheck()??null,nextCheck:tail.nextConnection?.getCheck()??null}
}

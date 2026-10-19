import { javascriptGenerator, Order } from 'blockly/javascript'

export function registerLegacyJSCompatibility() {
  const originalGet = javascriptGenerator.forBlock.variables_get
  const originalSet = javascriptGenerator.forBlock.variables_set
  const declaredName = block => {
    const name = block.getField('VAR').getVariable()?.name
    return javascriptGenerator.webbedDeclarations?.has(name) ? name : null
  }
  javascriptGenerator.forBlock.variables_get = (block, generator) => declaredName(block)
    ? [declaredName(block), Order.ATOMIC] : originalGet(block, generator)
  javascriptGenerator.forBlock.variables_set = (block, generator) => declaredName(block)
    ? `${declaredName(block)} = ${generator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || 'undefined'};\n`
    : originalSet(block, generator)
}

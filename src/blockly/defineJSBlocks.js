import * as Blockly from 'blockly/core'

export const defineJSBlocks = () => {

  // ════════════════════════════════════════════════════════════════════════
  // HTML INTEGRATION ─ <script> wrappers (for .html file workspaces)
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_script_body'] = {
    init() {
      this.appendDummyInput().appendField('<script>')
      this.appendStatementInput('CONTENT').setCheck(null)
      this.appendDummyInput().appendField('</script>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#F7DF1E')
      this.setTooltip('Embed JavaScript in the HTML body')
    },
  }

  Blockly.Blocks['js_script_head'] = {
    init() {
      this.appendDummyInput().appendField('<script>')
      this.appendStatementInput('CONTENT').setCheck(null)
      this.appendDummyInput().appendField('</script>')
      this.setPreviousStatement(true, 'head_element')
      this.setNextStatement(true, 'head_element')
      this.setColour('#F7DF1E')
      this.setTooltip('Embed JavaScript in the HTML head')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // VARIABLES & CONSTANTS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_let'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('let')
        .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Declare a block-scoped variable with let')
    },
  }

  Blockly.Blocks['js_const'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('const')
        .appendField(new Blockly.FieldTextInput('MY_CONST'), 'NAME')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Declare a constant (cannot be reassigned)')
    },
  }

  Blockly.Blocks['js_var_decl'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('var')
        .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Declare a variable with var (function-scoped, legacy)')
    },
  }

  Blockly.Blocks['js_get_var'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
      this.setOutput(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Get the value of a variable by name')
    },
  }

  Blockly.Blocks['js_set_var'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Assign a new value to an existing variable')
    },
  }

  Blockly.Blocks['js_compound_assign'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
        .appendField(new Blockly.FieldDropdown([
          ['+=', '+='], ['-=', '-='], ['*=', '*='], ['/=', '/='], ['%=', '%='],
        ]), 'OP')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Compound assignment: x += 1 means x = x + 1')
    },
  }

  Blockly.Blocks['js_increment'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('i'), 'NAME')
        .appendField(new Blockly.FieldDropdown([
          ['++ (add 1)', '++'],
          ['-- (subtract 1)', '--'],
        ]), 'OP')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Increase or decrease a variable by 1')
    },
  }

  Blockly.Blocks['js_global_var'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('window.')
        .appendField(new Blockly.FieldTextInput('myGlobal'), 'NAME')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E6A817')
      this.setTooltip('Attach a variable to window (global scope)')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // DATA TYPES & LITERALS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_string_val'] = {
    init() {
      this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput('hello'), 'VALUE')
        .appendField('"')
      this.setOutput(true, 'String')
      this.setColour('#E8760A')
      this.setTooltip('A text string value')
    },
  }

  Blockly.Blocks['js_number_val'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 0), 'VALUE')
      this.setOutput(true, 'Number')
      this.setColour('#E8760A')
      this.setTooltip('A number value')
    },
  }

  Blockly.Blocks['js_boolean_val'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['true', 'true'], ['false', 'false']]), 'VALUE')
      this.setOutput(true, 'Boolean')
      this.setColour('#E8760A')
      this.setTooltip('A boolean value: true or false')
    },
  }

  Blockly.Blocks['js_null'] = {
    init() {
      this.appendDummyInput().appendField('null')
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('The null value — intentional absence of a value')
    },
  }

  Blockly.Blocks['js_undefined'] = {
    init() {
      this.appendDummyInput().appendField('undefined')
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('The undefined value')
    },
  }

  Blockly.Blocks['js_template_literal'] = {
    init() {
      this.appendDummyInput()
        .appendField('`')
        .appendField(new Blockly.FieldTextInput('Hello, '), 'BEFORE')
      this.appendValueInput('EXPR').setCheck(null).appendField('${')
      this.appendDummyInput()
        .appendField('}')
        .appendField(new Blockly.FieldTextInput('!'), 'AFTER')
        .appendField('`')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E8760A')
      this.setTooltip('Template literal: embed an expression inside a string using ${...}')
    },
  }

  Blockly.Blocks['js_array_create'] = {
    init() {
      this.appendValueInput('ITEM0').setCheck(null).appendField('[')
      this.appendValueInput('ITEM1').setCheck(null).appendField(',')
      this.appendValueInput('ITEM2').setCheck(null).appendField(',')
      this.appendValueInput('ITEM3').setCheck(null).appendField(',')
      this.appendValueInput('ITEM4').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(']')
      this.setInputsInline(true)
      this.setOutput(true, 'Array')
      this.setColour('#E8760A')
      this.setTooltip('Create an array. Connect items to slots; empty slots are skipped.')
    },
  }

  Blockly.Blocks['js_empty_array'] = {
    init() {
      this.appendDummyInput().appendField('[ ]  (empty array)')
      this.setOutput(true, 'Array')
      this.setColour('#E8760A')
      this.setTooltip('Create an empty array')
    },
  }

  Blockly.Blocks['js_object_literal'] = {
    init() {
      this.appendDummyInput()
        .appendField('{ ')
        .appendField(new Blockly.FieldTextInput('key1'), 'KEY0')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('value1'), 'VAL0')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('key2'), 'KEY1')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('value2'), 'VAL1')
        .appendField(' }')
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Create an object literal with 2 key-value pairs')
    },
  }

  Blockly.Blocks['js_property_get'] = {
    init() {
      this.appendValueInput('OBJ').setCheck(null)
      this.appendDummyInput()
        .appendField('.')
        .appendField(new Blockly.FieldTextInput('property'), 'PROP')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Get a property of an object: obj.property')
    },
  }

  Blockly.Blocks['js_property_set'] = {
    init() {
      this.appendValueInput('OBJ').setCheck(null)
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('.')
        .appendField(new Blockly.FieldTextInput('property'), 'PROP')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Set a property on an object: obj.property = value')
    },
  }

  Blockly.Blocks['js_bracket_get'] = {
    init() {
      this.appendValueInput('OBJ').setCheck(null)
      this.appendValueInput('KEY').setCheck(null).appendField('[')
      this.appendDummyInput().appendField(']')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Get a property using bracket notation: obj[key]')
    },
  }

  Blockly.Blocks['js_bracket_set'] = {
    init() {
      this.appendValueInput('OBJ').setCheck(null)
      this.appendValueInput('KEY').setCheck(null).appendField('[')
      this.appendValueInput('VALUE').setCheck(null).appendField('] =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Set a property using bracket notation: obj[key] = value')
    },
  }

  Blockly.Blocks['js_new_instance'] = {
    init() {
      this.appendDummyInput()
        .appendField('new')
        .appendField(new Blockly.FieldTextInput('ClassName'), 'CLASS')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')')
      this.setOutput(true, null)
      this.setColour('#E8760A')
      this.setTooltip('Create a new instance of a class: new ClassName(args)')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // OPERATORS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_arithmetic'] = {
    init() {
      this.appendValueInput('A').setCheck(null)
      this.appendValueInput('B')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['+', '+'], ['-', '-'], ['×', '*'],
          ['÷', '/'], ['%  (remainder)', '%'], ['** (power)', '**'],
        ]), 'OP')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#4285F4')
      this.setTooltip('Perform arithmetic: add, subtract, multiply, divide, remainder, power')
    },
  }

  Blockly.Blocks['js_compare'] = {
    init() {
      this.appendValueInput('A').setCheck(null)
      this.appendValueInput('B')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['=== (strictly equal)', '==='],
          ['!== (strictly not equal)', '!=='],
          ['== (equal)', '=='],
          ['!= (not equal)', '!='],
          ['< (less than)', '<'],
          ['> (greater than)', '>'],
          ['<= (less or equal)', '<='],
          ['>= (greater or equal)', '>='],
        ]), 'OP')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#4285F4')
      this.setTooltip('Compare two values. === checks both value and type.')
    },
  }

  Blockly.Blocks['js_logic_op'] = {
    init() {
      this.appendValueInput('A').setCheck(null)
      this.appendValueInput('B')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['AND (&&)', '&&'],
          ['OR (||)', '||'],
        ]), 'OP')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#4285F4')
      this.setTooltip('Logical AND (both must be true) or OR (at least one must be true)')
    },
  }

  Blockly.Blocks['js_not'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('!  (NOT)')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#4285F4')
      this.setTooltip('Logical NOT: flips true to false and false to true')
    },
  }

  Blockly.Blocks['js_ternary'] = {
    init() {
      this.appendValueInput('COND').setCheck(null).appendField('if')
      this.appendValueInput('THEN').setCheck(null).appendField('? then')
      this.appendValueInput('ELSE').setCheck(null).appendField(': else')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#4285F4')
      this.setTooltip('Ternary operator: condition ? valueIfTrue : valueIfFalse')
    },
  }

  Blockly.Blocks['js_typeof'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('typeof')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#4285F4')
      this.setTooltip('Get the type of a value as a string: "string", "number", "boolean", "object", "undefined"')
    },
  }

  Blockly.Blocks['js_instanceof'] = {
    init() {
      this.appendValueInput('OBJ').setCheck(null)
      this.appendDummyInput()
        .appendField('instanceof')
        .appendField(new Blockly.FieldTextInput('Array'), 'CLASS')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#4285F4')
      this.setTooltip('Check if a value is an instance of a class')
    },
  }

  Blockly.Blocks['js_spread'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('...  (spread)')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#4285F4')
      this.setTooltip('Spread operator: expand an array or object into individual items')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // CONTROL FLOW
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_if'] = {
    init() {
      this.appendValueInput('COND').setCheck(null).appendField('if (')
      this.appendDummyInput().appendField(') {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Execute code only if condition is true')
    },
  }

  Blockly.Blocks['js_if_else'] = {
    init() {
      this.appendValueInput('COND').setCheck(null).appendField('if (')
      this.appendDummyInput().appendField(') {')
      this.appendStatementInput('IF_BODY').setCheck(null)
      this.appendDummyInput().appendField('} else {')
      this.appendStatementInput('ELSE_BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Execute one block if condition is true, another if false')
    },
  }

  Blockly.Blocks['js_if_else_if'] = {
    init() {
      this.appendValueInput('COND').setCheck(null).appendField('if (')
      this.appendDummyInput().appendField(') {')
      this.appendStatementInput('IF_BODY').setCheck(null)
      this.appendValueInput('ELSE_COND').setCheck(null).appendField('} else if (')
      this.appendDummyInput().appendField(') {')
      this.appendStatementInput('ELSE_IF_BODY').setCheck(null)
      this.appendDummyInput().appendField('} else {')
      this.appendStatementInput('ELSE_BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('if / else if / else block')
    },
  }

  Blockly.Blocks['js_while'] = {
    init() {
      this.appendValueInput('COND').setCheck(null).appendField('while (')
      this.appendDummyInput().appendField(') {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Repeat a block of code while the condition is true')
    },
  }

  Blockly.Blocks['js_do_while'] = {
    init() {
      this.appendDummyInput().appendField('do {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendValueInput('COND').setCheck(null).appendField('} while (')
      this.appendDummyInput().appendField(')')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Execute at least once, then repeat while condition is true')
    },
  }

  Blockly.Blocks['js_for_count'] = {
    init() {
      this.appendValueInput('TO')
        .setCheck(null)
        .appendField('repeat')
        .appendField(new Blockly.FieldTextInput('i'), 'VAR')
        .appendField('from 0 to')
      this.appendStatementInput('BODY').setCheck(null).appendField('do')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('For loop: counts from 0 up to (but not including) the number')
    },
  }

  Blockly.Blocks['js_for_range'] = {
    init() {
      this.appendValueInput('FROM')
        .setCheck(null)
        .appendField('for')
        .appendField(new Blockly.FieldTextInput('i'), 'VAR')
        .appendField('from')
      this.appendValueInput('TO').setCheck(null).appendField('to')
      this.appendStatementInput('BODY').setCheck(null).appendField('do')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('For loop with custom start and end values')
    },
  }

  Blockly.Blocks['js_for_of'] = {
    init() {
      this.appendValueInput('ITERABLE')
        .setCheck(null)
        .appendField('for each')
        .appendField(new Blockly.FieldTextInput('item'), 'VAR')
        .appendField('in')
      this.appendStatementInput('BODY').setCheck(null).appendField('do')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('For...of: iterate over each item in an array or iterable')
    },
  }

  Blockly.Blocks['js_for_in'] = {
    init() {
      this.appendValueInput('OBJ')
        .setCheck(null)
        .appendField('for each key')
        .appendField(new Blockly.FieldTextInput('key'), 'VAR')
        .appendField('in object')
      this.appendStatementInput('BODY').setCheck(null).appendField('do')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('For...in: iterate over the keys (properties) of an object')
    },
  }

  Blockly.Blocks['js_break'] = {
    init() {
      this.appendDummyInput().appendField('break  (exit loop)')
      this.setPreviousStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Exit the current loop immediately')
    },
  }

  Blockly.Blocks['js_continue'] = {
    init() {
      this.appendDummyInput().appendField('continue  (skip to next)')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Skip the rest of this iteration and continue with the next')
    },
  }

  Blockly.Blocks['js_switch'] = {
    init() {
      this.appendValueInput('EXPR').setCheck(null).appendField('switch (')
      this.appendDummyInput().appendField(') {')
      this.appendDummyInput()
        .appendField('case')
        .appendField(new Blockly.FieldTextInput('value1'), 'CASE0')
        .appendField(':')
      this.appendStatementInput('BODY0').setCheck(null)
      this.appendDummyInput().appendField('break;')
      this.appendDummyInput()
        .appendField('case')
        .appendField(new Blockly.FieldTextInput('value2'), 'CASE1')
        .appendField(':')
      this.appendStatementInput('BODY1').setCheck(null)
      this.appendDummyInput().appendField('break;')
      this.appendDummyInput().appendField('default:')
      this.appendStatementInput('DEFAULT').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Switch statement: run different code based on a value')
    },
  }

  Blockly.Blocks['js_try_catch'] = {
    init() {
      this.appendDummyInput().appendField('try {')
      this.appendStatementInput('TRY').setCheck(null)
      this.appendDummyInput()
        .appendField('} catch (')
        .appendField(new Blockly.FieldTextInput('error'), 'ERR')
        .appendField(') {')
      this.appendStatementInput('CATCH').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Try to run code; if it throws an error, handle it in catch')
    },
  }

  Blockly.Blocks['js_try_catch_finally'] = {
    init() {
      this.appendDummyInput().appendField('try {')
      this.appendStatementInput('TRY').setCheck(null)
      this.appendDummyInput()
        .appendField('} catch (')
        .appendField(new Blockly.FieldTextInput('error'), 'ERR')
        .appendField(') {')
      this.appendStatementInput('CATCH').setCheck(null)
      this.appendDummyInput().appendField('} finally {')
      this.appendStatementInput('FINALLY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('try/catch/finally: finally always runs regardless of errors')
    },
  }

  Blockly.Blocks['js_throw'] = {
    init() {
      this.appendDummyInput()
        .appendField('throw new Error(')
        .appendField(new Blockly.FieldTextInput('Something went wrong'), 'MSG')
        .appendField(')')
      this.setPreviousStatement(true, null)
      this.setColour('#C0392B')
      this.setTooltip('Throw an error to be caught by a try/catch block')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // FUNCTIONS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_function_def'] = {
    init() {
      this.appendDummyInput()
        .appendField('function')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(') {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Define a function. Type comma-separated parameter names in the ( ) field.')
    },
  }

  Blockly.Blocks['js_function_call_stmt'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Call a function. Type comma-separated arguments in the ( ) field.')
    },
  }

  Blockly.Blocks['js_function_call_expr'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')')
      this.setOutput(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Call a function and use its return value')
    },
  }

  Blockly.Blocks['js_arrow_function'] = {
    init() {
      this.appendDummyInput()
        .appendField('const')
        .appendField(new Blockly.FieldTextInput('myArrow'), 'NAME')
        .appendField('= (')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(') => {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Define an arrow function. Type comma-separated parameters in the ( ) field.')
    },
  }

  Blockly.Blocks['js_async_function'] = {
    init() {
      this.appendDummyInput()
        .appendField('async function')
        .appendField(new Blockly.FieldTextInput('fetchData'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(') {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Define an async function (can use await inside)')
    },
  }

  Blockly.Blocks['js_return'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('return')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Return a value from a function')
    },
  }

  Blockly.Blocks['js_return_void'] = {
    init() {
      this.appendDummyInput().appendField('return  (exit function)')
      this.setPreviousStatement(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Exit a function without returning a value')
    },
  }

  Blockly.Blocks['js_await'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('await')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#8E44AD')
      this.setTooltip('Await a promise (only inside async functions)')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // CONSOLE & DIALOG
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_console_log'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('console.log(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#27AE60')
      this.setTooltip('Print a value to the browser developer console')
    },
  }

  Blockly.Blocks['js_console_error'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('console.error(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#27AE60')
      this.setTooltip('Print an error message to the browser console')
    },
  }

  Blockly.Blocks['js_console_warn'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('console.warn(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#27AE60')
      this.setTooltip('Print a warning message to the browser console')
    },
  }

  Blockly.Blocks['js_alert'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('alert(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#27AE60')
      this.setTooltip('Show a browser alert dialog with a message')
    },
  }

  Blockly.Blocks['js_confirm'] = {
    init() {
      this.appendValueInput('MSG').setCheck(null).appendField('confirm(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#27AE60')
      this.setTooltip('Show a confirm dialog. Returns true if OK clicked, false if Cancel.')
    },
  }

  Blockly.Blocks['js_prompt'] = {
    init() {
      this.appendDummyInput()
        .appendField('prompt(')
        .appendField(new Blockly.FieldTextInput('Enter a value:'), 'MSG')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput(''), 'DEFAULT')
        .appendField(')')
      this.setOutput(true, 'String')
      this.setColour('#27AE60')
      this.setTooltip('Show a prompt dialog. Returns the string the user typed.')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // MATH METHODS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_math_random'] = {
    init() {
      this.appendDummyInput().appendField('Math.random()  (0 to 1)')
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Generate a random decimal number between 0 (inclusive) and 1 (exclusive)')
    },
  }

  Blockly.Blocks['js_math_method'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('Math.')
        .appendField(new Blockly.FieldDropdown([
          ['floor  (round down)', 'floor'],
          ['ceil  (round up)', 'ceil'],
          ['round  (round nearest)', 'round'],
          ['abs  (absolute value)', 'abs'],
          ['sqrt  (square root)', 'sqrt'],
          ['sin', 'sin'],
          ['cos', 'cos'],
          ['tan', 'tan'],
          ['log  (natural log)', 'log'],
          ['log2', 'log2'],
          ['log10', 'log10'],
        ]), 'METHOD')
        .appendField('(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Apply a Math method to a number')
    },
  }

  Blockly.Blocks['js_math_pow'] = {
    init() {
      this.appendValueInput('BASE').setCheck(null).appendField('Math.pow(')
      this.appendValueInput('EXP').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Raise a number to a power: Math.pow(base, exponent)')
    },
  }

  Blockly.Blocks['js_math_min_max'] = {
    init() {
      this.appendValueInput('A')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([['Math.min', 'min'], ['Math.max', 'max']]), 'METHOD')
        .appendField('(')
      this.appendValueInput('B').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Get the minimum or maximum of two numbers')
    },
  }

  Blockly.Blocks['js_math_random_int'] = {
    init() {
      this.appendValueInput('MIN').setCheck(null).appendField('random integer from')
      this.appendValueInput('MAX').setCheck(null).appendField('to')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Generate a random whole number between min and max (inclusive)')
    },
  }

  Blockly.Blocks['js_parse_number'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['parseInt  (to whole number)', 'parseInt'],
          ['parseFloat  (to decimal)', 'parseFloat'],
          ['Number  (convert to number)', 'Number'],
        ]), 'METHOD')
        .appendField('(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Convert a string to a number')
    },
  }

  Blockly.Blocks['js_to_string'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('String(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#2980B9')
      this.setTooltip('Convert a value to a string')
    },
  }

  Blockly.Blocks['js_date_now'] = {
    init() {
      this.appendDummyInput().appendField('Date.now()  (timestamp ms)')
      this.setOutput(true, 'Number')
      this.setColour('#2980B9')
      this.setTooltip('Get the current time as a number (milliseconds since 1970)')
    },
  }

  Blockly.Blocks['js_new_date'] = {
    init() {
      this.appendDummyInput().appendField('new Date()  (current date/time)')
      this.setOutput(true, null)
      this.setColour('#2980B9')
      this.setTooltip('Create a new Date object for the current date and time')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // STRING METHODS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_string_length'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendDummyInput().appendField('.length')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#E67E22')
      this.setTooltip('Get the number of characters in a string')
    },
  }

  Blockly.Blocks['js_string_case'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendDummyInput()
        .appendField('.')
        .appendField(new Blockly.FieldDropdown([
          ['toUpperCase()', 'toUpperCase'],
          ['toLowerCase()', 'toLowerCase'],
          ['trim()  (remove spaces)', 'trim'],
        ]), 'METHOD')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Transform a string: UPPERCASE, lowercase, or remove surrounding spaces')
    },
  }

  Blockly.Blocks['js_string_includes'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('SEARCH').setCheck(null).appendField('.includes(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#E67E22')
      this.setTooltip('Check if a string contains another string. Returns true or false.')
    },
  }

  Blockly.Blocks['js_string_starts_ends'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('SEARCH')
        .setCheck(null)
        .appendField('.')
        .appendField(new Blockly.FieldDropdown([
          ['startsWith(', 'startsWith'],
          ['endsWith(', 'endsWith'],
        ]), 'METHOD')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#E67E22')
      this.setTooltip('Check if a string starts or ends with another string')
    },
  }

  Blockly.Blocks['js_string_index_of'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('SEARCH').setCheck(null).appendField('.indexOf(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#E67E22')
      this.setTooltip('Find the position of a substring. Returns -1 if not found.')
    },
  }

  Blockly.Blocks['js_string_slice'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('START').setCheck(null).appendField('.slice(')
      this.appendValueInput('END').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Extract a portion of a string from start index to end index')
    },
  }

  Blockly.Blocks['js_string_replace'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('SEARCH').setCheck(null).appendField('.replace(')
      this.appendValueInput('REPLACE').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Replace the first occurrence of a substring with another')
    },
  }

  Blockly.Blocks['js_string_split'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('SEP').setCheck(null).appendField('.split(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Array')
      this.setColour('#E67E22')
      this.setTooltip('Split a string into an array using a separator character')
    },
  }

  Blockly.Blocks['js_string_concat'] = {
    init() {
      this.appendValueInput('A').setCheck(null).appendField('join')
      this.appendValueInput('B').setCheck(null).appendField('+')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Join two strings together with the + operator')
    },
  }

  Blockly.Blocks['js_string_repeat'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('TIMES').setCheck(null).appendField('.repeat(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Repeat a string a number of times')
    },
  }

  Blockly.Blocks['js_string_char_at'] = {
    init() {
      this.appendValueInput('STR').setCheck(null)
      this.appendValueInput('INDEX').setCheck(null).appendField('[')
      this.appendDummyInput().appendField(']  (charAt)')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#E67E22')
      this.setTooltip('Get the character at a specific index position')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // ARRAY METHODS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_array_length'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendDummyInput().appendField('.length')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#9B59B6')
      this.setTooltip('Get the number of elements in an array')
    },
  }

  Blockly.Blocks['js_array_get'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('INDEX').setCheck(null).appendField('[')
      this.appendDummyInput().appendField(']')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Get an element from an array by its index (starts at 0)')
    },
  }

  Blockly.Blocks['js_array_set'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('INDEX').setCheck(null).appendField('[')
      this.appendValueInput('VALUE').setCheck(null).appendField('] =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Set an element in an array at a specific index')
    },
  }

  Blockly.Blocks['js_array_push'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('ITEM').setCheck(null).appendField('.push(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Add an element to the END of an array')
    },
  }

  Blockly.Blocks['js_array_pop'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendDummyInput().appendField('.pop()  (remove last)')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Remove and return the last element of an array')
    },
  }

  Blockly.Blocks['js_array_shift'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendDummyInput().appendField('.shift()  (remove first)')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Remove and return the first element of an array')
    },
  }

  Blockly.Blocks['js_array_unshift'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('ITEM').setCheck(null).appendField('.unshift(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Add an element to the BEGINNING of an array')
    },
  }

  Blockly.Blocks['js_array_includes'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('ITEM').setCheck(null).appendField('.includes(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#9B59B6')
      this.setTooltip('Check if an array contains a specific element')
    },
  }

  Blockly.Blocks['js_array_index_of'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('ITEM').setCheck(null).appendField('.indexOf(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('#9B59B6')
      this.setTooltip('Find the index of an element in an array. Returns -1 if not found.')
    },
  }

  Blockly.Blocks['js_array_join'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('SEP').setCheck(null).appendField('.join(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#9B59B6')
      this.setTooltip('Join all array elements into a string using a separator')
    },
  }

  Blockly.Blocks['js_array_mutate'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendDummyInput()
        .appendField('.')
        .appendField(new Blockly.FieldDropdown([
          ['reverse()', 'reverse'],
          ['sort()', 'sort'],
        ]), 'METHOD')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Mutate (modify) the array in place: reverse or sort')
    },
  }

  Blockly.Blocks['js_array_slice'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('START').setCheck(null).appendField('.slice(')
      this.appendValueInput('END').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Array')
      this.setColour('#9B59B6')
      this.setTooltip('Return a new array with elements from start to end index (non-mutating)')
    },
  }

  Blockly.Blocks['js_array_splice'] = {
    init() {
      this.appendValueInput('ARR').setCheck(null)
      this.appendValueInput('START').setCheck(null).appendField('.splice(')
      this.appendValueInput('COUNT').setCheck(null).appendField(',')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9B59B6')
      this.setTooltip('Remove elements from an array: start = index, count = how many to remove')
    },
  }

  Blockly.Blocks['js_array_concat'] = {
    init() {
      this.appendValueInput('ARR1').setCheck(null)
      this.appendValueInput('ARR2').setCheck(null).appendField('.concat(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Array')
      this.setColour('#9B59B6')
      this.setTooltip('Combine two arrays into a new array (non-mutating)')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // DOM MANIPULATION
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_get_by_id'] = {
    init() {
      this.appendDummyInput()
        .appendField('get element by id:')
        .appendField(new Blockly.FieldTextInput('myElement'), 'ID')
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Get an HTML element by its id attribute')
    },
  }

  Blockly.Blocks['js_query_selector'] = {
    init() {
      this.appendDummyInput()
        .appendField('querySelector(')
        .appendField(new Blockly.FieldTextInput('#myId'), 'SEL')
        .appendField(')')
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Get the first element matching a CSS selector (e.g. "#id", ".class", "p")')
    },
  }

  Blockly.Blocks['js_query_selector_all'] = {
    init() {
      this.appendDummyInput()
        .appendField('querySelectorAll(')
        .appendField(new Blockly.FieldTextInput('.myClass'), 'SEL')
        .appendField(')')
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Get all elements matching a CSS selector as a NodeList')
    },
  }

  Blockly.Blocks['js_create_element'] = {
    init() {
      this.appendDummyInput()
        .appendField('create element <')
        .appendField(new Blockly.FieldTextInput('div'), 'TAG')
        .appendField('>')
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Create a new HTML element with the given tag name')
    },
  }

  Blockly.Blocks['js_append_child'] = {
    init() {
      this.appendValueInput('PARENT').setCheck(null).appendField('to')
      this.appendValueInput('CHILD').setCheck(null).appendField('add child')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Add a child element inside a parent element')
    },
  }

  Blockly.Blocks['js_remove_element'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null).appendField('remove')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Remove an element from the page')
    },
  }

  Blockly.Blocks['js_set_attribute'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.setAttribute(')
        .appendField(new Blockly.FieldTextInput('class'), 'ATTR')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('myClass'), 'VALUE')
        .appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set an attribute on an HTML element')
    },
  }

  Blockly.Blocks['js_get_attribute'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.getAttribute(')
        .appendField(new Blockly.FieldTextInput('href'), 'ATTR')
        .appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#2471A3')
      this.setTooltip('Get the value of an attribute on an element')
    },
  }

  Blockly.Blocks['js_set_inner_html'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendValueInput('HTML').setCheck(null).appendField('.innerHTML =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set the inner HTML content of an element (can include HTML tags)')
    },
  }

  Blockly.Blocks['js_get_inner_html'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput().appendField('.innerHTML  (get)')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#2471A3')
      this.setTooltip('Get the inner HTML content of an element')
    },
  }

  Blockly.Blocks['js_set_text_content'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendValueInput('TEXT').setCheck(null).appendField('.textContent =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set the text content of an element (plain text only, no HTML)')
    },
  }

  Blockly.Blocks['js_get_text_content'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput().appendField('.textContent  (get)')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#2471A3')
      this.setTooltip('Get the text content of an element')
    },
  }

  Blockly.Blocks['js_set_value'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendValueInput('VALUE').setCheck(null).appendField('.value =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set the value of an input, textarea, or select element')
    },
  }

  Blockly.Blocks['js_get_value'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput().appendField('.value  (get)')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Get the value of an input, textarea, or select element')
    },
  }

  Blockly.Blocks['js_class_list'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.classList.')
        .appendField(new Blockly.FieldDropdown([
          ['add', 'add'],
          ['remove', 'remove'],
          ['toggle', 'toggle'],
        ]), 'METHOD')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput('myClass'), 'CLASS')
        .appendField(')')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Add, remove, or toggle a CSS class on an element')
    },
  }

  Blockly.Blocks['js_class_list_contains'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.classList.contains(')
        .appendField(new Blockly.FieldTextInput('myClass'), 'CLASS')
        .appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('#2471A3')
      this.setTooltip('Check if an element has a specific CSS class')
    },
  }

  Blockly.Blocks['js_set_style'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.style.')
        .appendField(new Blockly.FieldTextInput('color'), 'PROP')
        .appendField('=')
        .appendField(new Blockly.FieldTextInput('red'), 'VALUE')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set a CSS style property on an element. Use camelCase: backgroundColor, fontSize, etc.')
    },
  }

  Blockly.Blocks['js_get_style'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.style.')
        .appendField(new Blockly.FieldTextInput('color'), 'PROP')
        .appendField('(get)')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#2471A3')
      this.setTooltip('Get a CSS style property value from an element')
    },
  }

  Blockly.Blocks['js_document_title'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('document.title =')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Set the browser tab title')
    },
  }

  Blockly.Blocks['js_document_body'] = {
    init() {
      this.appendDummyInput().appendField('document.body')
      this.setOutput(true, null)
      this.setColour('#2471A3')
      this.setTooltip('Reference to the <body> element')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // EVENTS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_add_event_listener'] = {
    init() {
      this.appendValueInput('ELEM').setCheck(null)
      this.appendDummyInput()
        .appendField('.on')
        .appendField(new Blockly.FieldDropdown([
          ['click', 'click'], ['dblclick', 'dblclick'],
          ['mouseover', 'mouseover'], ['mouseout', 'mouseout'],
          ['mousedown', 'mousedown'], ['mouseup', 'mouseup'],
          ['mousemove', 'mousemove'],
          ['keydown', 'keydown'], ['keyup', 'keyup'],
          ['change', 'change'], ['input', 'input'],
          ['submit', 'submit'], ['reset', 'reset'],
          ['focus', 'focus'], ['blur', 'blur'],
          ['load', 'load'], ['resize', 'resize'], ['scroll', 'scroll'],
        ]), 'EVENT')
        .appendField('do {')
      this.appendStatementInput('HANDLER').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('Run code when an event occurs. Use "event" variable inside the handler.')
    },
  }

  Blockly.Blocks['js_window_event'] = {
    init() {
      this.appendDummyInput()
        .appendField('when window')
        .appendField(new Blockly.FieldDropdown([
          ['loads', 'load'],
          ['resizes', 'resize'],
          ['scrolls', 'scroll'],
          ['unloads', 'beforeunload'],
        ]), 'EVENT')
        .appendField('{')
      this.appendStatementInput('HANDLER').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('Run code when a window event occurs')
    },
  }

  Blockly.Blocks['js_dom_content_loaded'] = {
    init() {
      this.appendDummyInput().appendField('when page is ready (DOMContentLoaded) {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('Run code once the HTML page has fully loaded (before images/CSS)')
    },
  }

  Blockly.Blocks['js_event_target'] = {
    init() {
      this.appendDummyInput().appendField('event.target  (element that was clicked)')
      this.setOutput(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('The element that triggered the event')
    },
  }

  Blockly.Blocks['js_event_value'] = {
    init() {
      this.appendDummyInput().appendField('event.target.value  (input value)')
      this.setOutput(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('The current value of the input that triggered the event')
    },
  }

  Blockly.Blocks['js_event_key'] = {
    init() {
      this.appendDummyInput().appendField('event.key  (key that was pressed)')
      this.setOutput(true, 'String')
      this.setColour('#E74C3C')
      this.setTooltip('The key that was pressed (e.g. "Enter", "Escape", "a")')
    },
  }

  Blockly.Blocks['js_prevent_default'] = {
    init() {
      this.appendDummyInput().appendField('event.preventDefault()  (stop default action)')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('Prevent the default browser action (e.g. stop form submission)')
    },
  }

  Blockly.Blocks['js_stop_propagation'] = {
    init() {
      this.appendDummyInput().appendField('event.stopPropagation()  (stop bubbling)')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#E74C3C')
      this.setTooltip('Stop the event from bubbling up to parent elements')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // TIMERS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_set_timeout'] = {
    init() {
      this.appendDummyInput().appendField('after')
      this.appendValueInput('DELAY').setCheck(null)
      this.appendDummyInput().appendField('ms, run once: {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('Run code once after a delay (in milliseconds)')
    },
  }

  Blockly.Blocks['js_set_interval'] = {
    init() {
      this.appendDummyInput().appendField('every')
      this.appendValueInput('INTERVAL').setCheck(null)
      this.appendDummyInput().appendField('ms, repeat: {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('Run code repeatedly at a set interval (in milliseconds)')
    },
  }

  Blockly.Blocks['js_set_timeout_var'] = {
    init() {
      this.appendDummyInput()
        .appendField('const')
        .appendField(new Blockly.FieldTextInput('timerId'), 'VAR')
        .appendField('= setTimeout( after')
      this.appendValueInput('DELAY').setCheck(null)
      this.appendDummyInput().appendField('ms ) {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('setTimeout saved to a variable (so you can cancel it)')
    },
  }

  Blockly.Blocks['js_set_interval_var'] = {
    init() {
      this.appendDummyInput()
        .appendField('const')
        .appendField(new Blockly.FieldTextInput('intervalId'), 'VAR')
        .appendField('= setInterval( every')
      this.appendValueInput('INTERVAL').setCheck(null)
      this.appendDummyInput().appendField('ms ) {')
      this.appendStatementInput('BODY').setCheck(null)
      this.appendDummyInput().appendField('}')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('setInterval saved to a variable (so you can stop it)')
    },
  }

  Blockly.Blocks['js_clear_timeout'] = {
    init() {
      this.appendDummyInput()
        .appendField('clearTimeout(')
        .appendField(new Blockly.FieldTextInput('timerId'), 'ID')
        .appendField(')')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('Cancel a setTimeout before it fires')
    },
  }

  Blockly.Blocks['js_clear_interval'] = {
    init() {
      this.appendDummyInput()
        .appendField('clearInterval(')
        .appendField(new Blockly.FieldTextInput('intervalId'), 'ID')
        .appendField(')')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1ABC9C')
      this.setTooltip('Stop a setInterval from repeating')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // FETCH & JSON
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_fetch_get'] = {
    init() {
      this.appendDummyInput()
        .appendField('fetch GET')
        .appendField(new Blockly.FieldTextInput('https://api.example.com/data'), 'URL')
        .appendField('{')
      this.appendStatementInput('BODY').setCheck(null).appendField('data:')
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#7F8C8D')
      this.setTooltip('Fetch data from a URL. Use "data" variable inside to work with the result.')
    },
  }

  Blockly.Blocks['js_fetch_post'] = {
    init() {
      this.appendValueInput('BODY_DATA')
        .setCheck(null)
        .appendField('fetch POST to')
        .appendField(new Blockly.FieldTextInput('https://api.example.com/data'), 'URL')
        .appendField('with data')
      this.appendDummyInput().appendField('{')
      this.appendStatementInput('HANDLER').setCheck(null).appendField('result:')
      this.appendDummyInput().appendField('}')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#7F8C8D')
      this.setTooltip('Send data to a URL using POST. Use "result" variable for the response.')
    },
  }

  Blockly.Blocks['js_json_parse'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('JSON.parse(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour('#7F8C8D')
      this.setTooltip('Convert a JSON string into a JavaScript object')
    },
  }

  Blockly.Blocks['js_json_stringify'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('JSON.stringify(')
      this.appendDummyInput().appendField(')')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('#7F8C8D')
      this.setTooltip('Convert a JavaScript object into a JSON string')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // LOCAL STORAGE
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_local_storage_set'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('localStorage: save key')
        .appendField(new Blockly.FieldTextInput('myKey'), 'KEY')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#28B463')
      this.setTooltip('Save a value to localStorage (persists after page close)')
    },
  }

  Blockly.Blocks['js_local_storage_get'] = {
    init() {
      this.appendDummyInput()
        .appendField('localStorage: get key')
        .appendField(new Blockly.FieldTextInput('myKey'), 'KEY')
      this.setOutput(true, 'String')
      this.setColour('#28B463')
      this.setTooltip('Get a value from localStorage. Returns null if the key does not exist.')
    },
  }

  Blockly.Blocks['js_local_storage_remove'] = {
    init() {
      this.appendDummyInput()
        .appendField('localStorage: remove key')
        .appendField(new Blockly.FieldTextInput('myKey'), 'KEY')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#28B463')
      this.setTooltip('Delete a key from localStorage')
    },
  }

  Blockly.Blocks['js_local_storage_clear'] = {
    init() {
      this.appendDummyInput().appendField('localStorage.clear()  (delete everything)')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#28B463')
      this.setTooltip('Clear ALL data from localStorage')
    },
  }

  Blockly.Blocks['js_session_storage_set'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('sessionStorage: save key')
        .appendField(new Blockly.FieldTextInput('myKey'), 'KEY')
        .appendField('=')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#28B463')
      this.setTooltip('Save a value to sessionStorage (cleared when browser tab closes)')
    },
  }

  Blockly.Blocks['js_session_storage_get'] = {
    init() {
      this.appendDummyInput()
        .appendField('sessionStorage: get key')
        .appendField(new Blockly.FieldTextInput('myKey'), 'KEY')
      this.setOutput(true, 'String')
      this.setColour('#28B463')
      this.setTooltip('Get a value from sessionStorage')
    },
  }

  // ════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS
  // ════════════════════════════════════════════════════════════════════════

  Blockly.Blocks['js_comment'] = {
    init() {
      this.appendDummyInput()
        .appendField('//')
        .appendField(new Blockly.FieldTextInput('This is a comment'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#95A5A6')
      this.setTooltip('A single-line comment (ignored by JavaScript)')
    },
  }

  Blockly.Blocks['js_block_comment'] = {
    init() {
      this.appendDummyInput()
        .appendField('/*')
        .appendField(new Blockly.FieldTextInput('Multi-line comment'), 'TEXT')
        .appendField('*/')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#95A5A6')
      this.setTooltip('A multi-line comment block')
    },
  }

  Blockly.Blocks['js_use_strict'] = {
    init() {
      this.appendDummyInput().appendField('"use strict";')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#95A5A6')
      this.setTooltip('Enable strict mode — catches common coding mistakes')
    },
  }

  Blockly.Blocks['js_debugger'] = {
    init() {
      this.appendDummyInput().appendField('debugger;  (pause here in DevTools)')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#95A5A6')
      this.setTooltip('Pause code execution in browser DevTools')
    },
  }

  Blockly.Blocks['js_window_location'] = {
    init() {
      this.appendDummyInput()
        .appendField('go to URL:')
        .appendField(new Blockly.FieldTextInput('https://example.com'), 'URL')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#95A5A6')
      this.setTooltip('Navigate the browser to a URL')
    },
  }

  Blockly.Blocks['js_window_location_get'] = {
    init() {
      this.appendDummyInput().appendField('window.location.href  (current URL)')
      this.setOutput(true, 'String')
      this.setColour('#95A5A6')
      this.setTooltip('Get the current page URL')
    },
  }
}
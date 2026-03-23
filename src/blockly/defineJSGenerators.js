import { javascriptGenerator, Order } from 'blockly/javascript'

// Helper to safely get a value input (returns '' if nothing connected)
const val = (block, name) =>
  javascriptGenerator.valueToCode(block, name, Order.ATOMIC) || 'null'

// Helper to safely get a statement input (returns '' if nothing inside)
const stmts = (block, name) =>
  javascriptGenerator.statementToCode(block, name) || ''

export const defineJSGenerators = () => {

  // ════════════════════════════════════════════════════════════════════════
  // HTML INTEGRATION
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_script_body'] = (block) => {
    const content = stmts(block, 'CONTENT')
    return `<script>\n${content}</script>\n`
  }

  javascriptGenerator.forBlock['js_script_head'] = (block) => {
    const content = stmts(block, 'CONTENT')
    return `<script>\n${content}</script>\n`
  }

  // ════════════════════════════════════════════════════════════════════════
  // VARIABLES & CONSTANTS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_let'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const value = val(block, 'VALUE')
    return `let ${name} = ${value};\n`
  }

  javascriptGenerator.forBlock['js_const'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const value = val(block, 'VALUE')
    return `const ${name} = ${value};\n`
  }

  javascriptGenerator.forBlock['js_var_decl'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const value = val(block, 'VALUE')
    return `var ${name} = ${value};\n`
  }

  javascriptGenerator.forBlock['js_get_var'] = (block) => {
    const name = block.getFieldValue('NAME')
    return [name, Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_set_var'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const value = val(block, 'VALUE')
    return `${name} = ${value};\n`
  }

  javascriptGenerator.forBlock['js_compound_assign'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const op    = block.getFieldValue('OP')
    const value = val(block, 'VALUE')
    return `${name} ${op} ${value};\n`
  }

  javascriptGenerator.forBlock['js_increment'] = (block) => {
    const name = block.getFieldValue('NAME')
    const op   = block.getFieldValue('OP')
    return `${name}${op};\n`
  }

  javascriptGenerator.forBlock['js_global_var'] = (block) => {
    const name  = block.getFieldValue('NAME')
    const value = val(block, 'VALUE')
    return `window.${name} = ${value};\n`
  }

  // ════════════════════════════════════════════════════════════════════════
  // DATA TYPES & LITERALS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_string_val'] = (block) => {
    const text = block.getFieldValue('VALUE').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return [`'${text}'`, Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_number_val'] = (block) => {
    return [String(block.getFieldValue('VALUE')), Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_boolean_val'] = (block) => {
    return [block.getFieldValue('VALUE'), Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_null'] = () => ['null', Order.ATOMIC]

  javascriptGenerator.forBlock['js_undefined'] = () => ['undefined', Order.ATOMIC]

  javascriptGenerator.forBlock['js_template_literal'] = (block) => {
    const before = block.getFieldValue('BEFORE')
    const expr   = val(block, 'EXPR')
    const after  = block.getFieldValue('AFTER')
    return [`\`${before}\${${expr}}${after}\``, Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_array_create'] = (block) => {
    const items = []
    for (let i = 0; i < 5; i++) {
      const code = javascriptGenerator.valueToCode(block, `ITEM${i}`, Order.COMMA)
      if (code) items.push(code)
    }
    return [`[${items.join(', ')}]`, Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_empty_array'] = () => ['[]', Order.ATOMIC]

  javascriptGenerator.forBlock['js_object_literal'] = (block) => {
    const k0 = block.getFieldValue('KEY0')
    const v0 = block.getFieldValue('VAL0')
    const k1 = block.getFieldValue('KEY1')
    const v1 = block.getFieldValue('VAL1')
    return [`{ ${k0}: '${v0}', ${k1}: '${v1}' }`, Order.ATOMIC]
  }

  javascriptGenerator.forBlock['js_property_get'] = (block) => {
    const obj  = val(block, 'OBJ')
    const prop = block.getFieldValue('PROP')
    return [`${obj}.${prop}`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_property_set'] = (block) => {
    const obj   = val(block, 'OBJ')
    const prop  = block.getFieldValue('PROP')
    const value = val(block, 'VALUE')
    return `${obj}.${prop} = ${value};\n`
  }

  javascriptGenerator.forBlock['js_bracket_get'] = (block) => {
    const obj = val(block, 'OBJ')
    const key = val(block, 'KEY')
    return [`${obj}[${key}]`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_bracket_set'] = (block) => {
    const obj   = val(block, 'OBJ')
    const key   = val(block, 'KEY')
    const value = val(block, 'VALUE')
    return `${obj}[${key}] = ${value};\n`
  }

  javascriptGenerator.forBlock['js_new_instance'] = (block) => {
    const cls  = block.getFieldValue('CLASS')
    const args = block.getFieldValue('ARGS')
    return [`new ${cls}(${args})`, Order.NEW]
  }

  // ════════════════════════════════════════════════════════════════════════
  // OPERATORS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_arithmetic'] = (block) => {
    const a  = val(block, 'A')
    const b  = val(block, 'B')
    const op = block.getFieldValue('OP')
    const order = (op === '**') ? Order.EXPONENTIATION
      : (op === '*' || op === '/' || op === '%') ? Order.MULTIPLICATION
      : Order.ADDITION
    return [`${a} ${op} ${b}`, order]
  }

  javascriptGenerator.forBlock['js_compare'] = (block) => {
    const a  = val(block, 'A')
    const b  = val(block, 'B')
    const op = block.getFieldValue('OP')
    return [`${a} ${op} ${b}`, Order.RELATIONAL]
  }

  javascriptGenerator.forBlock['js_logic_op'] = (block) => {
    const a  = val(block, 'A')
    const b  = val(block, 'B')
    const op = block.getFieldValue('OP')
    const order = op === '&&' ? Order.LOGICAL_AND : Order.LOGICAL_OR
    return [`${a} ${op} ${b}`, order]
  }

  javascriptGenerator.forBlock['js_not'] = (block) => {
    const value = val(block, 'VALUE')
    return [`!${value}`, Order.LOGICAL_NOT]
  }

  javascriptGenerator.forBlock['js_ternary'] = (block) => {
    const cond  = val(block, 'COND')
    const then_ = val(block, 'THEN')
    const else_ = val(block, 'ELSE')
    return [`${cond} ? ${then_} : ${else_}`, Order.CONDITIONAL]
  }

  javascriptGenerator.forBlock['js_typeof'] = (block) => {
    const value = val(block, 'VALUE')
    return [`typeof ${value}`, Order.TYPEOF]
  }

  javascriptGenerator.forBlock['js_instanceof'] = (block) => {
    const obj = val(block, 'OBJ')
    const cls = block.getFieldValue('CLASS')
    return [`${obj} instanceof ${cls}`, Order.RELATIONAL]
  }

  javascriptGenerator.forBlock['js_spread'] = (block) => {
    const value = val(block, 'VALUE')
    return [`...${value}`, Order.ATOMIC]
  }

  // ════════════════════════════════════════════════════════════════════════
  // CONTROL FLOW
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_if'] = (block) => {
    const cond = val(block, 'COND')
    const body = stmts(block, 'BODY')
    return `if (${cond}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_if_else'] = (block) => {
    const cond     = val(block, 'COND')
    const ifBody   = stmts(block, 'IF_BODY')
    const elseBody = stmts(block, 'ELSE_BODY')
    return `if (${cond}) {\n${ifBody}} else {\n${elseBody}}\n`
  }

  javascriptGenerator.forBlock['js_if_else_if'] = (block) => {
    const cond      = val(block, 'COND')
    const ifBody    = stmts(block, 'IF_BODY')
    const elseCond  = val(block, 'ELSE_COND')
    const elseIfBody= stmts(block, 'ELSE_IF_BODY')
    const elseBody  = stmts(block, 'ELSE_BODY')
    return `if (${cond}) {\n${ifBody}} else if (${elseCond}) {\n${elseIfBody}} else {\n${elseBody}}\n`
  }

  javascriptGenerator.forBlock['js_while'] = (block) => {
    const cond = val(block, 'COND')
    const body = stmts(block, 'BODY')
    return `while (${cond}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_do_while'] = (block) => {
    const body = stmts(block, 'BODY')
    const cond = val(block, 'COND')
    return `do {\n${body}} while (${cond});\n`
  }

  javascriptGenerator.forBlock['js_for_count'] = (block) => {
    const varName = block.getFieldValue('VAR')
    const to      = val(block, 'TO')
    const body    = stmts(block, 'BODY')
    return `for (let ${varName} = 0; ${varName} < ${to}; ${varName}++) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_for_range'] = (block) => {
    const varName = block.getFieldValue('VAR')
    const from    = val(block, 'FROM')
    const to      = val(block, 'TO')
    const body    = stmts(block, 'BODY')
    return `for (let ${varName} = ${from}; ${varName} < ${to}; ${varName}++) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_for_of'] = (block) => {
    const varName  = block.getFieldValue('VAR')
    const iterable = val(block, 'ITERABLE')
    const body     = stmts(block, 'BODY')
    return `for (const ${varName} of ${iterable}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_for_in'] = (block) => {
    const varName = block.getFieldValue('VAR')
    const obj     = val(block, 'OBJ')
    const body    = stmts(block, 'BODY')
    return `for (const ${varName} in ${obj}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_break'] = () => 'break;\n'

  javascriptGenerator.forBlock['js_continue'] = () => 'continue;\n'

  javascriptGenerator.forBlock['js_switch'] = (block) => {
    const expr    = val(block, 'EXPR')
    const case0   = block.getFieldValue('CASE0')
    const body0   = stmts(block, 'BODY0')
    const case1   = block.getFieldValue('CASE1')
    const body1   = stmts(block, 'BODY1')
    const def     = stmts(block, 'DEFAULT')
    return `switch (${expr}) {\n  case '${case0}':\n${body0}    break;\n  case '${case1}':\n${body1}    break;\n  default:\n${def}}\n`
  }

  javascriptGenerator.forBlock['js_try_catch'] = (block) => {
    const err   = block.getFieldValue('ERR')
    const tryB  = stmts(block, 'TRY')
    const catchB= stmts(block, 'CATCH')
    return `try {\n${tryB}} catch (${err}) {\n${catchB}}\n`
  }

  javascriptGenerator.forBlock['js_try_catch_finally'] = (block) => {
    const err     = block.getFieldValue('ERR')
    const tryB    = stmts(block, 'TRY')
    const catchB  = stmts(block, 'CATCH')
    const finallyB= stmts(block, 'FINALLY')
    return `try {\n${tryB}} catch (${err}) {\n${catchB}} finally {\n${finallyB}}\n`
  }

  javascriptGenerator.forBlock['js_throw'] = (block) => {
    const msg = block.getFieldValue('MSG').replace(/'/g, "\\'")
    return `throw new Error('${msg}');\n`
  }

  // ════════════════════════════════════════════════════════════════════════
  // FUNCTIONS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_function_def'] = (block) => {
    const name   = block.getFieldValue('NAME')
    const params = block.getFieldValue('PARAMS')
    const body   = stmts(block, 'BODY')
    return `function ${name}(${params}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_function_call_stmt'] = (block) => {
    const name = block.getFieldValue('NAME')
    const args = block.getFieldValue('ARGS')
    return `${name}(${args});\n`
  }

  javascriptGenerator.forBlock['js_function_call_expr'] = (block) => {
    const name = block.getFieldValue('NAME')
    const args = block.getFieldValue('ARGS')
    return [`${name}(${args})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_arrow_function'] = (block) => {
    const name   = block.getFieldValue('NAME')
    const params = block.getFieldValue('PARAMS')
    const body   = stmts(block, 'BODY')
    return `const ${name} = (${params}) => {\n${body}};\n`
  }

  javascriptGenerator.forBlock['js_async_function'] = (block) => {
    const name   = block.getFieldValue('NAME')
    const params = block.getFieldValue('PARAMS')
    const body   = stmts(block, 'BODY')
    return `async function ${name}(${params}) {\n${body}}\n`
  }

  javascriptGenerator.forBlock['js_return'] = (block) => {
    const value = val(block, 'VALUE')
    return `return ${value};\n`
  }

  javascriptGenerator.forBlock['js_return_void'] = () => 'return;\n'

  javascriptGenerator.forBlock['js_await'] = (block) => {
    const value = val(block, 'VALUE')
    return [`await ${value}`, Order.AWAIT]
  }

  // ════════════════════════════════════════════════════════════════════════
  // CONSOLE & DIALOG
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_console_log'] = (block) => {
    const value = val(block, 'VALUE')
    return `console.log(${value});\n`
  }

  javascriptGenerator.forBlock['js_console_error'] = (block) => {
    const value = val(block, 'VALUE')
    return `console.error(${value});\n`
  }

  javascriptGenerator.forBlock['js_console_warn'] = (block) => {
    const value = val(block, 'VALUE')
    return `console.warn(${value});\n`
  }

  javascriptGenerator.forBlock['js_alert'] = (block) => {
    const value = val(block, 'VALUE')
    return `alert(${value});\n`
  }

  javascriptGenerator.forBlock['js_confirm'] = (block) => {
    const msg = val(block, 'MSG')
    return [`confirm(${msg})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_prompt'] = (block) => {
    const msg  = block.getFieldValue('MSG').replace(/'/g, "\\'")
    const def  = block.getFieldValue('DEFAULT').replace(/'/g, "\\'")
    const dflt = def ? `, '${def}'` : ''
    return [`prompt('${msg}'${dflt})`, Order.FUNCTION_CALL]
  }

  // ════════════════════════════════════════════════════════════════════════
  // MATH METHODS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_math_random'] = () =>
    ['Math.random()', Order.FUNCTION_CALL]

  javascriptGenerator.forBlock['js_math_method'] = (block) => {
    const method = block.getFieldValue('METHOD')
    const value  = val(block, 'VALUE')
    return [`Math.${method}(${value})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_math_pow'] = (block) => {
    const base = val(block, 'BASE')
    const exp  = val(block, 'EXP')
    return [`Math.pow(${base}, ${exp})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_math_min_max'] = (block) => {
    const method = block.getFieldValue('METHOD')
    const a      = val(block, 'A')
    const b      = val(block, 'B')
    return [`Math.${method}(${a}, ${b})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_math_random_int'] = (block) => {
    const min = val(block, 'MIN')
    const max = val(block, 'MAX')
    return [
      `Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min}`,
      Order.ADDITION,
    ]
  }

  javascriptGenerator.forBlock['js_parse_number'] = (block) => {
    const method = block.getFieldValue('METHOD')
    const value  = val(block, 'VALUE')
    return [`${method}(${value})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_to_string'] = (block) => {
    const value = val(block, 'VALUE')
    return [`String(${value})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_date_now'] = () =>
    ['Date.now()', Order.FUNCTION_CALL]

  javascriptGenerator.forBlock['js_new_date'] = () =>
    ['new Date()', Order.NEW]

  // ════════════════════════════════════════════════════════════════════════
  // STRING METHODS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_string_length'] = (block) => {
    const str = val(block, 'STR')
    return [`${str}.length`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_string_case'] = (block) => {
    const str    = val(block, 'STR')
    const method = block.getFieldValue('METHOD')
    return [`${str}.${method}()`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_includes'] = (block) => {
    const str    = val(block, 'STR')
    const search = val(block, 'SEARCH')
    return [`${str}.includes(${search})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_starts_ends'] = (block) => {
    const str    = val(block, 'STR')
    const method = block.getFieldValue('METHOD')
    const search = val(block, 'SEARCH')
    return [`${str}.${method}(${search})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_index_of'] = (block) => {
    const str    = val(block, 'STR')
    const search = val(block, 'SEARCH')
    return [`${str}.indexOf(${search})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_slice'] = (block) => {
    const str   = val(block, 'STR')
    const start = val(block, 'START')
    const end   = val(block, 'END')
    return [`${str}.slice(${start}, ${end})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_replace'] = (block) => {
    const str     = val(block, 'STR')
    const search  = val(block, 'SEARCH')
    const replace = val(block, 'REPLACE')
    return [`${str}.replace(${search}, ${replace})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_split'] = (block) => {
    const str = val(block, 'STR')
    const sep = val(block, 'SEP')
    return [`${str}.split(${sep})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_concat'] = (block) => {
    const a = val(block, 'A')
    const b = val(block, 'B')
    return [`${a} + ${b}`, Order.ADDITION]
  }

  javascriptGenerator.forBlock['js_string_repeat'] = (block) => {
    const str   = val(block, 'STR')
    const times = val(block, 'TIMES')
    return [`${str}.repeat(${times})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_string_char_at'] = (block) => {
    const str   = val(block, 'STR')
    const index = val(block, 'INDEX')
    return [`${str}[${index}]`, Order.MEMBER]
  }

  // ════════════════════════════════════════════════════════════════════════
  // ARRAY METHODS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_array_length'] = (block) => {
    const arr = val(block, 'ARR')
    return [`${arr}.length`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_array_get'] = (block) => {
    const arr   = val(block, 'ARR')
    const index = val(block, 'INDEX')
    return [`${arr}[${index}]`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_array_set'] = (block) => {
    const arr   = val(block, 'ARR')
    const index = val(block, 'INDEX')
    const value = val(block, 'VALUE')
    return `${arr}[${index}] = ${value};\n`
  }

  javascriptGenerator.forBlock['js_array_push'] = (block) => {
    const arr  = val(block, 'ARR')
    const item = val(block, 'ITEM')
    return `${arr}.push(${item});\n`
  }

  javascriptGenerator.forBlock['js_array_pop'] = (block) => {
    const arr = val(block, 'ARR')
    return `${arr}.pop();\n`
  }

  javascriptGenerator.forBlock['js_array_shift'] = (block) => {
    const arr = val(block, 'ARR')
    return `${arr}.shift();\n`
  }

  javascriptGenerator.forBlock['js_array_unshift'] = (block) => {
    const arr  = val(block, 'ARR')
    const item = val(block, 'ITEM')
    return `${arr}.unshift(${item});\n`
  }

  javascriptGenerator.forBlock['js_array_includes'] = (block) => {
    const arr  = val(block, 'ARR')
    const item = val(block, 'ITEM')
    return [`${arr}.includes(${item})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_array_index_of'] = (block) => {
    const arr  = val(block, 'ARR')
    const item = val(block, 'ITEM')
    return [`${arr}.indexOf(${item})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_array_join'] = (block) => {
    const arr = val(block, 'ARR')
    const sep = val(block, 'SEP')
    return [`${arr}.join(${sep})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_array_mutate'] = (block) => {
    const arr    = val(block, 'ARR')
    const method = block.getFieldValue('METHOD')
    return `${arr}.${method}();\n`
  }

  javascriptGenerator.forBlock['js_array_slice'] = (block) => {
    const arr   = val(block, 'ARR')
    const start = val(block, 'START')
    const end   = val(block, 'END')
    return [`${arr}.slice(${start}, ${end})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_array_splice'] = (block) => {
    const arr   = val(block, 'ARR')
    const start = val(block, 'START')
    const count = val(block, 'COUNT')
    return `${arr}.splice(${start}, ${count});\n`
  }

  javascriptGenerator.forBlock['js_array_concat'] = (block) => {
    const arr1 = val(block, 'ARR1')
    const arr2 = val(block, 'ARR2')
    return [`${arr1}.concat(${arr2})`, Order.FUNCTION_CALL]
  }

  // ════════════════════════════════════════════════════════════════════════
  // DOM MANIPULATION
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_get_by_id'] = (block) => {
    const id = block.getFieldValue('ID')
    return [`document.getElementById('${id}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_query_selector'] = (block) => {
    const sel = block.getFieldValue('SEL').replace(/'/g, "\\'")
    return [`document.querySelector('${sel}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_query_selector_all'] = (block) => {
    const sel = block.getFieldValue('SEL').replace(/'/g, "\\'")
    return [`document.querySelectorAll('${sel}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_create_element'] = (block) => {
    const tag = block.getFieldValue('TAG')
    return [`document.createElement('${tag}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_append_child'] = (block) => {
    const parent = val(block, 'PARENT')
    const child  = val(block, 'CHILD')
    return `${parent}.appendChild(${child});\n`
  }

  javascriptGenerator.forBlock['js_remove_element'] = (block) => {
    const elem = val(block, 'ELEM')
    return `${elem}.remove();\n`
  }

  javascriptGenerator.forBlock['js_set_attribute'] = (block) => {
    const elem  = val(block, 'ELEM')
    const attr  = block.getFieldValue('ATTR')
    const value = block.getFieldValue('VALUE').replace(/'/g, "\\'")
    return `${elem}.setAttribute('${attr}', '${value}');\n`
  }

  javascriptGenerator.forBlock['js_get_attribute'] = (block) => {
    const elem = val(block, 'ELEM')
    const attr = block.getFieldValue('ATTR').replace(/'/g, "\\'")
    return [`${elem}.getAttribute('${attr}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_set_inner_html'] = (block) => {
    const elem = val(block, 'ELEM')
    const html = val(block, 'HTML')
    return `${elem}.innerHTML = ${html};\n`
  }

  javascriptGenerator.forBlock['js_get_inner_html'] = (block) => {
    const elem = val(block, 'ELEM')
    return [`${elem}.innerHTML`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_set_text_content'] = (block) => {
    const elem = val(block, 'ELEM')
    const text = val(block, 'TEXT')
    return `${elem}.textContent = ${text};\n`
  }

  javascriptGenerator.forBlock['js_get_text_content'] = (block) => {
    const elem = val(block, 'ELEM')
    return [`${elem}.textContent`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_set_value'] = (block) => {
    const elem  = val(block, 'ELEM')
    const value = val(block, 'VALUE')
    return `${elem}.value = ${value};\n`
  }

  javascriptGenerator.forBlock['js_get_value'] = (block) => {
    const elem = val(block, 'ELEM')
    return [`${elem}.value`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_class_list'] = (block) => {
    const elem   = val(block, 'ELEM')
    const method = block.getFieldValue('METHOD')
    const cls    = block.getFieldValue('CLASS').replace(/'/g, "\\'")
    return `${elem}.classList.${method}('${cls}');\n`
  }

  javascriptGenerator.forBlock['js_class_list_contains'] = (block) => {
    const elem = val(block, 'ELEM')
    const cls  = block.getFieldValue('CLASS').replace(/'/g, "\\'")
    return [`${elem}.classList.contains('${cls}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_set_style'] = (block) => {
    const elem  = val(block, 'ELEM')
    const prop  = block.getFieldValue('PROP')
    const value = block.getFieldValue('VALUE').replace(/'/g, "\\'")
    return `${elem}.style.${prop} = '${value}';\n`
  }

  javascriptGenerator.forBlock['js_get_style'] = (block) => {
    const elem = val(block, 'ELEM')
    const prop = block.getFieldValue('PROP')
    return [`${elem}.style.${prop}`, Order.MEMBER]
  }

  javascriptGenerator.forBlock['js_document_title'] = (block) => {
    const value = val(block, 'VALUE')
    return `document.title = ${value};\n`
  }

  javascriptGenerator.forBlock['js_document_body'] = () =>
    ['document.body', Order.MEMBER]

  // ════════════════════════════════════════════════════════════════════════
  // EVENTS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_add_event_listener'] = (block) => {
    const elem    = val(block, 'ELEM')
    const event   = block.getFieldValue('EVENT')
    const handler = stmts(block, 'HANDLER')
    return `${elem}.addEventListener('${event}', function(event) {\n${handler}});\n`
  }

  javascriptGenerator.forBlock['js_window_event'] = (block) => {
    const event   = block.getFieldValue('EVENT')
    const handler = stmts(block, 'HANDLER')
    return `window.addEventListener('${event}', function(event) {\n${handler}});\n`
  }

  javascriptGenerator.forBlock['js_dom_content_loaded'] = (block) => {
    const body = stmts(block, 'BODY')
    return `document.addEventListener('DOMContentLoaded', function() {\n${body}});\n`
  }

  javascriptGenerator.forBlock['js_event_target'] = () =>
    ['event.target', Order.MEMBER]

  javascriptGenerator.forBlock['js_event_value'] = () =>
    ['event.target.value', Order.MEMBER]

  javascriptGenerator.forBlock['js_event_key'] = () =>
    ['event.key', Order.MEMBER]

  javascriptGenerator.forBlock['js_prevent_default'] = () =>
    'event.preventDefault();\n'

  javascriptGenerator.forBlock['js_stop_propagation'] = () =>
    'event.stopPropagation();\n'

  // ════════════════════════════════════════════════════════════════════════
  // TIMERS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_set_timeout'] = (block) => {
    const delay = val(block, 'DELAY')
    const body  = stmts(block, 'BODY')
    return `setTimeout(function() {\n${body}}, ${delay});\n`
  }

  javascriptGenerator.forBlock['js_set_interval'] = (block) => {
    const interval = val(block, 'INTERVAL')
    const body     = stmts(block, 'BODY')
    return `setInterval(function() {\n${body}}, ${interval});\n`
  }

  javascriptGenerator.forBlock['js_set_timeout_var'] = (block) => {
    const varName = block.getFieldValue('VAR')
    const delay   = val(block, 'DELAY')
    const body    = stmts(block, 'BODY')
    return `const ${varName} = setTimeout(function() {\n${body}}, ${delay});\n`
  }

  javascriptGenerator.forBlock['js_set_interval_var'] = (block) => {
    const varName  = block.getFieldValue('VAR')
    const interval = val(block, 'INTERVAL')
    const body     = stmts(block, 'BODY')
    return `const ${varName} = setInterval(function() {\n${body}}, ${interval});\n`
  }

  javascriptGenerator.forBlock['js_clear_timeout'] = (block) => {
    const id = block.getFieldValue('ID')
    return `clearTimeout(${id});\n`
  }

  javascriptGenerator.forBlock['js_clear_interval'] = (block) => {
    const id = block.getFieldValue('ID')
    return `clearInterval(${id});\n`
  }

  // ════════════════════════════════════════════════════════════════════════
  // FETCH & JSON
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_fetch_get'] = (block) => {
    const url  = block.getFieldValue('URL').replace(/'/g, "\\'")
    const body = stmts(block, 'BODY')
    return (
      `(async () => {\n` +
      `  try {\n` +
      `    const response = await fetch('${url}');\n` +
      `    const data = await response.json();\n` +
      `${body}` +
      `  } catch (err) {\n` +
      `    console.error('Fetch error:', err);\n` +
      `  }\n` +
      `})();\n`
    )
  }

  javascriptGenerator.forBlock['js_fetch_post'] = (block) => {
    const url      = block.getFieldValue('URL').replace(/'/g, "\\'")
    const bodyData = val(block, 'BODY_DATA')
    const handler  = stmts(block, 'HANDLER')
    return (
      `(async () => {\n` +
      `  try {\n` +
      `    const response = await fetch('${url}', {\n` +
      `      method: 'POST',\n` +
      `      headers: { 'Content-Type': 'application/json' },\n` +
      `      body: JSON.stringify(${bodyData}),\n` +
      `    });\n` +
      `    const result = await response.json();\n` +
      `${handler}` +
      `  } catch (err) {\n` +
      `    console.error('Fetch error:', err);\n` +
      `  }\n` +
      `})();\n`
    )
  }

  javascriptGenerator.forBlock['js_json_parse'] = (block) => {
    const value = val(block, 'VALUE')
    return [`JSON.parse(${value})`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_json_stringify'] = (block) => {
    const value = val(block, 'VALUE')
    return [`JSON.stringify(${value})`, Order.FUNCTION_CALL]
  }

  // ════════════════════════════════════════════════════════════════════════
  // LOCAL / SESSION STORAGE
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_local_storage_set'] = (block) => {
    const key   = block.getFieldValue('KEY').replace(/'/g, "\\'")
    const value = val(block, 'VALUE')
    return `localStorage.setItem('${key}', ${value});\n`
  }

  javascriptGenerator.forBlock['js_local_storage_get'] = (block) => {
    const key = block.getFieldValue('KEY').replace(/'/g, "\\'")
    return [`localStorage.getItem('${key}')`, Order.FUNCTION_CALL]
  }

  javascriptGenerator.forBlock['js_local_storage_remove'] = (block) => {
    const key = block.getFieldValue('KEY').replace(/'/g, "\\'")
    return `localStorage.removeItem('${key}');\n`
  }

  javascriptGenerator.forBlock['js_local_storage_clear'] = () =>
    'localStorage.clear();\n'

  javascriptGenerator.forBlock['js_session_storage_set'] = (block) => {
    const key   = block.getFieldValue('KEY').replace(/'/g, "\\'")
    const value = val(block, 'VALUE')
    return `sessionStorage.setItem('${key}', ${value});\n`
  }

  javascriptGenerator.forBlock['js_session_storage_get'] = (block) => {
    const key = block.getFieldValue('KEY').replace(/'/g, "\\'")
    return [`sessionStorage.getItem('${key}')`, Order.FUNCTION_CALL]
  }

  // ════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS
  // ════════════════════════════════════════════════════════════════════════

  javascriptGenerator.forBlock['js_comment'] = (block) => {
    const text = block.getFieldValue('TEXT')
    return `// ${text}\n`
  }

  javascriptGenerator.forBlock['js_block_comment'] = (block) => {
    const text = block.getFieldValue('TEXT')
    return `/* ${text} */\n`
  }

  javascriptGenerator.forBlock['js_use_strict'] = () => '"use strict";\n'

  javascriptGenerator.forBlock['js_debugger'] = () => 'debugger;\n'

  javascriptGenerator.forBlock['js_window_location'] = (block) => {
    const url = block.getFieldValue('URL').replace(/'/g, "\\'")
    return `window.location.href = '${url}';\n`
  }

  javascriptGenerator.forBlock['js_window_location_get'] = () =>
    ['window.location.href', Order.MEMBER]
}
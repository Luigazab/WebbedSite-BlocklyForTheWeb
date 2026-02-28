// AUTO-GENERATED BLOCKLY BLOCKS FROM CSV
// =========================================

Blockly.Blocks['paragraph'] = {
  init: function() {
    this.jsonInit({
      "type": "paragraph",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Your text here",
                  "type": "field_input"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Paragraph element",
      "message0": "Paragraph %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['paragraph'] = function(block) {
  let code = `<p>{TEXT}</p>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['italic'] = {
  init: function() {
    this.jsonInit({
      "type": "italic",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "italic text",
                  "type": "field_input"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Italic text",
      "message0": "Italic %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['italic'] = function(block) {
  let code = `<em>{TEXT}</em>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['title'] = {
  init: function() {
    this.jsonInit({
      "type": "title",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "My Website",
                  "type": "field_input"
            }
      ],
      "colour": "#A7C1E8",
      "helpUrl": "",
      "tooltip": "Page title",
      "message0": "Title %1",
      "nextStatement": "head_element",
      "previousStatement": "head_element"
});
  }
};

javascriptGenerator.forBlock['title'] = function(block) {
  let code = `<title>{TEXT}</title>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['span'] = {
  init: function() {
    this.jsonInit({
      "type": "span",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "text",
                  "type": "input_statement"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Inline text container",
      "message0": "Span %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['span'] = function(block) {
  let code = `<span>{TEXT}</span>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['main'] = {
  init: function() {
    this.jsonInit({
      "type": "main",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Main content area",
      "message0": "Main Content \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['main'] = function(block) {
  let code = `<main>\n{CONTENT}\n</main>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['body'] = {
  init: function() {
    this.jsonInit({
      "type": "body",
      "args0": [
            {
                  "type": "input_dummy"
            },
            {
                  "name": "body_element",
                  "type": "input_statement",
                  "check": "body_element"
            }
      ],
      "colour": "#f16529",
      "helpUrl": "",
      "tooltip": "The content of the html page",
      "message0": "<body> %1%2</body>",
      "previousStatement": "BODY"
});
  }
};

javascriptGenerator.forBlock['body'] = function(block) {
  let code = `<body>\n{CONTENT}\n</body>\n`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['css_border_radius'] = {
  init: function() {
    this.jsonInit({
      "type": "css_border_radius",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 0
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Rounded corners",
      "message0": "Border Radius %1 px",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_border_radius'] = function(block) {
  let code = `  border-radius: {VALUE}px;\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['checkbox'] = {
  init: function() {
    this.jsonInit({
      "type": "checkbox",
      "args0": [
            {
                  "name": "NAME",
                  "text": "agree",
                  "type": "field_input"
            },
            {
                  "name": "VALUE",
                  "text": "yes",
                  "type": "field_input"
            },
            {
                  "name": "CHECKED",
                  "type": "field_checkbox",
                  "checked": false
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Checkbox input",
      "message0": "Checkbox %1 Value %2 %3 Checked",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['checkbox'] = function(block) {
  let code = `<input type="checkbox" name="{NAME}" value="{VALUE}" {CHECKED_ATTR}>\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  if (block.getInput('CHECKED_ATTR')) {
    code = code.replace('{CHECKED_ATTR}', javascriptGenerator.statementToCode(block, 'CHECKED_ATTR'));
  } else {
    code = code.replace('{CHECKED_ATTR}', block.getFieldValue('CHECKED_ATTR') || '');
  }
  return code;
};


Blockly.Blocks['audio'] = {
  init: function() {
    this.jsonInit({
      "type": "audio",
      "args0": [
            {
                  "name": "SRC",
                  "text": "audio.mp3",
                  "type": "field_input"
            },
            {
                  "name": "CONTROLS",
                  "type": "field_checkbox",
                  "checked": true
            }
      ],
      "colour": "#ff8c00",
      "helpUrl": "",
      "tooltip": "Audio element",
      "message0": "Audio %1 %2 Controls",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['audio'] = function(block) {
  let code = `<audio src="{SRC}" {CONTROLS_ATTR}></audio>\n`;
  if (block.getInput('SRC')) {
    code = code.replace('{SRC}', javascriptGenerator.statementToCode(block, 'SRC'));
  } else {
    code = code.replace('{SRC}', block.getFieldValue('SRC') || '');
  }
  if (block.getInput('CONTROLS_ATTR')) {
    code = code.replace('{CONTROLS_ATTR}', javascriptGenerator.statementToCode(block, 'CONTROLS_ATTR'));
  } else {
    code = code.replace('{CONTROLS_ATTR}', block.getFieldValue('CONTROLS_ATTR') || '');
  }
  return code;
};


Blockly.Blocks['css_z_index'] = {
  init: function() {
    this.jsonInit({
      "type": "css_z_index",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 0
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "Stacking order",
      "message0": "Z-Index %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_z_index'] = function(block) {
  let code = `  z-index: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['bold'] = {
  init: function() {
    this.jsonInit({
      "type": "bold",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "bold text",
                  "type": "field_input"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Bold text",
      "message0": "Bold  text%1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['bold'] = function(block) {
  let code = `<strong>{TEXT}</strong>`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['css_justify_content'] = {
  init: function() {
    this.jsonInit({
      "type": "css_justify_content",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Flex Start",
                              "flex-start"
                        ],
                        [
                              "Flex End",
                              "flex-end"
                        ],
                        [
                              "Center",
                              "center"
                        ],
                        [
                              "Space Between",
                              "space-between"
                        ],
                        [
                              "Space Around",
                              "space-around"
                        ],
                        [
                              "Space Evenly",
                              "space-evenly"
                        ]
                  ]
            }
      ],
      "colour": "#8e44ad",
      "helpUrl": "",
      "tooltip": "Justify content",
      "message0": "Justify Content %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_justify_content'] = function(block) {
  let code = `  justify-content: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['meta_charset'] = {
  init: function() {
    this.jsonInit({
      "type": "meta_charset",
      "args0": [
            {
                  "name": "CHARSET",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "UTF-8",
                              "UTF-8"
                        ],
                        [
                              "ISO-8859-1",
                              "ISO-8859-1"
                        ],
                        [
                              "ASCII",
                              "ASCII"
                        ]
                  ]
            }
      ],
      "colour": "#A7C1E8",
      "helpUrl": "https://www.w3schools.com/tags/tag_meta.asp",
      "tooltip": "Defines the character encoding of the document.",
      "message0": "meta charset %1",
      "nextStatement": "head_element",
      "previousStatement": "head_element"
});
  }
};

javascriptGenerator.forBlock['meta_charset'] = function(block) {
  let code = `<meta charset="{CHARSET}">\n`;
  if (block.getInput('CHARSET')) {
    code = code.replace('{CHARSET}', javascriptGenerator.statementToCode(block, 'CHARSET'));
  } else {
    code = code.replace('{CHARSET}', block.getFieldValue('CHARSET') || '');
  }
  return code;
};


Blockly.Blocks['image'] = {
  init: function() {
    this.jsonInit({
      "type": "image",
      "args0": [
            {
                  "name": "SRC",
                  "text": "image.jpg",
                  "type": "field_input"
            },
            {
                  "name": "ALT",
                  "text": "Description",
                  "type": "field_input"
            },
            {
                  "name": "WIDTH",
                  "text": "",
                  "type": "field_input"
            },
            {
                  "name": "HEIGHT",
                  "text": "",
                  "type": "field_input"
            }
      ],
      "colour": "#ff8c00",
      "helpUrl": "",
      "tooltip": "Image element",
      "message0": "Image %1 Alt text %2 Width %3 Height %4",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['image'] = function(block) {
  let code = `<img src="{SRC}" alt="{ALT}" width="{WIDTH}" height="{HEIGHT}">\n`;
  if (block.getInput('WIDTH')) {
    code = code.replace('{WIDTH}', javascriptGenerator.statementToCode(block, 'WIDTH'));
  } else {
    code = code.replace('{WIDTH}', block.getFieldValue('WIDTH') || '');
  }
  if (block.getInput('HEIGHT')) {
    code = code.replace('{HEIGHT}', javascriptGenerator.statementToCode(block, 'HEIGHT'));
  } else {
    code = code.replace('{HEIGHT}', block.getFieldValue('HEIGHT') || '');
  }
  if (block.getInput('SRC')) {
    code = code.replace('{SRC}', javascriptGenerator.statementToCode(block, 'SRC'));
  } else {
    code = code.replace('{SRC}', block.getFieldValue('SRC') || '');
  }
  if (block.getInput('ALT')) {
    code = code.replace('{ALT}', javascriptGenerator.statementToCode(block, 'ALT'));
  } else {
    code = code.replace('{ALT}', block.getFieldValue('ALT') || '');
  }
  return code;
};


Blockly.Blocks['form'] = {
  init: function() {
    this.jsonInit({
      "type": "form",
      "args0": [
            {
                  "name": "METHOD",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "POST",
                              "post"
                        ],
                        [
                              "GET",
                              "get"
                        ]
                  ]
            },
            {
                  "name": "ACTION",
                  "text": "/submit",
                  "type": "field_input"
            },
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Form element",
      "message0": "Form %1 Action %2 \n %3",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['form'] = function(block) {
  let code = `<form method="{METHOD}" action="{ACTION}">\n{CONTENT}\n</form>\n`;
  if (block.getInput('ACTION')) {
    code = code.replace('{ACTION}', javascriptGenerator.statementToCode(block, 'ACTION'));
  } else {
    code = code.replace('{ACTION}', block.getFieldValue('ACTION') || '');
  }
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  if (block.getInput('METHOD')) {
    code = code.replace('{METHOD}', javascriptGenerator.statementToCode(block, 'METHOD'));
  } else {
    code = code.replace('{METHOD}', block.getFieldValue('METHOD') || '');
  }
  return code;
};


Blockly.Blocks['css_float'] = {
  init: function() {
    this.jsonInit({
      "type": "css_float",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "None",
                              "none"
                        ],
                        [
                              "Left",
                              "left"
                        ],
                        [
                              "Right",
                              "right"
                        ]
                  ]
            }
      ],
      "colour": "#f39c12",
      "helpUrl": "",
      "tooltip": "Float element",
      "message0": "Float %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_float'] = function(block) {
  let code = `  float: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_background_color'] = {
  init: function() {
    this.jsonInit({
      "type": "css_background_color",
      "args0": [
            {
                  "name": "COLOR",
                  "type": "field_colour",
                  "colour": "#ffffff"
            }
      ],
      "colour": "#e74c3c",
      "helpUrl": "",
      "tooltip": "background color",
      "message0": "Background Color %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_background_color'] = function(block) {
  let code = `  background-color: {COLOR};\n`;
  if (block.getInput('COLOR')) {
    code = code.replace('{COLOR}', javascriptGenerator.statementToCode(block, 'COLOR'));
  } else {
    code = code.replace('{COLOR}', block.getFieldValue('COLOR') || '');
  }
  return code;
};


Blockly.Blocks['css_font_family'] = {
  init: function() {
    this.jsonInit({
      "type": "css_font_family",
      "args0": [
            {
                  "name": "FONT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Arial",
                              "Arial, sans-serif"
                        ],
                        [
                              "Helvetica",
                              "Helvetica, sans-serif"
                        ],
                        [
                              "Times New Roman",
                              "'Times New Roman', serif"
                        ],
                        [
                              "Georgia",
                              "Georgia, serif"
                        ],
                        [
                              "Courier New",
                              "'Courier New', monospace"
                        ],
                        [
                              "Verdana",
                              "Verdana, sans-serif"
                        ]
                  ]
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Font family",
      "message0": "Font %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_font_family'] = function(block) {
  let code = `  font-family: {FONT};\n`;
  if (block.getInput('FONT')) {
    code = code.replace('{FONT}', javascriptGenerator.statementToCode(block, 'FONT'));
  } else {
    code = code.replace('{FONT}', block.getFieldValue('FONT') || '');
  }
  return code;
};


Blockly.Blocks['css_box_shadow'] = {
  init: function() {
    this.jsonInit({
      "type": "css_box_shadow",
      "args0": [
            {
                  "name": "X",
                  "type": "field_number",
                  "value": 0
            },
            {
                  "name": "Y",
                  "type": "field_number",
                  "value": 4
            },
            {
                  "min": 0,
                  "name": "BLUR",
                  "type": "field_number",
                  "value": 6
            },
            {
                  "name": "COLOR",
                  "type": "field_colour",
                  "colour": "#00000040"
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "Box shadow",
      "message0": "Box Shadow X %1 Y %2 Blur %3 %4",
      "inputsInline": false,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_box_shadow'] = function(block) {
  let code = `  box-shadow: {X}px {Y}px {BLUR}px {COLOR};\n`;
  if (block.getInput('X')) {
    code = code.replace('{X}', javascriptGenerator.statementToCode(block, 'X'));
  } else {
    code = code.replace('{X}', block.getFieldValue('X') || '');
  }
  if (block.getInput('BLUR')) {
    code = code.replace('{BLUR}', javascriptGenerator.statementToCode(block, 'BLUR'));
  } else {
    code = code.replace('{BLUR}', block.getFieldValue('BLUR') || '');
  }
  if (block.getInput('COLOR')) {
    code = code.replace('{COLOR}', javascriptGenerator.statementToCode(block, 'COLOR'));
  } else {
    code = code.replace('{COLOR}', block.getFieldValue('COLOR') || '');
  }
  if (block.getInput('Y')) {
    code = code.replace('{Y}', javascriptGenerator.statementToCode(block, 'Y'));
  } else {
    code = code.replace('{Y}', block.getFieldValue('Y') || '');
  }
  return code;
};


Blockly.Blocks['div'] = {
  init: function() {
    this.jsonInit({
      "type": "div",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Generic container",
      "message0": "Div container \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['div'] = function(block) {
  let code = `<div>\n{CONTENT}\n</div>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['input_email'] = {
  init: function() {
    this.jsonInit({
      "type": "input_email",
      "args0": [
            {
                  "name": "NAME",
                  "text": "email",
                  "type": "field_input"
            },
            {
                  "name": "PLACEHOLDER",
                  "text": "Enter email",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Email input field",
      "message0": "Email Input %1 Placeholder %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['input_email'] = function(block) {
  let code = `<input type="email" name="{NAME}" placeholder="{PLACEHOLDER}">\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('PLACEHOLDER')) {
    code = code.replace('{PLACEHOLDER}', javascriptGenerator.statementToCode(block, 'PLACEHOLDER'));
  } else {
    code = code.replace('{PLACEHOLDER}', block.getFieldValue('PLACEHOLDER') || '');
  }
  return code;
};


Blockly.Blocks['select'] = {
  init: function() {
    this.jsonInit({
      "type": "select",
      "args0": [
            {
                  "name": "NAME",
                  "text": "choice",
                  "type": "field_input"
            },
            {
                  "name": "ITEMS",
                  "type": "input_statement",
                  "check": "list_item"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Dropdown select",
      "message0": "Dropdown name =%1 \n%2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['select'] = function(block) {
  let code = `<select name="{NAME}">\n{ITEMS}\n</select>\n`;
  if (block.getInput('ITEMS')) {
    code = code.replace('{ITEMS}', javascriptGenerator.statementToCode(block, 'ITEMS'));
  } else {
    code = code.replace('{ITEMS}', block.getFieldValue('ITEMS') || '');
  }
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  return code;
};


Blockly.Blocks['horizontal_rule'] = {
  init: function() {
    this.jsonInit({
      "type": "horizontal_rule",
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Horizontal rule",
      "message0": "Horizontal Line",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['horizontal_rule'] = function(block) {
  let code = `<hr>\n`;
  return code;
};


Blockly.Blocks['css_selector'] = {
  init: function() {
    this.jsonInit({
      "type": "css_selector",
      "args0": [
            {
                  "name": "SELECTOR",
                  "text": "body",
                  "type": "field_input"
            },
            {
                  "name": "PROPERTIES",
                  "type": "input_statement",
                  "check": "css_property"
            }
      ],
      "colour": "#4682B4",
      "helpUrl": "",
      "tooltip": "CSS selector",
      "message0": "style %1{\n %2}",
      "inputsInline": true,
      "nextStatement": "css_element",
      "previousStatement": "css_element"
});
  }
};

javascriptGenerator.forBlock['css_selector'] = function(block) {
  let code = `{SELECTOR} {\n{PROPERTIES}\n}\n`;
  if (block.getInput('SELECTOR')) {
    code = code.replace('{SELECTOR}', javascriptGenerator.statementToCode(block, 'SELECTOR'));
  } else {
    code = code.replace('{SELECTOR}', block.getFieldValue('SELECTOR') || '');
  }
  if (block.getInput('PROPERTIES')) {
    code = code.replace('{PROPERTIES}', javascriptGenerator.statementToCode(block, 'PROPERTIES'));
  } else {
    code = code.replace('{PROPERTIES}', block.getFieldValue('PROPERTIES') || '');
  }
  return code;
};


Blockly.Blocks['style_tag'] = {
  init: function() {
    this.jsonInit({
      "type": "style_tag",
      "args0": [
            {
                  "type": "input_dummy"
            },
            {
                  "name": "CSS",
                  "type": "input_statement",
                  "check": "css_element"
            }
      ],
      "colour": "#4682B4",
      "helpUrl": "",
      "tooltip": "CSS style tag",
      "message0": "<style> %1 %2</style>",
      "inputsInline": false,
      "nextStatement": "head_element",
      "previousStatement": "head_element"
});
  }
};

javascriptGenerator.forBlock['style_tag'] = function(block) {
  let code = `<style>\n{CSS}\n</style>\n`;
  if (block.getInput('CSS')) {
    code = code.replace('{CSS}', javascriptGenerator.statementToCode(block, 'CSS'));
  } else {
    code = code.replace('{CSS}', block.getFieldValue('CSS') || '');
  }
  return code;
};


Blockly.Blocks['css_transform'] = {
  init: function() {
    this.jsonInit({
      "type": "css_transform",
      "args0": [
            {
                  "name": "VALUE",
                  "text": "rotate(45deg)",
                  "type": "field_input"
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "CSS transform",
      "message0": "Transform %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_transform'] = function(block) {
  let code = `  transform: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['meta_name'] = {
  init: function() {
    this.jsonInit({
      "type": "meta_name",
      "args0": [
            {
                  "name": "NAME",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "description",
                              "description"
                        ],
                        [
                              "keywords",
                              "keywords"
                        ],
                        [
                              "author",
                              "author"
                        ],
                        [
                              "viewport",
                              "viewport"
                        ],
                        [
                              "robots",
                              "robots"
                        ],
                        [
                              "theme-color",
                              "theme-color"
                        ],
                        [
                              "application-name",
                              "application-name"
                        ],
                        [
                              "generator",
                              "generator"
                        ]
                  ]
            },
            {
                  "name": "CONTENT",
                  "text": "meta content",
                  "type": "field_input"
            }
      ],
      "colour": "#A7C1E8",
      "helpUrl": "https://www.w3schools.com/tags/tag_meta.asp",
      "tooltip": "Defines metadata such as description, keywords, author, viewport, etc.",
      "message0": "meta    name %1   content %2",
      "nextStatement": "head_element",
      "previousStatement": "head_element"
});
  }
};

javascriptGenerator.forBlock['meta_name'] = function(block) {
  let code = `<meta name="{NAME}" content="{CONTENT}">\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['textarea'] = {
  init: function() {
    this.jsonInit({
      "type": "textarea",
      "args0": [
            {
                  "name": "NAME",
                  "text": "message",
                  "type": "field_input"
            },
            {
                  "name": "ROWS",
                  "type": "field_number",
                  "value": 4
            },
            {
                  "name": "COLS",
                  "type": "field_number",
                  "value": 50
            },
            {
                  "name": "PLACEHOLDER",
                  "text": "Enter text",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Multi-line text input",
      "message0": "Text Area %1 Rows %2 Cols %3 Placeholder %4",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['textarea'] = function(block) {
  let code = `<textarea name="{NAME}" rows="{ROWS}" cols="{COLS}" placeholder="{PLACEHOLDER}"></textarea>\n`;
  if (block.getInput('COLS')) {
    code = code.replace('{COLS}', javascriptGenerator.statementToCode(block, 'COLS'));
  } else {
    code = code.replace('{COLS}', block.getFieldValue('COLS') || '');
  }
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('ROWS')) {
    code = code.replace('{ROWS}', javascriptGenerator.statementToCode(block, 'ROWS'));
  } else {
    code = code.replace('{ROWS}', block.getFieldValue('ROWS') || '');
  }
  if (block.getInput('PLACEHOLDER')) {
    code = code.replace('{PLACEHOLDER}', javascriptGenerator.statementToCode(block, 'PLACEHOLDER'));
  } else {
    code = code.replace('{PLACEHOLDER}', block.getFieldValue('PLACEHOLDER') || '');
  }
  return code;
};


Blockly.Blocks['css_opacity'] = {
  init: function() {
    this.jsonInit({
      "type": "css_opacity",
      "args0": [
            {
                  "max": 1,
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 1,
                  "precision": 0.1
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "Opacity (0-1)",
      "message0": "Opacity %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_opacity'] = function(block) {
  let code = `  opacity: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_font_weight'] = {
  init: function() {
    this.jsonInit({
      "type": "css_font_weight",
      "args0": [
            {
                  "name": "WEIGHT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Normal",
                              "normal"
                        ],
                        [
                              "Bold",
                              "bold"
                        ],
                        [
                              "Lighter",
                              "lighter"
                        ],
                        [
                              "Bolder",
                              "bolder"
                        ],
                        [
                              "100",
                              "100"
                        ],
                        [
                              "400",
                              "400"
                        ],
                        [
                              "700",
                              "700"
                        ],
                        [
                              "900",
                              "900"
                        ]
                  ]
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Font weight",
      "message0": "Font Weight %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_font_weight'] = function(block) {
  let code = `  font-weight: {WEIGHT};\n`;
  if (block.getInput('WEIGHT')) {
    code = code.replace('{WEIGHT}', javascriptGenerator.statementToCode(block, 'WEIGHT'));
  } else {
    code = code.replace('{WEIGHT}', block.getFieldValue('WEIGHT') || '');
  }
  return code;
};


Blockly.Blocks['header'] = {
  init: function() {
    this.jsonInit({
      "type": "header",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Header section",
      "message0": "Header container \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['header'] = function(block) {
  let code = `<header>\n{CONTENT}\n</header>\n`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['css_overflow'] = {
  init: function() {
    this.jsonInit({
      "type": "css_overflow",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Visible",
                              "visible"
                        ],
                        [
                              "Hidden",
                              "hidden"
                        ],
                        [
                              "Scroll",
                              "scroll"
                        ],
                        [
                              "Auto",
                              "auto"
                        ]
                  ]
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "Overflow behavior",
      "message0": "Overflow %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_overflow'] = function(block) {
  let code = `  overflow: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_margin'] = {
  init: function() {
    this.jsonInit({
      "type": "css_margin",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 10
            },
            {
                  "name": "UNIT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "px",
                              "px"
                        ],
                        [
                              "em",
                              "em"
                        ],
                        [
                              "rem",
                              "rem"
                        ],
                        [
                              "%",
                              "%"
                        ]
                  ]
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Margin (all sides)",
      "message0": "Margin %1 %2",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_margin'] = function(block) {
  let code = `  margin: {VALUE}{UNIT};\n`;
  if (block.getInput('UNIT')) {
    code = code.replace('{UNIT}', javascriptGenerator.statementToCode(block, 'UNIT'));
  } else {
    code = code.replace('{UNIT}', block.getFieldValue('UNIT') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['radio'] = {
  init: function() {
    this.jsonInit({
      "type": "radio",
      "args0": [
            {
                  "name": "NAME",
                  "text": "choice",
                  "type": "field_input"
            },
            {
                  "name": "VALUE",
                  "text": "option1",
                  "type": "field_input"
            },
            {
                  "name": "CHECKED",
                  "type": "field_checkbox",
                  "checked": false
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Radio button",
      "message0": "Radio %1 Value %2 %3 Checked",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['radio'] = function(block) {
  let code = `<input type="radio" name="{NAME}" value="{VALUE}" {CHECKED_ATTR}>\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  if (block.getInput('CHECKED_ATTR')) {
    code = code.replace('{CHECKED_ATTR}', javascriptGenerator.statementToCode(block, 'CHECKED_ATTR'));
  } else {
    code = code.replace('{CHECKED_ATTR}', block.getFieldValue('CHECKED_ATTR') || '');
  }
  return code;
};


Blockly.Blocks['line_break'] = {
  init: function() {
    this.jsonInit({
      "type": "line_break",
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Line break",
      "message0": "Line Break",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['line_break'] = function(block) {
  let code = `<br>\n`;
  return code;
};


Blockly.Blocks['css_gap'] = {
  init: function() {
    this.jsonInit({
      "type": "css_gap",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 10
            }
      ],
      "colour": "#8e44ad",
      "helpUrl": "",
      "tooltip": "Gap between items",
      "message0": "Gap %1 px",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_gap'] = function(block) {
  let code = `  gap: {VALUE}px;\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_align_items'] = {
  init: function() {
    this.jsonInit({
      "type": "css_align_items",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Flex Start",
                              "flex-start"
                        ],
                        [
                              "Flex End",
                              "flex-end"
                        ],
                        [
                              "Center",
                              "center"
                        ],
                        [
                              "Stretch",
                              "stretch"
                        ],
                        [
                              "Baseline",
                              "baseline"
                        ]
                  ]
            }
      ],
      "colour": "#8e44ad",
      "helpUrl": "",
      "tooltip": "Align items",
      "message0": "Align Items %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_align_items'] = function(block) {
  let code = `  align-items: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_flex_direction'] = {
  init: function() {
    this.jsonInit({
      "type": "css_flex_direction",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Row",
                              "row"
                        ],
                        [
                              "Column",
                              "column"
                        ],
                        [
                              "Row Reverse",
                              "row-reverse"
                        ],
                        [
                              "Column Reverse",
                              "column-reverse"
                        ]
                  ]
            }
      ],
      "colour": "#8e44ad",
      "helpUrl": "",
      "tooltip": "Flex direction",
      "message0": "Flex Direction %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_flex_direction'] = function(block) {
  let code = `  flex-direction: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['table_row'] = {
  init: function() {
    this.jsonInit({
      "type": "table_row",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#9b59b6",
      "helpUrl": "",
      "tooltip": "Table row",
      "message0": "Table row \n %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['table_row'] = function(block) {
  let code = `<tr>\n{CONTENT}\n</tr>\n`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['input_password'] = {
  init: function() {
    this.jsonInit({
      "type": "input_password",
      "args0": [
            {
                  "name": "NAME",
                  "text": "password",
                  "type": "field_input"
            },
            {
                  "name": "PLACEHOLDER",
                  "text": "Enter password",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Password input field",
      "message0": "Password Input %1 Placeholder %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['input_password'] = function(block) {
  let code = `<input type="password" name="{NAME}" placeholder="{PLACEHOLDER}">\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('PLACEHOLDER')) {
    code = code.replace('{PLACEHOLDER}', javascriptGenerator.statementToCode(block, 'PLACEHOLDER'));
  } else {
    code = code.replace('{PLACEHOLDER}', block.getFieldValue('PLACEHOLDER') || '');
  }
  return code;
};


Blockly.Blocks['table'] = {
  init: function() {
    this.jsonInit({
      "type": "table",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#9b59b6",
      "helpUrl": "",
      "tooltip": "Table element",
      "message0": "<table> \n %1 </table>",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['table'] = function(block) {
  let code = `<table>\n{CONTENT}\n</table>\n`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['css_width'] = {
  init: function() {
    this.jsonInit({
      "type": "css_width",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 100
            },
            {
                  "name": "UNIT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "px",
                              "px"
                        ],
                        [
                              "%",
                              "%"
                        ],
                        [
                              "em",
                              "em"
                        ],
                        [
                              "rem",
                              "rem"
                        ],
                        [
                              "vw",
                              "vw"
                        ]
                  ]
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Width",
      "message0": "Width %1 %2",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_width'] = function(block) {
  let code = `  width: {VALUE}{UNIT};\n`;
  if (block.getInput('UNIT')) {
    code = code.replace('{UNIT}', javascriptGenerator.statementToCode(block, 'UNIT'));
  } else {
    code = code.replace('{UNIT}', block.getFieldValue('UNIT') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_line_height'] = {
  init: function() {
    this.jsonInit({
      "type": "css_line_height",
      "args0": [
            {
                  "min": 0,
                  "name": "HEIGHT",
                  "type": "field_number",
                  "value": 1.5,
                  "precision": 0.1
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Line height",
      "message0": "Line Height %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_line_height'] = function(block) {
  let code = `  line-height: {HEIGHT};\n`;
  if (block.getInput('HEIGHT')) {
    code = code.replace('{HEIGHT}', javascriptGenerator.statementToCode(block, 'HEIGHT'));
  } else {
    code = code.replace('{HEIGHT}', block.getFieldValue('HEIGHT') || '');
  }
  return code;
};


Blockly.Blocks['heading'] = {
  init: function() {
    this.jsonInit({
      "type": "heading",
      "args0": [
            {
                  "name": "LEVEL",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "H1",
                              "h1"
                        ],
                        [
                              "H2",
                              "h2"
                        ],
                        [
                              "H3",
                              "h3"
                        ],
                        [
                              "H4",
                              "h4"
                        ],
                        [
                              "H5",
                              "h5"
                        ],
                        [
                              "H6",
                              "h6"
                        ]
                  ]
            },
            {
                  "name": "TEXT",
                  "text": "Heading",
                  "type": "field_input"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Heading element",
      "message0": "Heading %1 %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['heading'] = function(block) {
  let code = `<{LEVEL}>{TEXT}</{LEVEL}>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  if (block.getInput('LEVEL')) {
    code = code.replace('{LEVEL}', javascriptGenerator.statementToCode(block, 'LEVEL'));
  } else {
    code = code.replace('{LEVEL}', block.getFieldValue('LEVEL') || '');
  }
  return code;
};


Blockly.Blocks['section'] = {
  init: function() {
    this.jsonInit({
      "type": "section",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Semantic section",
      "message0": "Section container \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['section'] = function(block) {
  let code = `<section>\n{CONTENT}\n</section>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['css_color'] = {
  init: function() {
    this.jsonInit({
      "type": "css_color",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_colour",
                  "colour": "#000000"
            }
      ],
      "colour": "#e74c3c",
      "helpUrl": "",
      "tooltip": "Text color",
      "message0": "text color : %1;",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_color'] = function(block) {
  let code = `  color: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_transition'] = {
  init: function() {
    this.jsonInit({
      "type": "css_transition",
      "args0": [
            {
                  "name": "PROPERTY",
                  "text": "all",
                  "type": "field_input"
            },
            {
                  "min": 0,
                  "name": "DURATION",
                  "type": "field_number",
                  "value": 0.3,
                  "precision": 0.1
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "CSS transition",
      "message0": "Transition %1 %2 s",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_transition'] = function(block) {
  let code = `  transition: {PROPERTY} {DURATION}s;\n`;
  if (block.getInput('DURATION')) {
    code = code.replace('{DURATION}', javascriptGenerator.statementToCode(block, 'DURATION'));
  } else {
    code = code.replace('{DURATION}', block.getFieldValue('DURATION') || '');
  }
  if (block.getInput('PROPERTY')) {
    code = code.replace('{PROPERTY}', javascriptGenerator.statementToCode(block, 'PROPERTY'));
  } else {
    code = code.replace('{PROPERTY}', block.getFieldValue('PROPERTY') || '');
  }
  return code;
};


Blockly.Blocks['css_border'] = {
  init: function() {
    this.jsonInit({
      "type": "css_border",
      "args0": [
            {
                  "min": 0,
                  "name": "WIDTH",
                  "type": "field_number",
                  "value": 1
            },
            {
                  "name": "STYLE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Solid",
                              "solid"
                        ],
                        [
                              "Dashed",
                              "dashed"
                        ],
                        [
                              "Dotted",
                              "dotted"
                        ],
                        [
                              "Double",
                              "double"
                        ],
                        [
                              "None",
                              "none"
                        ]
                  ]
            },
            {
                  "name": "COLOR",
                  "type": "field_colour",
                  "colour": "#000000"
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Border",
      "message0": "Border %1 px %2 %3",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_border'] = function(block) {
  let code = `  border: {WIDTH}px {STYLE} {COLOR};\n`;
  if (block.getInput('STYLE')) {
    code = code.replace('{STYLE}', javascriptGenerator.statementToCode(block, 'STYLE'));
  } else {
    code = code.replace('{STYLE}', block.getFieldValue('STYLE') || '');
  }
  if (block.getInput('WIDTH')) {
    code = code.replace('{WIDTH}', javascriptGenerator.statementToCode(block, 'WIDTH'));
  } else {
    code = code.replace('{WIDTH}', block.getFieldValue('WIDTH') || '');
  }
  if (block.getInput('COLOR')) {
    code = code.replace('{COLOR}', javascriptGenerator.statementToCode(block, 'COLOR'));
  } else {
    code = code.replace('{COLOR}', block.getFieldValue('COLOR') || '');
  }
  return code;
};


Blockly.Blocks['css_font_size'] = {
  init: function() {
    this.jsonInit({
      "type": "css_font_size",
      "args0": [
            {
                  "min": 1,
                  "name": "SIZE",
                  "type": "field_number",
                  "value": 16
            },
            {
                  "name": "UNIT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "px",
                              "px"
                        ],
                        [
                              "em",
                              "em"
                        ],
                        [
                              "rem",
                              "rem"
                        ],
                        [
                              "%",
                              "%"
                        ]
                  ]
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Font size",
      "message0": "Font Size %1 %2",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_font_size'] = function(block) {
  let code = `  font-size: {SIZE}{UNIT};\n`;
  if (block.getInput('SIZE')) {
    code = code.replace('{SIZE}', javascriptGenerator.statementToCode(block, 'SIZE'));
  } else {
    code = code.replace('{SIZE}', block.getFieldValue('SIZE') || '');
  }
  if (block.getInput('UNIT')) {
    code = code.replace('{UNIT}', javascriptGenerator.statementToCode(block, 'UNIT'));
  } else {
    code = code.replace('{UNIT}', block.getFieldValue('UNIT') || '');
  }
  return code;
};


Blockly.Blocks['link'] = {
  init: function() {
    this.jsonInit({
      "type": "link",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Click here",
                  "type": "field_input"
            },
            {
                  "name": "URL",
                  "text": "https://example.com",
                  "type": "field_input"
            }
      ],
      "colour": "#4a90e2",
      "helpUrl": "",
      "tooltip": "Hyperlink",
      "message0": "Link %1 URL %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['link'] = function(block) {
  let code = `<a href="{URL}">{TEXT}</a>\n`;
  if (block.getInput('URL')) {
    code = code.replace('{URL}', javascriptGenerator.statementToCode(block, 'URL'));
  } else {
    code = code.replace('{URL}', block.getFieldValue('URL') || '');
  }
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['css_border_color'] = {
  init: function() {
    this.jsonInit({
      "type": "css_border_color",
      "args0": [
            {
                  "name": "COLOR",
                  "type": "field_colour",
                  "colour": "#000000"
            }
      ],
      "colour": "#e74c3c",
      "helpUrl": "",
      "tooltip": "Border color",
      "message0": "Border Color %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_border_color'] = function(block) {
  let code = `  border-color: {COLOR};\n`;
  if (block.getInput('COLOR')) {
    code = code.replace('{COLOR}', javascriptGenerator.statementToCode(block, 'COLOR'));
  } else {
    code = code.replace('{COLOR}', block.getFieldValue('COLOR') || '');
  }
  return code;
};


Blockly.Blocks['meta_http_equiv'] = {
  init: function() {
    this.jsonInit({
      "type": "meta_http_equiv",
      "args0": [
            {
                  "name": "HTTP_EQUIV",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "content-security-policy",
                              "content-security-policy"
                        ],
                        [
                              "content-type",
                              "content-type"
                        ],
                        [
                              "default-style",
                              "default-style"
                        ],
                        [
                              "refresh",
                              "refresh"
                        ]
                  ]
            },
            {
                  "name": "CONTENT",
                  "text": "value",
                  "type": "field_input"
            }
      ],
      "colour": "#A7C1E8",
      "helpUrl": "https://www.w3schools.com/tags/tag_meta.asp",
      "tooltip": "Simulates HTTP headers like refresh, content-type, CSP, etc.",
      "message0": "meta   http-equiv %1 content %2",
      "nextStatement": "head_element",
      "previousStatement": "head_element"
});
  }
};

javascriptGenerator.forBlock['meta_http_equiv'] = function(block) {
  let code = `<meta http-equiv="{HTTP_EQUIV}" content="{CONTENT}">`;
  if (block.getInput('HTTP_EQUIV')) {
    code = code.replace('{HTTP_EQUIV}', javascriptGenerator.statementToCode(block, 'HTTP_EQUIV'));
  } else {
    code = code.replace('{HTTP_EQUIV}', block.getFieldValue('HTTP_EQUIV') || '');
  }
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['ordered_list'] = {
  init: function() {
    this.jsonInit({
      "type": "ordered_list",
      "args0": [
            {
                  "name": "ITEMS",
                  "type": "input_statement",
                  "check": "list_item"
            }
      ],
      "colour": "#ff6b6b",
      "helpUrl": "",
      "tooltip": "Numbered list",
      "message0": "Ordered List \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['ordered_list'] = function(block) {
  let code = `<ol>\n{ITEMS}\n</ol>\n`;
  if (block.getInput('ITEMS')) {
    code = code.replace('{ITEMS}', javascriptGenerator.statementToCode(block, 'ITEMS'));
  } else {
    code = code.replace('{ITEMS}', block.getFieldValue('ITEMS') || '');
  }
  return code;
};


Blockly.Blocks['css_text_decoration'] = {
  init: function() {
    this.jsonInit({
      "type": "css_text_decoration",
      "args0": [
            {
                  "name": "DECORATION",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "None",
                              "none"
                        ],
                        [
                              "Underline",
                              "underline"
                        ],
                        [
                              "Overline",
                              "overline"
                        ],
                        [
                              "Line Through",
                              "line-through"
                        ]
                  ]
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Text decoration",
      "message0": "Text Decoration %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_text_decoration'] = function(block) {
  let code = `  text-decoration: {DECORATION};\n`;
  if (block.getInput('DECORATION')) {
    code = code.replace('{DECORATION}', javascriptGenerator.statementToCode(block, 'DECORATION'));
  } else {
    code = code.replace('{DECORATION}', block.getFieldValue('DECORATION') || '');
  }
  return code;
};


Blockly.Blocks['article'] = {
  init: function() {
    this.jsonInit({
      "type": "article",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Article container",
      "message0": "Article \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['article'] = function(block) {
  let code = `<article>\n{CONTENT}\n</article>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['footer'] = {
  init: function() {
    this.jsonInit({
      "type": "footer",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Footer section",
      "message0": "Footer container\n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['footer'] = function(block) {
  let code = `<footer>\n{CONTENT}\n</footer>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['html_new_field'] = {
  init: function() {
    this.jsonInit({
      "type": "html_new_field",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "default",
                  "type": "input_statement"
            }
      ],
      "colour": "#3b82f6",
      "helpUrl": "",
      "tooltip": "A new block",
      "message0": "My new block \n%1",
      "nextStatement": null,
      "previousStatement": null
});
  }
};

javascriptGenerator.forBlock['html_new_field'] = function(block) {
  let code = `<div>\n{TEXT}\n</div>`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['table_header'] = {
  init: function() {
    this.jsonInit({
      "type": "table_header",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Header",
                  "type": "field_input"
            }
      ],
      "colour": "#9b59b6",
      "helpUrl": "",
      "tooltip": "Table header cell",
      "message0": "Table header cell %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['table_header'] = function(block) {
  let code = `<th>{TEXT}</th>`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['css_cursor'] = {
  init: function() {
    this.jsonInit({
      "type": "css_cursor",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Default",
                              "default"
                        ],
                        [
                              "Pointer",
                              "pointer"
                        ],
                        [
                              "Move",
                              "move"
                        ],
                        [
                              "Text",
                              "text"
                        ],
                        [
                              "Wait",
                              "wait"
                        ],
                        [
                              "Help",
                              "help"
                        ],
                        [
                              "Not Allowed",
                              "not-allowed"
                        ]
                  ]
            }
      ],
      "colour": "#16a085",
      "helpUrl": "",
      "tooltip": "Cursor style",
      "message0": "Cursor %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_cursor'] = function(block) {
  let code = `  cursor: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['iframe'] = {
  init: function() {
    this.jsonInit({
      "type": "iframe",
      "args0": [
            {
                  "name": "SRC",
                  "text": "https://example.com",
                  "type": "field_input"
            },
            {
                  "name": "WIDTH",
                  "text": "600",
                  "type": "field_input"
            },
            {
                  "name": "HEIGHT",
                  "text": "400",
                  "type": "field_input"
            }
      ],
      "colour": "#ff8c00",
      "helpUrl": "",
      "tooltip": "Embedded frame",
      "message0": "iFrame %1 Width %2 Height %3",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['iframe'] = function(block) {
  let code = `<iframe src="{SRC}" width="{WIDTH}" height="{HEIGHT}"></iframe>\n`;
  if (block.getInput('WIDTH')) {
    code = code.replace('{WIDTH}', javascriptGenerator.statementToCode(block, 'WIDTH'));
  } else {
    code = code.replace('{WIDTH}', block.getFieldValue('WIDTH') || '');
  }
  if (block.getInput('HEIGHT')) {
    code = code.replace('{HEIGHT}', javascriptGenerator.statementToCode(block, 'HEIGHT'));
  } else {
    code = code.replace('{HEIGHT}', block.getFieldValue('HEIGHT') || '');
  }
  if (block.getInput('SRC')) {
    code = code.replace('{SRC}', javascriptGenerator.statementToCode(block, 'SRC'));
  } else {
    code = code.replace('{SRC}', block.getFieldValue('SRC') || '');
  }
  return code;
};


Blockly.Blocks['label'] = {
  init: function() {
    this.jsonInit({
      "type": "label",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Label:",
                  "type": "field_input"
            },
            {
                  "name": "FOR",
                  "text": "input_id",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Label for form field",
      "message0": "Label %1 For %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['label'] = function(block) {
  let code = `<label for="{FOR}">{TEXT}</label>\n`;
  if (block.getInput('FOR')) {
    code = code.replace('{FOR}', javascriptGenerator.statementToCode(block, 'FOR'));
  } else {
    code = code.replace('{FOR}', block.getFieldValue('FOR') || '');
  }
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['css_text_align'] = {
  init: function() {
    this.jsonInit({
      "type": "css_text_align",
      "args0": [
            {
                  "name": "ALIGN",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Left",
                              "left"
                        ],
                        [
                              "Center",
                              "center"
                        ],
                        [
                              "Right",
                              "right"
                        ],
                        [
                              "Justify",
                              "justify"
                        ]
                  ]
            }
      ],
      "colour": "#3498db",
      "helpUrl": "",
      "tooltip": "Text alignment",
      "message0": "Text Align %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_text_align'] = function(block) {
  let code = `  text-align: {ALIGN};\n`;
  if (block.getInput('ALIGN')) {
    code = code.replace('{ALIGN}', javascriptGenerator.statementToCode(block, 'ALIGN'));
  } else {
    code = code.replace('{ALIGN}', block.getFieldValue('ALIGN') || '');
  }
  return code;
};


Blockly.Blocks['html_boilerplate'] = {
  init: function() {
    this.jsonInit({
      "type": "html_boilerplate",
      "args0": [
            {
                  "name": "html_boilerplate",
                  "type": "input_dummy"
            },
            {
                  "name": "HEAD",
                  "type": "input_statement",
                  "check": "head_element"
            },
            {
                  "type": "input_dummy"
            },
            {
                  "name": "BODY",
                  "type": "input_statement",
                  "check": "body_element"
            }
      ],
      "colour": "#f16529",
      "helpUrl": "",
      "tooltip": "Creates a complete HTML page structur",
      "message0": "HTML Boilerplate \n head elements%1 %2 body elements %3 %4"
});
  }
};

javascriptGenerator.forBlock['html_boilerplate'] = function(block) {
  let code = `<!DOCTYPE html>\n<html lang="en">\n<head>\n{HEAD}\n</head>\n<body>\n{BODY}\n</body>\n</html>`;
  if (block.getInput('HEAD')) {
    code = code.replace('{HEAD}', javascriptGenerator.statementToCode(block, 'HEAD'));
  } else {
    code = code.replace('{HEAD}', block.getFieldValue('HEAD') || '');
  }
  if (block.getInput('BODY')) {
    code = code.replace('{BODY}', javascriptGenerator.statementToCode(block, 'BODY'));
  } else {
    code = code.replace('{BODY}', block.getFieldValue('BODY') || '');
  }
  return code;
};


Blockly.Blocks['list_item'] = {
  init: function() {
    this.jsonInit({
      "type": "list_item",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Item",
                  "type": "field_input"
            }
      ],
      "colour": "#ff6b6b",
      "helpUrl": "",
      "tooltip": "List item",
      "message0": "List Item %1",
      "nextStatement": "list_item",
      "previousStatement": "list_item"
});
  }
};

javascriptGenerator.forBlock['list_item'] = function(block) {
  let code = `<li>{TEXT}</li>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['table_data'] = {
  init: function() {
    this.jsonInit({
      "type": "table_data",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Data",
                  "type": "field_input"
            }
      ],
      "colour": "#9b59b6",
      "helpUrl": "",
      "tooltip": "Table data cell",
      "message0": "Table data %1",
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['table_data'] = function(block) {
  let code = `<td>{TEXT}</td>`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['css_height'] = {
  init: function() {
    this.jsonInit({
      "type": "css_height",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 100
            },
            {
                  "name": "UNIT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "px",
                              "px"
                        ],
                        [
                              "%",
                              "%"
                        ],
                        [
                              "em",
                              "em"
                        ],
                        [
                              "rem",
                              "rem"
                        ],
                        [
                              "vh",
                              "vh"
                        ]
                  ]
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Height",
      "message0": "Height %1 %2",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_height'] = function(block) {
  let code = `  height: {VALUE}{UNIT};\n`;
  if (block.getInput('UNIT')) {
    code = code.replace('{UNIT}', javascriptGenerator.statementToCode(block, 'UNIT'));
  } else {
    code = code.replace('{UNIT}', block.getFieldValue('UNIT') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['css_padding'] = {
  init: function() {
    this.jsonInit({
      "type": "css_padding",
      "args0": [
            {
                  "min": 0,
                  "name": "VALUE",
                  "type": "field_number",
                  "value": 10
            },
            {
                  "name": "UNIT",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "px",
                              "px"
                        ],
                        [
                              "em",
                              "em"
                        ],
                        [
                              "rem",
                              "rem"
                        ],
                        [
                              "%",
                              "%"
                        ]
                  ]
            }
      ],
      "colour": "#2ecc71",
      "helpUrl": "",
      "tooltip": "Padding (all sides)",
      "message0": "Padding %1 %2",
      "inputsInline": true,
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_padding'] = function(block) {
  let code = `  padding: {VALUE}{UNIT};\n`;
  if (block.getInput('UNIT')) {
    code = code.replace('{UNIT}', javascriptGenerator.statementToCode(block, 'UNIT'));
  } else {
    code = code.replace('{UNIT}', block.getFieldValue('UNIT') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['nav'] = {
  init: function() {
    this.jsonInit({
      "type": "nav",
      "args0": [
            {
                  "name": "CONTENT",
                  "type": "input_statement"
            }
      ],
      "colour": "#7b68ee",
      "helpUrl": "",
      "tooltip": "Navigation container",
      "message0": "Navigation container \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['nav'] = function(block) {
  let code = `<nav>\n{CONTENT}\n</nav>`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['video'] = {
  init: function() {
    this.jsonInit({
      "type": "video",
      "args0": [
            {
                  "name": "SRC",
                  "text": "video.mp4",
                  "type": "field_input"
            },
            {
                  "name": "WIDTH",
                  "text": "640",
                  "type": "field_input"
            },
            {
                  "name": "HEIGHT",
                  "text": "360",
                  "type": "field_input"
            },
            {
                  "name": "CONTROLS",
                  "type": "field_checkbox",
                  "checked": true
            }
      ],
      "colour": "#ff8c00",
      "helpUrl": "",
      "tooltip": "Video element",
      "message0": "Video %1 Width %2 Height %3 %4 Controls",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['video'] = function(block) {
  let code = `<video src="{SRC}" width="{WIDTH}" height="{HEIGHT}" {CONTROLS_ATTR}></video>\n`;
  if (block.getInput('WIDTH')) {
    code = code.replace('{WIDTH}', javascriptGenerator.statementToCode(block, 'WIDTH'));
  } else {
    code = code.replace('{WIDTH}', block.getFieldValue('WIDTH') || '');
  }
  if (block.getInput('HEIGHT')) {
    code = code.replace('{HEIGHT}', javascriptGenerator.statementToCode(block, 'HEIGHT'));
  } else {
    code = code.replace('{HEIGHT}', block.getFieldValue('HEIGHT') || '');
  }
  if (block.getInput('SRC')) {
    code = code.replace('{SRC}', javascriptGenerator.statementToCode(block, 'SRC'));
  } else {
    code = code.replace('{SRC}', block.getFieldValue('SRC') || '');
  }
  if (block.getInput('CONTROLS_ATTR')) {
    code = code.replace('{CONTROLS_ATTR}', javascriptGenerator.statementToCode(block, 'CONTROLS_ATTR'));
  } else {
    code = code.replace('{CONTROLS_ATTR}', block.getFieldValue('CONTROLS_ATTR') || '');
  }
  return code;
};


Blockly.Blocks['input_number'] = {
  init: function() {
    this.jsonInit({
      "type": "input_number",
      "args0": [
            {
                  "name": "NAME",
                  "text": "quantity",
                  "type": "field_input"
            },
            {
                  "name": "MIN",
                  "type": "field_number",
                  "value": 0
            },
            {
                  "name": "MAX",
                  "type": "field_number",
                  "value": 100
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Number input field",
      "message0": "Number Input %1 Min %2 Max %3",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['input_number'] = function(block) {
  let code = `<input type="number" name="{NAME}" min="{MIN}" max="{MAX}">\n`;
  if (block.getInput('MIN')) {
    code = code.replace('{MIN}', javascriptGenerator.statementToCode(block, 'MIN'));
  } else {
    code = code.replace('{MIN}', block.getFieldValue('MIN') || '');
  }
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('MAX')) {
    code = code.replace('{MAX}', javascriptGenerator.statementToCode(block, 'MAX'));
  } else {
    code = code.replace('{MAX}', block.getFieldValue('MAX') || '');
  }
  return code;
};


Blockly.Blocks['input_text'] = {
  init: function() {
    this.jsonInit({
      "type": "input_text",
      "args0": [
            {
                  "name": "NAME",
                  "text": "username",
                  "type": "field_input"
            },
            {
                  "name": "PLACEHOLDER",
                  "text": "Enter text",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Text input field",
      "message0": "Text Input %1 Placeholder %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['input_text'] = function(block) {
  let code = `<input type="text" name="{NAME}" placeholder="{PLACEHOLDER}">\n`;
  if (block.getInput('NAME')) {
    code = code.replace('{NAME}', javascriptGenerator.statementToCode(block, 'NAME'));
  } else {
    code = code.replace('{NAME}', block.getFieldValue('NAME') || '');
  }
  if (block.getInput('PLACEHOLDER')) {
    code = code.replace('{PLACEHOLDER}', javascriptGenerator.statementToCode(block, 'PLACEHOLDER'));
  } else {
    code = code.replace('{PLACEHOLDER}', block.getFieldValue('PLACEHOLDER') || '');
  }
  return code;
};


Blockly.Blocks['option'] = {
  init: function() {
    this.jsonInit({
      "type": "option",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Option",
                  "type": "field_input"
            },
            {
                  "name": "VALUE",
                  "text": "value",
                  "type": "field_input"
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Select option",
      "message0": "Option %1 Value %2",
      "nextStatement": "list_item",
      "previousStatement": "list_item"
});
  }
};

javascriptGenerator.forBlock['option'] = function(block) {
  let code = `<option value="{VALUE}">{TEXT}</option>\n`;
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['button'] = {
  init: function() {
    this.jsonInit({
      "type": "button",
      "args0": [
            {
                  "name": "TEXT",
                  "text": "Click Me",
                  "type": "field_input"
            },
            {
                  "name": "TYPE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Button",
                              "button"
                        ],
                        [
                              "Submit",
                              "submit"
                        ],
                        [
                              "Reset",
                              "reset"
                        ]
                  ]
            }
      ],
      "colour": "#20b2aa",
      "helpUrl": "",
      "tooltip": "Button element",
      "message0": "Button %1 Type %2",
      "inputsInline": true,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['button'] = function(block) {
  let code = `<button type="{TYPE}">{TEXT}</button>\n`;
  if (block.getInput('TYPE')) {
    code = code.replace('{TYPE}', javascriptGenerator.statementToCode(block, 'TYPE'));
  } else {
    code = code.replace('{TYPE}', block.getFieldValue('TYPE') || '');
  }
  if (block.getInput('TEXT')) {
    code = code.replace('{TEXT}', javascriptGenerator.statementToCode(block, 'TEXT'));
  } else {
    code = code.replace('{TEXT}', block.getFieldValue('TEXT') || '');
  }
  return code;
};


Blockly.Blocks['head'] = {
  init: function() {
    this.jsonInit({
      "type": "head",
      "args0": [
            {
                  "type": "input_dummy"
            },
            {
                  "name": "head_element",
                  "type": "input_statement",
                  "check": "head_element"
            }
      ],
      "colour": "#f16529",
      "helpUrl": "",
      "tooltip": "Define page meta, title, styles, scripts etc.",
      "message0": "<head>%1%2</head>",
      "previousStatement": "HEAD"
});
  }
};

javascriptGenerator.forBlock['head'] = function(block) {
  let code = `<head>\n{CONTENT}\n</head>\n`;
  if (block.getInput('CONTENT')) {
    code = code.replace('{CONTENT}', javascriptGenerator.statementToCode(block, 'CONTENT'));
  } else {
    code = code.replace('{CONTENT}', block.getFieldValue('CONTENT') || '');
  }
  return code;
};


Blockly.Blocks['css_display'] = {
  init: function() {
    this.jsonInit({
      "type": "css_display",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Block",
                              "block"
                        ],
                        [
                              "Inline",
                              "inline"
                        ],
                        [
                              "Inline-Block",
                              "inline-block"
                        ],
                        [
                              "Flex",
                              "flex"
                        ],
                        [
                              "Grid",
                              "grid"
                        ],
                        [
                              "None",
                              "none"
                        ]
                  ]
            }
      ],
      "colour": "#f39c12",
      "helpUrl": "",
      "tooltip": "Display type",
      "message0": "Display %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_display'] = function(block) {
  let code = `  display: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


Blockly.Blocks['unordered_list'] = {
  init: function() {
    this.jsonInit({
      "type": "unordered_list",
      "args0": [
            {
                  "name": "ITEMS",
                  "type": "input_statement",
                  "check": "list_item"
            }
      ],
      "colour": "#ff6b6b",
      "helpUrl": "",
      "tooltip": "Bulleted list",
      "message0": "Unordered List \n %1",
      "inputsInline": false,
      "nextStatement": "body_element",
      "previousStatement": "body_element"
});
  }
};

javascriptGenerator.forBlock['unordered_list'] = function(block) {
  let code = `<ul>\n{ITEMS}\n</ul>`;
  if (block.getInput('ITEMS')) {
    code = code.replace('{ITEMS}', javascriptGenerator.statementToCode(block, 'ITEMS'));
  } else {
    code = code.replace('{ITEMS}', block.getFieldValue('ITEMS') || '');
  }
  return code;
};


Blockly.Blocks['css_position'] = {
  init: function() {
    this.jsonInit({
      "type": "css_position",
      "args0": [
            {
                  "name": "VALUE",
                  "type": "field_dropdown",
                  "options": [
                        [
                              "Static",
                              "static"
                        ],
                        [
                              "Relative",
                              "relative"
                        ],
                        [
                              "Absolute",
                              "absolute"
                        ],
                        [
                              "Fixed",
                              "fixed"
                        ],
                        [
                              "Sticky",
                              "sticky"
                        ]
                  ]
            }
      ],
      "colour": "#f39c12",
      "helpUrl": "",
      "tooltip": "Position type",
      "message0": "Position %1",
      "nextStatement": "css_property",
      "previousStatement": "css_property"
});
  }
};

javascriptGenerator.forBlock['css_position'] = function(block) {
  let code = `  position: {VALUE};\n`;
  if (block.getInput('VALUE')) {
    code = code.replace('{VALUE}', javascriptGenerator.statementToCode(block, 'VALUE'));
  } else {
    code = code.replace('{VALUE}', block.getFieldValue('VALUE') || '');
  }
  return code;
};


// MANUAL APPEND-STYLE BLOCKLY DEFINITIONS
// ========================================

Blockly.Blocks['paragraph'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Paragraph %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Paragraph element");
  }
};

Blockly.Blocks['italic'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Italic %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Italic text");
  }
};

Blockly.Blocks['title'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Title %1");
    this.setPreviousStatement(true, 'head_element');
    this.setNextStatement(true, 'head_element');
    this.setColour('#A7C1E8');
    this.setTooltip("Page title");
  }
};

Blockly.Blocks['span'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Span %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Inline text container");
  }
};

Blockly.Blocks['main'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Main Content \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Main content area");
  }
};

Blockly.Blocks['body'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("<body> %1%2</body>");
    this.setPreviousStatement(true, 'BODY');
    this.setColour('#f16529');
    this.setTooltip("The content of the html page");
  }
};

Blockly.Blocks['css_border_radius'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Border Radius %1 px");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Rounded corners");
  }
};

Blockly.Blocks['checkbox'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Checkbox %1 Value %2 %3 Checked");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Checkbox input");
  }
};

Blockly.Blocks['audio'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Audio %1 %2 Controls");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff8c00');
    this.setTooltip("Audio element");
  }
};

Blockly.Blocks['css_z_index'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Z-Index %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("Stacking order");
  }
};

Blockly.Blocks['bold'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Bold  text%1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Bold text");
  }
};

Blockly.Blocks['css_justify_content'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Justify Content %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#8e44ad');
    this.setTooltip("Justify content");
  }
};

Blockly.Blocks['meta_charset'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("meta charset %1");
    this.setPreviousStatement(true, 'head_element');
    this.setNextStatement(true, 'head_element');
    this.setColour('#A7C1E8');
    this.setTooltip("Defines the character encoding of the document.");
  }
};

Blockly.Blocks['image'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Image %1 Alt text %2 Width %3 Height %4");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff8c00');
    this.setTooltip("Image element");
  }
};

Blockly.Blocks['form'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Form %1 Action %2 \n %3");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Form element");
  }
};

Blockly.Blocks['css_float'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Float %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#f39c12');
    this.setTooltip("Float element");
  }
};

Blockly.Blocks['css_background_color'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Background Color %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#e74c3c');
    this.setTooltip("background color");
  }
};

Blockly.Blocks['css_font_family'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Font %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Font family");
  }
};

Blockly.Blocks['css_box_shadow'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Box Shadow X %1 Y %2 Blur %3 %4");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("Box shadow");
  }
};

Blockly.Blocks['div'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Div container \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Generic container");
  }
};

Blockly.Blocks['input_email'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Email Input %1 Placeholder %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Email input field");
  }
};

Blockly.Blocks['select'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Dropdown name =%1 \n%2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Dropdown select");
  }
};

Blockly.Blocks['horizontal_rule'] = {
  init: function() {
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Horizontal rule");
  }
};

Blockly.Blocks['css_selector'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("style %1{\n %2}");
    this.setPreviousStatement(true, 'css_element');
    this.setNextStatement(true, 'css_element');
    this.setColour('#4682B4');
    this.setTooltip("CSS selector");
  }
};

Blockly.Blocks['style_tag'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("<style> %1 %2</style>");
    this.setPreviousStatement(true, 'head_element');
    this.setNextStatement(true, 'head_element');
    this.setColour('#4682B4');
    this.setTooltip("CSS style tag");
  }
};

Blockly.Blocks['css_transform'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Transform %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("CSS transform");
  }
};

Blockly.Blocks['meta_name'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("meta    name %1   content %2");
    this.setPreviousStatement(true, 'head_element');
    this.setNextStatement(true, 'head_element');
    this.setColour('#A7C1E8');
    this.setTooltip("Defines metadata such as description, keywords, author, viewport, etc.");
  }
};

Blockly.Blocks['textarea'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Text Area %1 Rows %2 Cols %3 Placeholder %4");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Multi-line text input");
  }
};

Blockly.Blocks['css_opacity'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Opacity %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("Opacity (0-1)");
  }
};

Blockly.Blocks['css_font_weight'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Font Weight %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Font weight");
  }
};

Blockly.Blocks['header'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Header container \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Header section");
  }
};

Blockly.Blocks['css_overflow'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Overflow %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("Overflow behavior");
  }
};

Blockly.Blocks['css_margin'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Margin %1 %2");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Margin (all sides)");
  }
};

Blockly.Blocks['radio'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Radio %1 Value %2 %3 Checked");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Radio button");
  }
};

Blockly.Blocks['line_break'] = {
  init: function() {
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Line break");
  }
};

Blockly.Blocks['css_gap'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Gap %1 px");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#8e44ad');
    this.setTooltip("Gap between items");
  }
};

Blockly.Blocks['css_align_items'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Align Items %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#8e44ad');
    this.setTooltip("Align items");
  }
};

Blockly.Blocks['css_flex_direction'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Flex Direction %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#8e44ad');
    this.setTooltip("Flex direction");
  }
};

Blockly.Blocks['table_row'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Table row \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#9b59b6');
    this.setTooltip("Table row");
  }
};

Blockly.Blocks['input_password'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Password Input %1 Placeholder %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Password input field");
  }
};

Blockly.Blocks['table'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("<table> \n %1 </table>");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#9b59b6');
    this.setTooltip("Table element");
  }
};

Blockly.Blocks['css_width'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Width %1 %2");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Width");
  }
};

Blockly.Blocks['css_line_height'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Line Height %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Line height");
  }
};

Blockly.Blocks['heading'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Heading %1 %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Heading element");
  }
};

Blockly.Blocks['section'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Section container \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Semantic section");
  }
};

Blockly.Blocks['css_color'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("text color : %1;");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#e74c3c');
    this.setTooltip("Text color");
  }
};

Blockly.Blocks['css_transition'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Transition %1 %2 s");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("CSS transition");
  }
};

Blockly.Blocks['css_border'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Border %1 px %2 %3");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Border");
  }
};

Blockly.Blocks['css_font_size'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Font Size %1 %2");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Font size");
  }
};

Blockly.Blocks['link'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Link %1 URL %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#4a90e2');
    this.setTooltip("Hyperlink");
  }
};

Blockly.Blocks['css_border_color'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Border Color %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#e74c3c');
    this.setTooltip("Border color");
  }
};

Blockly.Blocks['meta_http_equiv'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("meta   http-equiv %1 content %2");
    this.setPreviousStatement(true, 'head_element');
    this.setNextStatement(true, 'head_element');
    this.setColour('#A7C1E8');
    this.setTooltip("Simulates HTTP headers like refresh, content-type, CSP, etc.");
  }
};

Blockly.Blocks['ordered_list'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Ordered List \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff6b6b');
    this.setTooltip("Numbered list");
  }
};

Blockly.Blocks['css_text_decoration'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Text Decoration %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Text decoration");
  }
};

Blockly.Blocks['article'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Article \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Article container");
  }
};

Blockly.Blocks['footer'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Footer container\n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Footer section");
  }
};

Blockly.Blocks['html_new_field'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("My new block \n%1");
    this.setPreviousStatement(true, 'None');
    this.setNextStatement(true, 'None');
    this.setColour('#3b82f6');
    this.setTooltip("A new block");
  }
};

Blockly.Blocks['table_header'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Table header cell %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#9b59b6');
    this.setTooltip("Table header cell");
  }
};

Blockly.Blocks['css_cursor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Cursor %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#16a085');
    this.setTooltip("Cursor style");
  }
};

Blockly.Blocks['iframe'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("iFrame %1 Width %2 Height %3");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff8c00');
    this.setTooltip("Embedded frame");
  }
};

Blockly.Blocks['label'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Label %1 For %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Label for form field");
  }
};

Blockly.Blocks['css_text_align'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Text Align %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#3498db');
    this.setTooltip("Text alignment");
  }
};

Blockly.Blocks['html_boilerplate'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("HTML Boilerplate \n head elements%1 %2 body elements %3 %4");
    this.setColour('#f16529');
    this.setTooltip("Creates a complete HTML page structur");
  }
};

Blockly.Blocks['list_item'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("List Item %1");
    this.setPreviousStatement(true, 'list_item');
    this.setNextStatement(true, 'list_item');
    this.setColour('#ff6b6b');
    this.setTooltip("List item");
  }
};

Blockly.Blocks['table_data'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Table data %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#9b59b6');
    this.setTooltip("Table data cell");
  }
};

Blockly.Blocks['css_height'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Height %1 %2");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Height");
  }
};

Blockly.Blocks['css_padding'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Padding %1 %2");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#2ecc71');
    this.setTooltip("Padding (all sides)");
  }
};

Blockly.Blocks['nav'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Navigation container \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#7b68ee');
    this.setTooltip("Navigation container");
  }
};

Blockly.Blocks['video'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Video %1 Width %2 Height %3 %4 Controls");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff8c00');
    this.setTooltip("Video element");
  }
};

Blockly.Blocks['input_number'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Number Input %1 Min %2 Max %3");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Number input field");
  }
};

Blockly.Blocks['input_text'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Text Input %1 Placeholder %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Text input field");
  }
};

Blockly.Blocks['option'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Option %1 Value %2");
    this.setPreviousStatement(true, 'list_item');
    this.setNextStatement(true, 'list_item');
    this.setColour('#20b2aa');
    this.setTooltip("Select option");
  }
};

Blockly.Blocks['button'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Button %1 Type %2");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#20b2aa');
    this.setTooltip("Button element");
  }
};

Blockly.Blocks['head'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("<head>%1%2</head>");
    this.setPreviousStatement(true, 'HEAD');
    this.setColour('#f16529');
    this.setTooltip("Define page meta, title, styles, scripts etc.");
  }
};

Blockly.Blocks['css_display'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Display %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#f39c12');
    this.setTooltip("Display type");
  }
};

Blockly.Blocks['unordered_list'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Unordered List \n %1");
    this.setPreviousStatement(true, 'body_element');
    this.setNextStatement(true, 'body_element');
    this.setColour('#ff6b6b');
    this.setTooltip("Bulleted list");
  }
};

Blockly.Blocks['css_position'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Position %1");
    this.setPreviousStatement(true, 'css_property');
    this.setNextStatement(true, 'css_property');
    this.setColour('#f39c12');
    this.setTooltip("Position type");
  }
};

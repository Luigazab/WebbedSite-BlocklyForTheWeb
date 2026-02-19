import * as Blockly from 'blockly/core';

export const defineBlocks = () => {
  // =============================================================================
  // CATEGORY: PAGE STRUCTURE
  // =============================================================================
  
  Blockly.Blocks['html_doctype'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("<!DOCTYPE html>");
      this.appendDummyInput()
          .appendField("<html>");
      this.appendStatementInput("HTML")
          .setCheck("head");
      this.appendDummyInput()
          .appendField("</html>");
      this.setColour("#FF8500");
      this.setTooltip("Creates a complete HTML page structure");
    }
  };

  Blockly.Blocks['head'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("<head>");
      this.appendStatementInput("head_element")
          .setCheck("head_element");
      this.appendDummyInput()
          .appendField("</head>");
      this.setPreviousStatement(true, "head");
      this.setNextStatement(true, "body_element");
      this.setColour("#FF8500");
      this.setTooltip("Define page meta, title, styles, scripts etc.");
    }
  };

  Blockly.Blocks['body'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("<body>");
      this.appendStatementInput("body_element")
          .setCheck("body_element");
      this.appendDummyInput()
          .appendField("</body>");
      this.setPreviousStatement(true, "body_element");
      this.setColour("#FF8500");
      this.setTooltip("Contains the visible page content");
    }
  };

  Blockly.Blocks['title'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<title>')
          .appendField(new Blockly.FieldTextInput('My Page'), 'NAME')
          .appendField('</title>');
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'head_element');
      this.setNextStatement(true, 'head_element');
      this.setColour("#FF8500");
      this.setTooltip('Document title shown in browser tab');
    }
  };

  // =============================================================================
  // CATEGORY: STRUCTURE ELEMENTS
  // =============================================================================
  
  Blockly.Blocks['div'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<div>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</div>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Generic container for grouping elements');
    }
  };

  Blockly.Blocks['header'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<header>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</header>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Introductory content or navigation');
    }
  };

  Blockly.Blocks['footer'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<footer>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</footer>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Footer for page or section');
    }
  };

  Blockly.Blocks['section'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<section>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</section>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Thematic grouping of content');
    }
  };

  Blockly.Blocks['article'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<article>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</article>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Self-contained composition (blog post, article)');
    }
  };

  Blockly.Blocks['nav'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<nav>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</nav>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Navigation links section');
    }
  };

  Blockly.Blocks['main'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<main>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</main>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Main content of the document');
    }
  };

  Blockly.Blocks['br'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<br/>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Line break');
    }
  };

  Blockly.Blocks['hr'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<hr/>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#7B68EE");
      this.setTooltip('Horizontal rule/divider');
    }
  };

  // =============================================================================
  // CATEGORY: TEXT ELEMENTS
  // =============================================================================
  
  Blockly.Blocks['heading'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<h')
          .appendField(new Blockly.FieldDropdown([
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
              ['4', '4'],
              ['5', '5'],
              ['6', '6']
          ]), 'LEVEL')
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Heading'), 'TEXT')
          .appendField('</h>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Heading element (h1-h6)');
    }
  };

  Blockly.Blocks['paragraph'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<p>')
          .appendField(new Blockly.FieldTextInput('Paragraph text'), 'TEXT')
          .appendField('</p>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Paragraph of text');
    }
  };

  Blockly.Blocks['span'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<span>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</span>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Inline container for text');
    }
  };

  Blockly.Blocks['a_tag'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<a href="')
          .appendField(new Blockly.FieldTextInput('https://example.com'), 'URL')
          .appendField('">')
          .appendField(new Blockly.FieldTextInput('Link text'), 'TEXT')
          .appendField('</a>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Hyperlink');
    }
  };

  Blockly.Blocks['strong'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<strong>')
          .appendField(new Blockly.FieldTextInput('Bold text'), 'TEXT')
          .appendField('</strong>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Bold/strong text');
    }
  };

  Blockly.Blocks['em'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<em>')
          .appendField(new Blockly.FieldTextInput('Italic text'), 'TEXT')
          .appendField('</em>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour('#4A90E2');
      this.setTooltip('Emphasized/italic text');
    }
  };

  // =============================================================================
  // CATEGORY: FORMS
  // =============================================================================
  
  Blockly.Blocks['form'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<form>');
      this.appendStatementInput("CONTENT")
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</form>');
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#F39C12");
      this.setTooltip("Form container");
    }
  };

  Blockly.Blocks['label'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<label>')
          .appendField(new Blockly.FieldTextInput('Label:'), 'TEXT')
          .appendField('</label>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#F39C12");
      this.setTooltip("Label for form input");
    }
  };

  Blockly.Blocks['input'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<input type="')
          .appendField(new Blockly.FieldDropdown([
              ['text', 'text'],
              ['password', 'password'],
              ['email', 'email'],
              ['number', 'number'],
              ['checkbox', 'checkbox'],
              ['radio', 'radio'],
              ['submit', 'submit'],
              ['button', 'button']
          ]), 'TYPE')
          .appendField('" placeholder="')
          .appendField(new Blockly.FieldTextInput('Enter text'), 'PLACEHOLDER')
          .appendField('">');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#F39C12");
      this.setTooltip("Input field");
    }
  };

  Blockly.Blocks['textarea'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<textarea rows="')
          .appendField(new Blockly.FieldNumber(4, 1, 20), 'ROWS')
          .appendField('" cols="')
          .appendField(new Blockly.FieldNumber(50, 10, 100), 'COLS')
          .appendField('">')
          .appendField(new Blockly.FieldTextInput(''), 'TEXT')
          .appendField('</textarea>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#F39C12");
      this.setTooltip("Multi-line text input");
    }
  };

  Blockly.Blocks['button'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<button>')
          .appendField(new Blockly.FieldTextInput('Click me'), 'TEXT')
          .appendField('</button>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#F39C12");
      this.setTooltip("Button element");
    }
  };

  // =============================================================================
  // CATEGORY: MEDIA
  // =============================================================================
  
  Blockly.Blocks['img'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<img src="')
          .appendField(new Blockly.FieldTextInput('image.jpg'), 'SRC')
          .appendField('" alt="')
          .appendField(new Blockly.FieldTextInput('description'), 'ALT')
          .appendField('" width="')
          .appendField(new Blockly.FieldTextInput('300'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('200'), 'HEIGHT')
          .appendField('">');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#E74C3C");
      this.setTooltip("Image element");
    }
  };

  Blockly.Blocks['audio'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<audio controls>')
          .appendField('<source src="')
          .appendField(new Blockly.FieldTextInput('audio.mp3'), 'FILE')
          .appendField('" type="')
          .appendField(new Blockly.FieldTextInput('audio/mpeg'), 'TYPE')
          .appendField('"></audio>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#E74C3C");
      this.setTooltip("Audio player with controls");
    }
  };

  Blockly.Blocks['video'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<video controls width="')
          .appendField(new Blockly.FieldTextInput('320'), 'WIDTH')
          .appendField('"><source src="')
          .appendField(new Blockly.FieldTextInput('video.mp4'), 'FILE')
          .appendField('" type="')
          .appendField(new Blockly.FieldTextInput('video/mp4'), 'TYPE')
          .appendField('"></video>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#E74C3C");
      this.setTooltip("Video player with controls");
    }
  };

  // =============================================================================
  // CATEGORY: LISTS
  // =============================================================================
  
  Blockly.Blocks['ul'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<ul>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</ul>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Unordered (bulleted) list");
    }
  };

  Blockly.Blocks['ol'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<ol>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</ol>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Ordered (numbered) list");
    }
  };

  Blockly.Blocks['li'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<li>')
          .appendField(new Blockly.FieldTextInput('List item'), 'TEXT')
          .appendField('</li>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("List item");
    }
  };

  // =============================================================================
  // CATEGORY: TABLES
  // =============================================================================
  
  Blockly.Blocks['table'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<table>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</table>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#16A085");
      this.setTooltip("Table container");
    }
  };

  Blockly.Blocks['tr'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<tr>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</tr>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#16A085");
      this.setTooltip("Table row");
    }
  };

  Blockly.Blocks['th'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<th>')
          .appendField(new Blockly.FieldTextInput('Header'), 'TEXT')
          .appendField('</th>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#16A085");
      this.setTooltip("Table header cell");
    }
  };

  Blockly.Blocks['td'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<td>')
          .appendField(new Blockly.FieldTextInput('Data'), 'TEXT')
          .appendField('</td>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#16A085");
      this.setTooltip("Table data cell");
    }
  };

  // =============================================================================
  // CATEGORY: CSS STYLES
  // =============================================================================
  
  Blockly.Blocks['style'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<style>');
      this.appendStatementInput('CONTENT')
          .setCheck('css_rule');
      this.appendDummyInput()
          .appendField('</style>');
      this.setPreviousStatement(true, 'head_element');
      this.setNextStatement(true, 'head_element');
      this.setColour("#3498DB");
      this.setTooltip("Inline CSS styles");
    }
  };

  Blockly.Blocks['link_rel'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('<link rel="')
          .appendField(new Blockly.FieldTextInput('stylesheet'), 'REL')
          .appendField('" href="')
          .appendField(new Blockly.FieldTextInput('style.css'), 'HREF')
          .appendField('">');
      this.setPreviousStatement(true, 'head_element');
      this.setNextStatement(true, 'head_element');
      this.setColour("#3498DB");
      this.setTooltip("Link to external stylesheet");
    }
  };

  Blockly.Blocks['css_rule'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput('selector'), 'SELECTOR')
          .appendField('{');
      this.appendStatementInput('PROPERTIES')
          .setCheck('css_property');
      this.appendDummyInput()
          .appendField('}');
      this.setPreviousStatement(true, 'css_rule');
      this.setNextStatement(true, 'css_rule');
      this.setColour("#3498DB");
      this.setTooltip("CSS rule with selector");
    }
  };

  // CSS Properties
  Blockly.Blocks['color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('color: ')
          .appendField(new Blockly.FieldTextInput('#000000'), 'COLOR')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Text color");
    }
  };

  Blockly.Blocks['background_color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('background-color: ')
          .appendField(new Blockly.FieldTextInput('#ffffff'), 'COLOR')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Background color");
    }
  };

  Blockly.Blocks['font_family'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('font-family: ')
          .appendField(new Blockly.FieldTextInput('Arial, sans-serif'), 'FAMILY')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Font family");
    }
  };

  Blockly.Blocks['font_size'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('font-size: ')
          .appendField(new Blockly.FieldNumber(16, 1, 100), 'SIZE')
          .appendField(new Blockly.FieldDropdown([
              ['px', 'px'],
              ['em', 'em'],
              ['rem', 'rem'],
              ['%', '%']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Font size");
    }
  };

  Blockly.Blocks['text_align'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('text-align: ')
          .appendField(new Blockly.FieldDropdown([
              ['left', 'left'],
              ['center', 'center'],
              ['right', 'right'],
              ['justify', 'justify']
          ]), 'ALIGN')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Text alignment");
    }
  };

  Blockly.Blocks['margin'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('margin: ')
          .appendField(new Blockly.FieldNumber(0, 0, 1000), 'VALUE')
          .appendField(new Blockly.FieldDropdown([
              ['px', 'px'],
              ['em', 'em'],
              ['%', '%']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Margin (outer spacing)");
    }
  };

  Blockly.Blocks['padding'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('padding: ')
          .appendField(new Blockly.FieldNumber(0, 0, 1000), 'VALUE')
          .appendField(new Blockly.FieldDropdown([
              ['px', 'px'],
              ['em', 'em'],
              ['%', '%']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Padding (inner spacing)");
    }
  };

  Blockly.Blocks['width'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('width: ')
          .appendField(new Blockly.FieldNumber(100, 0, 10000), 'VALUE')
          .appendField(new Blockly.FieldDropdown([
              ['px', 'px'],
              ['%', '%'],
              ['em', 'em'],
              ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Width");
    }
  };

  Blockly.Blocks['height'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('height: ')
          .appendField(new Blockly.FieldNumber(100, 0, 10000), 'VALUE')
          .appendField(new Blockly.FieldDropdown([
              ['px', 'px'],
              ['%', '%'],
              ['em', 'em'],
              ['auto', 'auto']
          ]), 'UNIT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Height");
    }
  };

  Blockly.Blocks['border'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('border: ')
          .appendField(new Blockly.FieldNumber(1, 0, 50), 'WIDTH')
          .appendField('px ')
          .appendField(new Blockly.FieldDropdown([
              ['solid', 'solid'],
              ['dashed', 'dashed'],
              ['dotted', 'dotted'],
              ['double', 'double']
          ]), 'STYLE')
          .appendField(' ')
          .appendField(new Blockly.FieldTextInput('#000000'), 'COLOR')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Border");
    }
  };

  Blockly.Blocks['border_radius'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('border-radius: ')
          .appendField(new Blockly.FieldNumber(0, 0, 100), 'VALUE')
          .appendField('px;');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Rounded corners");
    }
  };

  Blockly.Blocks['display'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('display: ')
          .appendField(new Blockly.FieldDropdown([
              ['block', 'block'],
              ['inline', 'inline'],
              ['inline-block', 'inline-block'],
              ['flex', 'flex'],
              ['grid', 'grid'],
              ['none', 'none']
          ]), 'DISPLAY')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Display type");
    }
  };

  Blockly.Blocks['text_decoration'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('text-decoration: ')
          .appendField(new Blockly.FieldDropdown([
              ['none', 'none'],
              ['underline', 'underline'],
              ['overline', 'overline'],
              ['line-through', 'line-through']
          ]), 'DECORATION')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Text decoration");
    }
  };

  Blockly.Blocks['text_transform'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('text-transform: ')
          .appendField(new Blockly.FieldDropdown([
              ['none', 'none'],
              ['uppercase', 'uppercase'],
              ['lowercase', 'lowercase'],
              ['capitalize', 'capitalize']
          ]), 'TRANSFORM')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Text transform");
    }
  };

  Blockly.Blocks['float'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('float: ')
          .appendField(new Blockly.FieldDropdown([
              ['left', 'left'],
              ['right', 'right'],
              ['none', 'none']
          ]), 'FLOAT')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Float positioning");
    }
  };

  Blockly.Blocks['position'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('position: ')
          .appendField(new Blockly.FieldDropdown([
              ['static', 'static'],
              ['relative', 'relative'],
              ['absolute', 'absolute'],
              ['fixed', 'fixed'],
              ['sticky', 'sticky']
          ]), 'POSITION')
          .appendField(';');
      this.setPreviousStatement(true, 'css_property');
      this.setNextStatement(true, 'css_property');
      this.setColour("#3498DB");
      this.setTooltip("Positioning type");
    }
  };

  // =============================================================================
  // CATEGORY: ATTRIBUTES
  // =============================================================================
  
  Blockly.Blocks['class_attr'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('class="')
          .appendField(new Blockly.FieldTextInput('my-class'), 'CLASS')
          .appendField('"');
      this.setPreviousStatement(true, 'attribute');
      this.setNextStatement(true, 'attribute');
      this.setColour("#95A5A6");
      this.setTooltip("CSS class attribute");
    }
  };

  Blockly.Blocks['id_attr'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('id="')
          .appendField(new Blockly.FieldTextInput('my-id'), 'ID')
          .appendField('"');
      this.setPreviousStatement(true, 'attribute');
      this.setNextStatement(true, 'attribute');
      this.setColour("#95A5A6");
      this.setTooltip("ID attribute");
    }
  };
};
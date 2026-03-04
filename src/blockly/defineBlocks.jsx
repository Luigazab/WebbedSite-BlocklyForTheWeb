import * as Blockly from 'blockly/core';
import "@blockly/block-plus-minus";

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
      this.appendValueInput('attributes')
          .appendField('<div')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<header')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<footer')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<section')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<article')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<nav')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<main')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<h')
          .appendField(new Blockly.FieldDropdown([
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
              ['4', '4'],
              ['5', '5'],
              ['6', '6']
          ]), 'LEVEL')
          .setCheck('attributes');
      this.appendDummyInput()
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
      this.appendValueInput('attributes')
          .appendField('<p')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
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
      this.appendValueInput('attributes')
          .appendField('<span')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
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
      this.appendValueInput('attributes')
          .appendField('<a href="')
          .appendField(new Blockly.FieldTextInput('https://example.com'), 'URL')
          .appendField('"')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
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
      this.appendValueInput('attributes')
          .appendField('<strong')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
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
      this.appendValueInput('attributes')
          .appendField('<em')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
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
      this.appendValueInput('attributes')
          .appendField('<form')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput("CONTENT")
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</form>');
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#20B2AA");
      this.setTooltip("Form container");
    }
  };

  Blockly.Blocks['label'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<label')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Label:'), 'TEXT')
          .appendField('</label>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#20B2AA");
      this.setTooltip("Label for form input");
    }
  };

  Blockly.Blocks['input'] = {
    init: function() {
      this.appendValueInput('attributes')
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
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('">');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#20B2AA");
      this.setTooltip("Input field");
    }
  };

  Blockly.Blocks['textarea'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<textarea rows="')
          .appendField(new Blockly.FieldNumber(4, 1, 20), 'ROWS')
          .appendField('" cols="')
          .appendField(new Blockly.FieldNumber(50, 10, 100), 'COLS')
          .appendField('"')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput(''), 'TEXT')
          .appendField('</textarea>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#20B2AA");
      this.setTooltip("Multi-line text input");
    }
  };

  Blockly.Blocks['button'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<button')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Click me'), 'TEXT')
          .appendField('</button>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#20B2AA");
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
      this.appendValueInput('attributes')
          .appendField('<ul')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</ul>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#FF6B6B");
      this.setTooltip("Unordered (bulleted) list");
    }
  };

  Blockly.Blocks['ol'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<ol')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</ol>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#FF6B6B");
      this.setTooltip("Ordered (numbered) list");
    }
  };

  Blockly.Blocks['li'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<li')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</li>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#FF6B6B");
      this.setTooltip("List item");
    }
  };
  Blockly.Blocks['select'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<select')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</select>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#FF6B6B");
      this.setTooltip("Select element");
    }
  };
  Blockly.Blocks['option'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<option')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Option 1'), 'TEXT')
          .appendField('</option>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#FF6B6B");
      this.setTooltip("Select element");
    }
  };

  // =============================================================================
  // CATEGORY: TABLES
  // =============================================================================
  
  Blockly.Blocks['table'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<table')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</table>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Table container");
    }
  };

  Blockly.Blocks['tr'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<tr')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>');
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</tr>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Table row");
    }
  };

  Blockly.Blocks['th'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<th')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</th>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Table header cell");
    }
  };

  Blockly.Blocks['td'] = {
    init: function() {
      this.appendValueInput('attributes')
          .appendField('<td')
          .setCheck('attributes');
      this.appendDummyInput()
          .appendField('>')
      this.appendStatementInput('CONTENT')
          .setCheck('body_element');
      this.appendDummyInput()
          .appendField('</td>');
      this.setPreviousStatement(true, 'body_element');
      this.setNextStatement(true, 'body_element');
      this.setColour("#9B59B6");
      this.setTooltip("Table data cell");
    }
  };

  // =============================================================================
  // CATEGORY: CSS STYLES
  // =============================================================================
  Blockly.Blocks['head_style'] = {
    init: function() {
      this.appendDummyInput('')
        .appendField('<style>');
      this.appendStatementInput('CONTENT')
      .setCheck('style_for');
      this.appendDummyInput('')
        .appendField('</style>');
      this.setPreviousStatement(true, 'head_element');
      this.setNextStatement(true, 'head_element');
      this.setTooltip('Add CSS styling in your html file head tag');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['head_link'] = {
    init: function() {
      this.appendValueInput('NAME')
      .setCheck('extra_attribute')
        .appendField('<link rel = "')
        .appendField(new Blockly.FieldDropdown([
            ['stylesheet', 'stylesheet'],
            ['icon', 'icon']
          ]), 'TYPE')
        .appendField('" href = "')
        .appendField(new Blockly.FieldTextInput('/url'), 'URL')
        .appendField('"');
      this.appendEndRowInput('NAME')
        .appendField('>');
      this.setInputsInline(true)
      this.setPreviousStatement(true, 'head_element');
      this.setNextStatement(true, 'head_element');
      this.setTooltip('For calling external files into the page');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };

  Blockly.Blocks['style_target'] = {
      init: function() {
      this.appendValueInput('STYLE_FOR')
      .setCheck('style_')
        .appendField(new Blockly.FieldTextInput('.classname'), 'TARGET');
      this.appendDummyInput('')
        .appendField('{');
      this.appendStatementInput('CONTENT')
      .setCheck('external_style');
      this.appendDummyInput('')
        .appendField('}');
      this.setInputsInline(true)
      this.setPreviousStatement(true, 'style_for');
      this.setNextStatement(true, 'style_for');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['style_effect'] = {
    init: function() {
      this.appendEndRowInput('effect')
          .appendField(":")
          .appendField(new Blockly.FieldDropdown([
            [":before", ":before"],
            [":after", ":after"],
            ["focus", "focus"],
            ["hover", "hover"],
          ]), "effect")
      this.setInputsInline(true)
      this.setOutput(true, null);
      this.setColour('#34A853');
      this.setTooltip("CSS effects");
    }
  };
  // =============================================================================
  // EXTERNAL: CSS STYLES
  // =============================================================================
  //EXTERNAL TEXT STYLINGS
  Blockly.Blocks['external_text_color'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_font_family'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-family:')
        .appendField(new Blockly.FieldTextInput('serif'), 'FONT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Set a font style for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_font_size'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_font_size_descriptive'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldDropdown([
          ['initial', 'initial '],
          ['inherit', 'inherit'],
          ['xx-small', 'xx-small'],
          ['x-small', 'x-small'],
          ['small', 'small'],
          ['large', 'large'],
          ['x-large', 'x-large'],
          ['xx-large', 'xx-large'],
          ['smaller', 'smaller'],
          ['larger', 'larger'],
        ]), 'SIZE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_text_align'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-align:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left '],
          ['right', 'right'],
          ['center', 'center'],
          ['justify', 'justify'],
        ]), 'ALIGN')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_text_transform'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-transform:')
        .appendField(new Blockly.FieldDropdown([
          ['none', 'none '],
          ['capitalize', 'capitalize'],
          ['uppercase', 'uppercase'],
          ['lowercase', 'lowercase'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'TRANSFORM')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };   
  Blockly.Blocks['external_text_decoration'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-decoration:')
        .appendField(new Blockly.FieldDropdown([
          ['underline', 'underline'],
          ['overline', 'overline'],
          ['line-through', 'line-through'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
          ['none', 'none '],
        ]), 'DECORATION')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['double', 'double'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['wavy', 'wavy'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'DECORATION_STYLE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_text_shadow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('text-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };

  //EXTERNAL DISPLAY STYLING
  Blockly.Blocks['external_display'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('display:')
        .appendField(new Blockly.FieldDropdown([
          ['block', 'block'],
          ['none', 'none'],
          ['flex', 'flex'],
          ['inline', 'inline'],
          ['inline-block', 'inline-block'],
          ['inline-flex', 'inline-flex'],
          ['inline-table', 'inline-table'],
          ['table', 'table'],
          ['inherit', 'inherit'],
          ['initial', 'initial'],
        ]), 'DISPLAY')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_overflow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('overflow-')
        .appendField(new Blockly.FieldDropdown([
          ['x', 'x'],
          ['y', 'y'],
        ]), 'AXIS')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown([
          ['scroll', 'scroll'],
          ['auto', 'auto'],
          ['hidden', 'hidden'],
          ['visible', 'visible'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'OVERFLOW')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_float'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('float:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left'],
          ['right', 'right'],
        ]), 'FLOAT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_height'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('height:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };  
  Blockly.Blocks['external_width'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('width:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL SPACING STYLING
  Blockly.Blocks['external_margin'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_margin_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_padding'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_padding_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL BACKGROUND STYLING
  Blockly.Blocks['external_background_color'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Colors the background of an element');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_image'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-image: url( " ')
        .appendField(new Blockly.FieldTextInput('/url'), 'URL')
        .appendField(' " );');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Makes an image the background of an element');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_repeat'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-repeat:')
        .appendField(new Blockly.FieldDropdown([
          ['repeat', 'repeat'],
          ['no-repeat', 'no-repeat'],
          ['repeat-x', 'repeat-x'],
          ['repeat-y', 'repeat--y'],
          ['round', 'round'],
          ['space', 'space'],
        ]), 'REPEAT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_position'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-position:')
        .appendField(new Blockly.FieldDropdown([
          ['bottom', 'bottom'],
          ['center', 'center'],
          ['left', 'left'],
          ['left bottom', 'left bottom'],
          ['left top', 'left top'],
          ['right', 'right'],
          ['right bottom', 'right bottom'],
          ['right top', 'right top'],
          ['top', 'top'],
        ]), 'POSITION')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_size'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-size:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['cover', 'cover'],
          ['contain', 'contain'],
        ]), 'SIZE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_background_clip'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('background-clip:')
        .appendField(new Blockly.FieldDropdown([
          ['border-box', 'border-box'],
          ['padding-box', 'padding-box'],
          ['content-box', 'content-box'],
          ['text', 'text'],
        ]), 'CLIP')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  // EXTERNAL BORDER STYLING
  Blockly.Blocks['external_border'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['right', 'right'],
          ['bottom', 'bottom'],
          ['left', 'left'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_radius'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-radius:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_border_radius_specific'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top-left', 'top-left'],
          ['top-right', 'top-right'],
          ['bottom-left', 'bottom-left'],
          ['bottom-right', 'bottom-right'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  //EXTERNAL MORE STYLING
  Blockly.Blocks['external_cursor'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('cursor:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['default', 'default'],
          ['pointer', 'pointer'],
          ['wait', 'wait'],
          ['text', 'text'],
          ['move', 'move'],
          ['help', 'help'],
          ['not-allowed', 'not-allowed'],
        ]), 'TYPE')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Sets the cursor style.');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  Blockly.Blocks['external_box_shadow'] = {
    init: function() {
      this.appendEndRowInput('external_style')
        .appendField('box-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setPreviousStatement(true, 'external_style');
      this.setNextStatement(true, 'external_style');
      this.setTooltip('Set a shadow to the element.');
      this.setHelpUrl('');
      this.setColour('#4285F4');
    }
  };
  // =============================================================================
  // Inline: STYLING
  // =============================================================================
  
  Blockly.Blocks['internal_text_color'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_font_family'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-family:')
        .appendField(new Blockly.FieldTextInput('serif'), 'FONT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Set a font style for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_font_size'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_font_size_descriptive'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('font-size:')
        .appendField(new Blockly.FieldDropdown([
          ['initial', 'initial '],
          ['inherit', 'inherit'],
          ['xx-small', 'xx-small'],
          ['x-small', 'x-small'],
          ['small', 'small'],
          ['large', 'large'],
          ['x-large', 'x-large'],
          ['xx-large', 'xx-large'],
          ['smaller', 'smaller'],
          ['larger', 'larger'],
        ]), 'SIZE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_text_align'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-align:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left '],
          ['right', 'right'],
          ['center', 'center'],
          ['justify', 'justify'],
        ]), 'ALIGN')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_text_transform'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-transform:')
        .appendField(new Blockly.FieldDropdown([
          ['none', 'none '],
          ['capitalize', 'capitalize'],
          ['uppercase', 'uppercase'],
          ['lowercase', 'lowercase'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'TRANSFORM')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };   
  Blockly.Blocks['internal_text_decoration'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-decoration:')
        .appendField(new Blockly.FieldDropdown([
          ['underline', 'underline'],
          ['overline', 'overline'],
          ['line-through', 'line-through'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
          ['none', 'none '],
        ]), 'DECORATION')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['double', 'double'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['wavy', 'wavy'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'DECORATION_STYLE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_text_shadow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('text-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Color for texts');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };

  //internal DISPLAY STYLING
  Blockly.Blocks['internal_display'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('display:')
        .appendField(new Blockly.FieldDropdown([
          ['block', 'block'],
          ['none', 'none'],
          ['flex', 'flex'],
          ['inline', 'inline'],
          ['inline-block', 'inline-block'],
          ['inline-flex', 'inline-flex'],
          ['inline-table', 'inline-table'],
          ['table', 'table'],
          ['inherit', 'inherit'],
          ['initial', 'initial'],
        ]), 'DISPLAY')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_overflow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('overflow-')
        .appendField(new Blockly.FieldDropdown([
          ['x', 'x'],
          ['y', 'y'],
        ]), 'AXIS')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown([
          ['scroll', 'scroll'],
          ['auto', 'auto'],
          ['hidden', 'hidden'],
          ['visible', 'visible'],
          ['initial', 'initial'],
          ['inherit', 'inherit'],
        ]), 'OVERFLOW')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_float'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('float:')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'left'],
          ['right', 'right'],
        ]), 'FLOAT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_height'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('height:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };  
  Blockly.Blocks['internal_width'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('width:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal SPACING STYLING
  Blockly.Blocks['internal_margin'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_margin_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('margin:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_padding'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_padding_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('padding:')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['bottom', 'bottom'],
          ['left', 'left'],
          ['right', 'right'],
        ]), 'DIRECTION')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal BACKGROUND STYLING
  Blockly.Blocks['internal_background_color'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-color:')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Colors the background of an element');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_image'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-image: url( " ')
        .appendField(new Blockly.FieldTextInput('/url'), 'URL')
        .appendField(' " );');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Makes an image the background of an element');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_repeat'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-repeat:')
        .appendField(new Blockly.FieldDropdown([
          ['repeat', 'repeat'],
          ['no-repeat', 'no-repeat'],
          ['repeat-x', 'repeat-x'],
          ['repeat-y', 'repeat--y'],
          ['round', 'round'],
          ['space', 'space'],
        ]), 'REPEAT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_position'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-position:')
        .appendField(new Blockly.FieldDropdown([
          ['bottom', 'bottom'],
          ['center', 'center'],
          ['left', 'left'],
          ['left bottom', 'left bottom'],
          ['left top', 'left top'],
          ['right', 'right'],
          ['right bottom', 'right bottom'],
          ['right top', 'right top'],
          ['top', 'top'],
        ]), 'POSITION')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_size'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-size:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['cover', 'cover'],
          ['contain', 'contain'],
        ]), 'SIZE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_background_clip'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('background-clip:')
        .appendField(new Blockly.FieldDropdown([
          ['border-box', 'border-box'],
          ['padding-box', 'padding-box'],
          ['content-box', 'content-box'],
          ['text', 'text'],
        ]), 'CLIP')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  // internal BORDER STYLING
  Blockly.Blocks['internal_border'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top', 'top'],
          ['right', 'right'],
          ['bottom', 'bottom'],
          ['left', 'left'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dotted', 'dotted'],
          ['dashed', 'dashed'],
          ['double', 'double'],
          ['groove', 'groove'],
          ['ridge', 'ridge'],
          ['inset', 'inset'],
          ['outset', 'outset'],
          ['none', 'none'],
        ]), 'BORDER_STYLE')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_radius'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-radius:')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_border_radius_specific'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('border-')
        .appendField(new Blockly.FieldDropdown([
          ['top-left', 'top-left'],
          ['top-right', 'top-right'],
          ['bottom-left', 'bottom-left'],
          ['bottom-right', 'bottom-right'],
        ]), 'SIDE')
        .appendField(':')
        .appendField(new Blockly.FieldTextInput('0'), 'SIZE')
        .appendField(new Blockly.FieldDropdown([
          ['px', 'px'],
          ['em', 'em'],
          ['rem', 'rem'],
          ['%', '%']
        ]), 'UNIT')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  //internal MORE STYLING
  Blockly.Blocks['internal_cursor'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('cursor:')
        .appendField(new Blockly.FieldDropdown([
          ['auto', 'auto'],
          ['default', 'default'],
          ['pointer', 'pointer'],
          ['wait', 'wait'],
          ['text', 'text'],
          ['move', 'move'],
          ['help', 'help'],
          ['not-allowed', 'not-allowed'],
        ]), 'TYPE')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Sets the cursor style.');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  Blockly.Blocks['internal_box_shadow'] = {
    init: function() {
      this.appendEndRowInput('internal_style')
        .appendField('box-shadow:')
        .appendField(new Blockly.FieldTextInput('h-shadow'), 'H-SHADOW')
        .appendField(new Blockly.FieldTextInput('v-shadow'), 'V-SHADOW')
        .appendField(new Blockly.FieldTextInput('radius'), 'RADIUS')
        .appendField(new Blockly.FieldTextInput('#00ff66'), 'COLOR')
        .appendField(';');
      this.setInputsInline(true);
      this.setOutput(true, 'internal_style');
      this.setTooltip('Set a shadow to the element.');
      this.setHelpUrl('');
      this.setColour('#34A853');
    }
  };
  // =============================================================================
  // CATEGORY: ATTRIBUTES
  // =============================================================================
  Blockly.Blocks['class'] = {
    init: function() {
      this.appendDummyInput('class')
          .appendField('class = "')
          .appendField(new Blockly.FieldTextInput('ClassName'), 'NAME')
          .appendField(' "')
      this.setInputsInline(true)
      this.setOutput(true, 'attributes');
      this.setColour("#F5B945");
      this.setTooltip("Class attribute for html elements");
    }
  };
  Blockly.Blocks['id'] = {
    init: function() {
      this.appendDummyInput('id')
          .appendField('id = "')
          .appendField(new Blockly.FieldTextInput('idName'), 'NAME')
          .appendField(' "')
      this.setInputsInline(true)
      this.setOutput(true, 'attributes');
      this.setColour("#F5B945");
      this.setTooltip("Id attribute for html elements");
    }
  };
  Blockly.Blocks['body_style'] = {
    init: function() {
      this.appendValueInput('body_style')
          .appendField('style = "')
          .setCheck('internal_style');
      this.appendDummyInput()
          .appendField(' "');
      this.setInputsInline(true)
      this.setOutput(true, 'attributes');
      this.setColour("#F5B945");
      this.setTooltip("Id attribute for html elements");
    }
  };
  Blockly.Blocks['extra_attributes'] = {
    init: function() {
      this.appendValueInput('body_style')
          .setCheck('attributes');
      this.appendDummyInput()
      this.setInputsInline(true)
      this.setOutput(true, 'attributes');
      this.setColour("#F5B945");
      this.setTooltip("Id attribute for html elements");
    }
  };

   // =============================================================================
  // JavaScript Blocks
  // =============================================================================

};
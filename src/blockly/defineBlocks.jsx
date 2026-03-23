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
  // ════════════════════════════════════════════════════════════════════════
  // META TAGS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_meta_charset'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<meta charset="')
          .appendField(new Blockly.FieldDropdown([
            ['UTF-8', 'UTF-8'],
            ['ISO-8859-1', 'ISO-8859-1'],
            ['ASCII', 'ASCII'],
          ]), 'CHARSET')
          .appendField('">')
      this.setPreviousStatement(true, 'head_element')
      this.setNextStatement(true, 'head_element')
      this.setColour('#FF8500')
      this.setTooltip('Sets the character encoding for the HTML document')
    },
  }
 
  Blockly.Blocks['html_meta_viewport'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<meta name="viewport" content="')
          .appendField(new Blockly.FieldDropdown([
            ['width=device-width, initial-scale=1.0', 'width=device-width, initial-scale=1.0'],
            ['width=device-width, initial-scale=1.0, maximum-scale=1.0', 'width=device-width, initial-scale=1.0, maximum-scale=1.0'],
            ['width=device-width, initial-scale=1.0, user-scalable=no', 'width=device-width, initial-scale=1.0, user-scalable=no'],
          ]), 'CONTENT')
          .appendField('">')
      this.setPreviousStatement(true, 'head_element')
      this.setNextStatement(true, 'head_element')
      this.setColour('#FF8500')
      this.setTooltip('Viewport meta tag — essential for responsive design')
    },
  }
 
  Blockly.Blocks['html_meta_named'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<meta name="')
          .appendField(new Blockly.FieldDropdown([
            ['description', 'description'],
            ['keywords', 'keywords'],
            ['author', 'author'],
            ['robots', 'robots'],
            ['theme-color', 'theme-color'],
            ['application-name', 'application-name'],
            ['generator', 'generator'],
          ]), 'NAME')
          .appendField('" content="')
          .appendField(new Blockly.FieldTextInput('value here'), 'CONTENT')
          .appendField('">')
      this.setPreviousStatement(true, 'head_element')
      this.setNextStatement(true, 'head_element')
      this.setColour('#FF8500')
      this.setTooltip('Named meta tag (description, keywords, author, etc.)')
    },
  }
 
  Blockly.Blocks['html_meta_http_equiv'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<meta http-equiv="')
          .appendField(new Blockly.FieldDropdown([
            ['X-UA-Compatible', 'X-UA-Compatible'],
            ['content-type', 'content-type'],
            ['refresh', 'refresh'],
            ['content-security-policy', 'content-security-policy'],
            ['default-style', 'default-style'],
          ]), 'HTTP_EQUIV')
          .appendField('" content="')
          .appendField(new Blockly.FieldTextInput('IE=edge'), 'CONTENT')
          .appendField('">')
      this.setPreviousStatement(true, 'head_element')
      this.setNextStatement(true, 'head_element')
      this.setColour('#FF8500')
      this.setTooltip('HTTP-equiv meta tag (simulates HTTP response headers)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // SCRIPT (INLINE)
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_script_inline'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<script>')
      this.appendStatementInput('CONTENT')
          .setCheck(null)
      this.appendDummyInput()
          .appendField('</script>')
      this.setPreviousStatement(true, ['head_element', 'body_element'])
      this.setNextStatement(true, ['head_element', 'body_element'])
      this.setColour('#F7DF1E')
      this.setTooltip('Inline <script> tag — place JS blocks inside')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // INLINE TEXT SEMANTICS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_b'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<b').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('bold text'), 'TEXT')
          .appendField('</b>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Bold text (stylistic — no semantic meaning)')
    },
  }
 
  Blockly.Blocks['html_i'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<i').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('italic text'), 'TEXT')
          .appendField('</i>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Italic text (stylistic — use <em> for semantic emphasis)')
    },
  }
 
  Blockly.Blocks['html_mark'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<mark').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('highlighted text'), 'TEXT')
          .appendField('</mark>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Highlighted / marked text')
    },
  }
 
  Blockly.Blocks['html_small'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<small').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('fine print'), 'TEXT')
          .appendField('</small>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Smaller / side-note text')
    },
  }
 
  Blockly.Blocks['html_del'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<del').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('deleted text'), 'TEXT')
          .appendField('</del>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Strikethrough — marks deleted content')
    },
  }
 
  Blockly.Blocks['html_ins'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<ins').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('inserted text'), 'TEXT')
          .appendField('</ins>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Underline — marks inserted content')
    },
  }
 
  Blockly.Blocks['html_sub'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<sub').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('2'), 'TEXT')
          .appendField('</sub>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Subscript text (H₂O)')
    },
  }
 
  Blockly.Blocks['html_sup'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<sup').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('2'), 'TEXT')
          .appendField('</sup>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#4A90E2')
      this.setTooltip('Superscript text (x²)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // SECTIONING
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_aside'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<aside').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</aside>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#7B68EE')
      this.setTooltip('Sidebar / tangentially related content')
    },
  }
 
  Blockly.Blocks['html_address'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<address').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</address>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#7B68EE')
      this.setTooltip('Contact information block')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // DESCRIPTION LISTS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_dl'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<dl').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</dl>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#FF6B6B')
      this.setTooltip('Description list container')
    },
  }
 
  Blockly.Blocks['html_dt'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<dt').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Term'), 'TEXT')
          .appendField('</dt>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#FF6B6B')
      this.setTooltip('Description list term (the name)')
    },
  }
 
  Blockly.Blocks['html_dd'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<dd').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Definition goes here'), 'TEXT')
          .appendField('</dd>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#FF6B6B')
      this.setTooltip('Description list definition (the value)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // TABLE ADDITIONS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_caption'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<caption').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Table Caption'), 'TEXT')
          .appendField('</caption>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Table caption — must be the first child of <table>')
    },
  }
 
  Blockly.Blocks['html_colgroup'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<colgroup').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</colgroup>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Groups table columns for shared styling')
    },
  }
 
  Blockly.Blocks['html_col'] = {
    init: function () {
      this.appendValueInput('attributes')
          .appendField('<col span="')
          .appendField(new Blockly.FieldNumber(1, 1), 'SPAN')
          .appendField('"')
          .setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Defines properties for one or more table columns')
    },
  }
 
  Blockly.Blocks['html_thead'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<thead').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</thead>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Table header group (rows that form the column headings)')
    },
  }
 
  Blockly.Blocks['html_tbody'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<tbody').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</tbody>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Table body group (the main data rows)')
    },
  }
 
  Blockly.Blocks['html_tfoot'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<tfoot').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</tfoot>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#9B59B6')
      this.setTooltip('Table footer group (summary rows)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // FORM ADDITIONS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_fieldset'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<fieldset').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</fieldset>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Groups related form controls with a box')
    },
  }
 
  Blockly.Blocks['html_legend'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<legend').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Group Label'), 'TEXT')
          .appendField('</legend>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Caption / title for a <fieldset>')
    },
  }
 
  Blockly.Blocks['html_datalist'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<datalist id="')
          .appendField(new Blockly.FieldTextInput('my-suggestions'), 'ID')
          .appendField('">')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</datalist>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Pre-defined autocomplete options for an <input list="..."> element')
    },
  }
 
  Blockly.Blocks['html_optgroup'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<optgroup label="')
          .appendField(new Blockly.FieldTextInput('Group Name'), 'LABEL')
          .appendField('">')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</optgroup>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Groups <option> elements inside a <select>')
    },
  }
 
  Blockly.Blocks['html_progress'] = {
    init: function () {
      this.appendValueInput('attributes')
          .appendField('<progress value="')
          .appendField(new Blockly.FieldNumber(50, 0), 'VALUE')
          .appendField('" max="')
          .appendField(new Blockly.FieldNumber(100, 0), 'MAX')
          .appendField('"')
          .setCheck('attributes')
      this.appendDummyInput().appendField('></progress>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Progress bar indicator (e.g. file upload, task completion)')
    },
  }
 
  Blockly.Blocks['html_meter'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<meter value="')
          .appendField(new Blockly.FieldNumber(6, 0), 'VALUE')
          .appendField('" min="')
          .appendField(new Blockly.FieldNumber(0), 'MIN')
          .appendField('" max="')
          .appendField(new Blockly.FieldNumber(10), 'MAX')
          .appendField('" low="')
          .appendField(new Blockly.FieldNumber(3), 'LOW')
          .appendField('" high="')
          .appendField(new Blockly.FieldNumber(8), 'HIGH')
          .appendField('"></meter>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#20B2AA')
      this.setTooltip('Scalar gauge within a known range (e.g. disk usage, vote score)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // INTERACTIVE ELEMENTS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_details'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<details').setCheck('attributes')
      this.appendDummyInput().appendField('>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</details>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E67E22')
      this.setTooltip('Collapsible disclosure widget — add <summary> as first child')
    },
  }
 
  Blockly.Blocks['html_summary'] = {
    init: function () {
      this.appendValueInput('attributes').appendField('<summary').setCheck('attributes')
      this.appendDummyInput()
          .appendField('>')
          .appendField(new Blockly.FieldTextInput('Click to expand'), 'TEXT')
          .appendField('</summary>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E67E22')
      this.setTooltip('Visible heading for a <details> element')
    },
  }
 
  Blockly.Blocks['html_dialog'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<dialog id="')
          .appendField(new Blockly.FieldTextInput('my-dialog'), 'ID')
          .appendField('"')
          .appendField(new Blockly.FieldCheckbox(false), 'OPEN')
          .appendField('open>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</dialog>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E67E22')
      this.setTooltip('Native modal / non-modal dialog box. Check "open" to show on load.')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // EMBEDDED CONTENT
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_iframe'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<iframe src="')
          .appendField(new Blockly.FieldTextInput('https://example.com'), 'SRC')
          .appendField('" width="')
          .appendField(new Blockly.FieldTextInput('600'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('400'), 'HEIGHT')
          .appendField('" title="')
          .appendField(new Blockly.FieldTextInput('Embedded content'), 'TITLE')
          .appendField('"></iframe>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Inline frame — embeds another HTML page inside this one')
    },
  }
 
  Blockly.Blocks['html_embed'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<embed src="')
          .appendField(new Blockly.FieldTextInput('file.pdf'), 'SRC')
          .appendField('" type="')
          .appendField(new Blockly.FieldDropdown([
            ['application/pdf', 'application/pdf'],
            ['video/mp4', 'video/mp4'],
            ['audio/mpeg', 'audio/mpeg'],
            ['image/svg+xml', 'image/svg+xml'],
            ['application/x-shockwave-flash', 'application/x-shockwave-flash'],
          ]), 'TYPE')
          .appendField('" width="')
          .appendField(new Blockly.FieldTextInput('300'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('200'), 'HEIGHT')
          .appendField('">')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Embeds external content (PDF, plugin, etc.) — no fallback slot')
    },
  }
 
  Blockly.Blocks['html_object'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<object data="')
          .appendField(new Blockly.FieldTextInput('file.pdf'), 'DATA')
          .appendField('" type="')
          .appendField(new Blockly.FieldTextInput('application/pdf'), 'TYPE')
          .appendField('" width="')
          .appendField(new Blockly.FieldTextInput('300'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('200'), 'HEIGHT')
          .appendField('">')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</object>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Embeds external resource with fallback content inside')
    },
  }
 
  Blockly.Blocks['html_picture'] = {
    init: function () {
      this.appendDummyInput().appendField('<picture>')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</picture>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Responsive image container — add <source> blocks then end with <img>')
    },
  }
 
  Blockly.Blocks['html_source'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<source ')
          .appendField(new Blockly.FieldDropdown([
            ['srcset', 'srcset'],
            ['src', 'src'],
          ]), 'ATTR_TYPE')
          .appendField('="')
          .appendField(new Blockly.FieldTextInput('image.webp'), 'SRC')
          .appendField('" type="')
          .appendField(new Blockly.FieldTextInput('image/webp'), 'MIME')
          .appendField('" media="')
          .appendField(new Blockly.FieldTextInput('(min-width: 800px)'), 'MEDIA')
          .appendField('">')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Alternative media source for <picture>, <video>, or <audio>')
    },
  }
 
  Blockly.Blocks['html_track'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<track src="')
          .appendField(new Blockly.FieldTextInput('subtitles.vtt'), 'SRC')
          .appendField('" kind="')
          .appendField(new Blockly.FieldDropdown([
            ['subtitles', 'subtitles'],
            ['captions', 'captions'],
            ['descriptions', 'descriptions'],
            ['chapters', 'chapters'],
            ['metadata', 'metadata'],
          ]), 'KIND')
          .appendField('" srclang="')
          .appendField(new Blockly.FieldTextInput('en'), 'SRCLANG')
          .appendField('" label="')
          .appendField(new Blockly.FieldTextInput('English'), 'LABEL')
          .appendField('">')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#E74C3C')
      this.setTooltip('Text track for <video>/<audio> (subtitles, captions, chapters)')
    },
  }
 
  // ════════════════════════════════════════════════════════════════════════
  // GRAPHICS
  // ════════════════════════════════════════════════════════════════════════
 
  Blockly.Blocks['html_svg'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<svg width="')
          .appendField(new Blockly.FieldTextInput('200'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('200'), 'HEIGHT')
          .appendField('" viewBox="')
          .appendField(new Blockly.FieldTextInput('0 0 200 200'), 'VIEWBOX')
          .appendField('">')
      this.appendStatementInput('CONTENT').setCheck('body_element')
      this.appendDummyInput().appendField('</svg>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#27AE60')
      this.setTooltip('SVG vector graphics container')
    },
  }
 
  Blockly.Blocks['html_canvas'] = {
    init: function () {
      this.appendDummyInput()
          .appendField('<canvas id="')
          .appendField(new Blockly.FieldTextInput('myCanvas'), 'ID')
          .appendField('" width="')
          .appendField(new Blockly.FieldTextInput('400'), 'WIDTH')
          .appendField('" height="')
          .appendField(new Blockly.FieldTextInput('300'), 'HEIGHT')
          .appendField('"></canvas>')
      this.setPreviousStatement(true, 'body_element')
      this.setNextStatement(true, 'body_element')
      this.setColour('#27AE60')
      this.setTooltip('Canvas element — draw on it with JavaScript (getContext)')
    },
  }
  
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

};
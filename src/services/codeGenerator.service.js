import { expandReusableState } from '../blockly/reusableBlocks.js'
import { javascriptGenerator } from 'blockly/javascript';
import { Blockly } from '../blockly/core.js';
import { inlineScript } from '../blockly/jsSupport.js';

export const codeGeneratorService = {
  generateCodeFromState(state, filename) {
    if (!state) return '';
    const workspace = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load(expandReusableState(state), workspace);
      return this.generateCode(workspace, filename);
    } finally { workspace.dispose(); }
  },
  /**
   * Generate code based on file type
   */
  generateCode(workspace, filename) {
    if (!workspace) return '';
    if (workspace.getAllBlocks(false).some(b=>b.type==='webbed_reusable')) return this.generateCodeFromState(Blockly.serialization.workspaces.save(workspace),filename);
    
    const extension = this.getFileExtension(filename);
    const originalFinish = javascriptGenerator.finish;
    const previousNames = javascriptGenerator.nameDB_;
    javascriptGenerator.webbedDeclarations = new Set(workspace.getAllBlocks(false)
      .filter(block => ['js_let', 'js_const', 'js_var_decl'].includes(block.type)
        && (!block.getSurroundParent() || ['js_script_body', 'js_script_head', 'html_script_inline'].includes(block.getSurroundParent().type)))
      .map(block => block.getFieldValue('NAME')));
    const customFunctions = workspace.getAllBlocks(false)
      .filter(block => ['js_function_def', 'js_arrow_function', 'js_async_function'].includes(block.type))
      .map(block => block.getFieldValue('NAME'));
    javascriptGenerator.nameDB_ = new Blockly.Names(`${javascriptGenerator.RESERVED_WORDS_},${[...javascriptGenerator.webbedDeclarations, ...customFunctions].join(',')}`);
    javascriptGenerator.finish = function (body) {
      if (this.definitions_.variables) {
        const shared = new Set(workspace.getVariableMap().getAllVariables()
          .filter(variable => this.webbedDeclarations.has(variable.name))
          .map(variable => this.nameDB_.getName(variable.getId(), Blockly.Names.NameType.VARIABLE)));
        const names = this.definitions_.variables.replace(/^var\s+/, '').replace(/;\s*$/, '').split(',').map(name => name.trim())
          .filter(name => !shared.has(name));
        this.definitions_.variables = names.length ? `var ${names.join(', ')};` : '';
      }
      if (extension !== 'html') return originalFinish.call(this, body);
      const definitions = Object.values(this.definitions_).filter(Boolean).join('\n\n');
      this.definitions_ = Object.create(null);
      const html = originalFinish.call(this, body);
      if (!definitions) return html;
      const prelude = inlineScript(definitions) + '\n';
      return /<script\b(?![^>]*\bsrc=)[^>]*>/i.test(html)
        ? html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>/i, tag => `${tag}\n${prelude}`)
        : `<script>\n${prelude}</script>\n${html}`;
    };
    let code;
    try { code = javascriptGenerator.workspaceToCode(workspace); }
    finally { javascriptGenerator.finish = originalFinish; javascriptGenerator.nameDB_ = previousNames; delete javascriptGenerator.webbedDeclarations; }
    
    // Return raw code - NO TEMPLATES, NO AUTO-INJECTION
    switch (extension) {
      case 'html':
        return code;
      case 'css':
        return code.replace(/^[\t ]*<\/?style\b[^>\r\n]*>[\t ]*$/gim, '').trim();
      case 'js':
        return code.replace(/^[\t ]*<\/?script\b[^>\r\n]*>[\t ]*$/gim, '').trim();
      default:
        return code;
    }
  },

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },

  /**
   * Combine files for preview - ONLY replace external references, NO AUTO-INJECTION
   */
  combineFilesForPreview(files, activeFilename) {
    const htmlFiles = files.filter(f => this.getFileExtension(f.filename) === 'html');
    const cssFiles = files.filter(f => this.getFileExtension(f.filename) === 'css');
    const jsFiles = files.filter(f => this.getFileExtension(f.filename) === 'js');

    // Find the HTML file to show
    let activeHtml = htmlFiles.find(f => f.filename === activeFilename);
    if (!activeHtml) {
      activeHtml = htmlFiles.find(f => f.filename === 'index.html') || htmlFiles[0];
    }

    if (!activeHtml) {
      return '<html>\n  <body>\n    <p>No HTML file to preview</p>\n  </body>\n</html>';
    }

    let htmlCode = activeHtml.generatedCode || '';

    // ONLY replace external file references with actual content
    // Do NOT auto-inject anything
    
    // Replace CSS file references
    cssFiles.forEach(css => {
      const escaped = css.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linkPattern = new RegExp(`<link\\b[^>]*href=["'](?:\\./)?${escaped}["'][^>]*>`, 'gi');
      if (htmlCode.match(linkPattern)) {
        const styleTag = `<style>\n${css.generatedCode || ''}\n</style>`;
        htmlCode = htmlCode.replace(linkPattern, () => styleTag);
      }
    });

    // Replace JS file references
    jsFiles.forEach(js => {
      const escaped = js.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const scriptPattern = new RegExp(`<script\\b[^>]*src=["'](?:\\./)?${escaped}["'][^>]*>\\s*</script>`, 'gi');
      if (htmlCode.match(scriptPattern)) {
        htmlCode = htmlCode.replace(scriptPattern, tag => {
          const content = inlineScript(js.generatedCode || '');
          const module = /\btype=["']module["']/i.test(tag);
          const deferred = !module && /\bdefer\b/i.test(tag);
          return `<script${module ? ' type="module"' : ''}>\n${deferred ? `document.addEventListener('DOMContentLoaded', function() {\n${content}\n});` : content}\n</script>`;
        });
      }
    });

    return htmlCode;
  },

  /**
   * Get list of HTML files for navigation
   */
  getHtmlFilesList(files) {
    return files
      .filter(f => this.getFileExtension(f.filename) === 'html')
      .map(f => ({ id: f.id, filename: f.filename }));
  }
};

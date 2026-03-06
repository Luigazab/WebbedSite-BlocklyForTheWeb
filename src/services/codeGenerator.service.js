import { javascriptGenerator } from 'blockly/javascript';

export const codeGeneratorService = {
  /**
   * Generate code based on file type
   */
  generateCode(workspace, filename) {
    if (!workspace) return '';
    
    const code = javascriptGenerator.workspaceToCode(workspace);
    const extension = this.getFileExtension(filename);
    
    // Return raw code - NO TEMPLATES, NO AUTO-INJECTION
    switch (extension) {
      case 'html':
        return code;
      case 'css':
        return code.replace(/<[^>]*>/g, '').trim();
      case 'js':
        return code.replace(/<[^>]*>/g, '').trim();
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
      return '<html><body><p>No HTML file to preview</p></body></html>';
    }

    let htmlCode = activeHtml.generatedCode || '';

    // ONLY replace external file references with actual content
    // Do NOT auto-inject anything
    
    // Replace CSS file references
    cssFiles.forEach(css => {
      const linkPattern = new RegExp(`<link[^>]*href="${css.filename}"[^>]*>`, 'g');
      if (htmlCode.match(linkPattern)) {
        const styleTag = `<style>\n${css.generatedCode || ''}\n</style>`;
        htmlCode = htmlCode.replace(linkPattern, styleTag);
      }
    });

    // Replace JS file references
    jsFiles.forEach(js => {
      const scriptPattern = new RegExp(`<script[^>]*src="${js.filename}"[^>]*></script>`, 'g');
      if (htmlCode.match(scriptPattern)) {
        const scriptTag = `<script>\n${js.generatedCode || ''}\n</script>`;
        htmlCode = htmlCode.replace(scriptPattern, scriptTag);
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
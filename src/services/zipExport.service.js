import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { codeGeneratorService } from './codeGenerator.service';

export const zipExportService = {
  /**
   * Export project as ZIP
   */
  async exportProjectAsZip(projectTitle, projectDescription, files) {
    const zip = new JSZip();

    // Add README.md
    const readme = this.generateReadme(projectTitle, projectDescription);
    zip.file('README.md', readme);

    // Add each file with generated code
    files.forEach(file => {
      const code = file.generatedCode || '';
      zip.file(file.filename, code);
    });

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
    saveAs(blob, zipFilename);
  },

  /**
   * Generate README content
   */
  generateReadme(title, description) {
    return `# ${title}

${description || 'No description provided.'}

## Project Files

This project was created using a block-based web editor.

## How to Use

1. Extract this ZIP file
2. Open \`index.html\` in your web browser
3. Navigate between pages using the links provided

## Files Included

- HTML files: Main web pages
- CSS files: Styling
- JS files: Interactive functionality

---

Created with WebbedSite Editor
`;
  }
};
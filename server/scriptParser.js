const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts plain text from a script file (pdf, docx, txt, md, json)
 * or returns raw text if provided directly.
 */
async function extractScriptText(fileOrText, originalFilename = '') {
  // If string is already provided and doesn't look like a file path
  if (typeof fileOrText === 'string') {
    return fileOrText.trim();
  }

  if (!fileOrText || !fileOrText.path) {
    throw new Error('No script content or file provided');
  }

  const filePath = fileOrText.path;
  const ext = (path.extname(originalFilename || fileOrText.originalname || filePath) || '').toLowerCase();

  const buffer = await fs.readFile(filePath);

  if (ext === '.pdf') {
    const pdfData = await pdfParse(buffer);
    return pdfData.text.trim();
  }

  if (ext === '.docx') {
    const docxResult = await mammoth.extractRawText({ buffer });
    return docxResult.value.trim();
  }

  // Fallback to UTF-8 text for .txt, .md, .json, or unspecified
  return buffer.toString('utf-8').trim();
}

module.exports = {
  extractScriptText,
};

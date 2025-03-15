import mammoth from 'mammoth';
import JSZip from 'jszip';

export interface ConversionResult {
  html: string;
  success: boolean;
  logs: string[];
  error?: string;
  debugInfo?: any;
}

export interface ColorContext {
  type: string;
  color: string;
  text: string;
  fullContext: string;
  id: string;
}

interface MatchResult {
  success: number;
  notFound: number;
  details: Array<{
    id: string;
    success: boolean;
    elementCount: number;
    text: string;
  }>;
}


// Extract colors and their context from DOCX file
const extractColorContext = async (arrayBuffer: ArrayBuffer): Promise<{ colorContexts: ColorContext[], logMessages: string[] }> => {
  try {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(arrayBuffer);
    
    const documentXml = await zipContents.file('word/document.xml')?.async('text');
    if (!documentXml) {
      return { colorContexts: [], logMessages: ['Could not find document.xml'] };
    }
    
    const colorContexts: ColorContext[] = [];
    const logMessages: string[] = [];
    
    logMessages.push("STEP 1: Extracting color context from DOCX");
    
    // Find runs with text color
    const textColorRegex = /<w:r\b[^>]*>(?:(?!<\/w:r>).)*?<w:color\b[^>]*w:val="([^"]+)"[^>]*>(?:(?!<\/w:r>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:r>).)*?<\/w:r>/gs;
    let colorContextCount = 0;
    
    let match;
    while ((match = textColorRegex.exec(documentXml)) !== null) {
      const [fullMatch, colorValue, textContent] = match;
      if (colorValue !== '000000') {
        colorContexts.push({
          type: 'text-color',
          color: colorValue,
          text: textContent.trim(),
          fullContext: fullMatch.substring(0, 100) + '...',
          id: `text-color-${colorContextCount++}`
        });
        logMessages.push(`Found text with color #${colorValue}: "${textContent.trim().substring(0, 30)}..."`);
      }
    }
    
    // Find paragraphs with shading
    const shadingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>).)*?<w:shd\b[^>]*w:fill="([^"]+)"[^>]*>(?:(?!<\/w:p>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:p>).)*?<\/w:p>/gs;
    let shadingContextCount = 0;
    
    while ((match = shadingRegex.exec(documentXml)) !== null) {
      const [fullMatch, fillColor, textSample] = match;
      if (fillColor !== 'auto' && fillColor !== '000000') {
        colorContexts.push({
          type: 'paragraph-shading',
          color: fillColor,
          text: textSample.trim(),
          fullContext: fullMatch.substring(0, 100) + '...',
          id: `paragraph-shading-${shadingContextCount++}`
        });
        logMessages.push(`Found paragraph with shading #${fillColor}: "${textSample.trim().substring(0, 30)}..."`);
      }
    }
    
    // Find table elements with background colors
    const tableRegex = {
      row: /<w:tr\b[^>]*>(?:(?!<\/w:tr>).)*?<w:shd\b[^>]*w:fill="([^"]+)"[^>]*>(?:(?!<\/w:tr>).)*?<\/w:tr>/gs,
      cell: /<w:tc\b[^>]*>(?:(?!<\/w:tc>).)*?<w:shd\b[^>]*w:fill="([^"]+)"[^>]*>(?:(?!<\/w:tc>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:tc>).)*?<\/w:tc>/gs
    };
    
    let [rowBgCount, cellBgCount] = [0, 0];
    
    // Process table rows
    while ((match = tableRegex.row.exec(documentXml)) !== null) {
      const [fullMatch, fillColor] = match;
      if (fillColor !== 'auto' && fillColor !== '000000') {
        const rowTextMatch = /<w:t[^>]*>([^<]+)<\/w:t>/g.exec(fullMatch);
        const rowText = rowTextMatch ? rowTextMatch[1].trim() : `Row ${rowBgCount + 1}`;
        
        colorContexts.push({
          type: 'table-row-background',
          color: fillColor,
          text: rowText,
          fullContext: fullMatch.substring(0, 100) + '...',
          id: `tr-bg-${rowBgCount++}`
        });
        logMessages.push(`Found table row with background #${fillColor} containing text: "${rowText.substring(0, 30)}..."`);
      }
    }
    
    // Process table cells
    while ((match = tableRegex.cell.exec(documentXml)) !== null) {
      const [fullMatch, fillColor, cellText] = match;
      if (fillColor !== 'auto' && fillColor !== '000000') {
        colorContexts.push({
          type: 'table-cell-background',
          color: fillColor,
          text: cellText.trim(),
          fullContext: fullMatch.substring(0, 100) + '...',
          id: `td-bg-${cellBgCount++}`
        });
        logMessages.push(`Found table cell with background #${fillColor} containing text: "${cellText.trim().substring(0, 30)}..."`);
      }
    }
    
    logMessages.push(`STEP 1 COMPLETE: Found ${colorContexts.length} items with color context`);
    return { colorContexts, logMessages };
    
  } catch (error: unknown) {
    console.error('Error extracting color context:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { colorContexts: [], logMessages: ['Error extracting color context: ' + errorMessage] };
  }
};

// Match and apply colors to HTML elements
const matchAndApplyColors = (html: string, colorContexts: ColorContext[]): { html: string; matchResults: MatchResult; logMessages: string[] } => {
  if (!colorContexts || colorContexts.length === 0) {
    return { html, matchResults: { success: 0, notFound: 0, details: [] }, logMessages: ['No color contexts to apply'] };
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const logMessages: string[] = [];
  logMessages.push("STEP 3: Matching and applying colors to HTML elements");
  
  const matchResults: MatchResult = {
    success: 0,
    notFound: 0,
    details: []
  };
  
  const coloredElements = new Set<Element>();
  
  // Sort color contexts by specificity (longer text = more specific)
  const sortedColorContexts = [...colorContexts].sort((a, b) => b.text.length - a.text.length);
  
  // Helper functions for finding elements
  const findElementsByExactText = (text: string, elementTypes = ['*']) => {
    const results: HTMLElement[] = [];
    for (const type of elementTypes) {
      const elements = tempDiv.querySelectorAll(type);
      for (const element of elements) {
        if (coloredElements.has(element)) continue;
        if (element.textContent?.trim() === text.trim()) {
          results.push(element as HTMLElement);
        }
      }
    }
    return results;
  };
  
  const findElementsContainingText = (text: string, elementTypes = ['*']) => {
    const results: HTMLElement[] = [];
    for (const type of elementTypes) {
      const elements = tempDiv.querySelectorAll(type);
      for (const element of elements) {
        if (coloredElements.has(element)) continue;
        if (text.length < 10) {
          const regex = new RegExp(`\\b${text.trim()}\\b`, 'i');
          if (element.textContent && regex.test(element.textContent)) {
            results.push(element as HTMLElement);
          }
        } else if (element.textContent && element.textContent.includes(text.trim())) {
          results.push(element as HTMLElement);
        }
      }
    }
    return results;
  };
  
  // Process each color context
  sortedColorContexts.forEach(context => {
    const { type, color, text, id } = context;
    let targetElements: HTMLElement[] = [];
    
    switch (type) {
      case 'text-color':
        targetElements = findElementsByExactText(text, ['span', 'strong', 'em', 'b', 'i']);
        if (targetElements.length === 0) {
          targetElements = findElementsByExactText(text);
        }
        if (targetElements.length === 0) {
          // Create spans for matched text
          const textNodes: Node[] = [];
          const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);
          let node;
          while ((node = walk.nextNode())) {
            if (node.textContent && node.textContent.includes(text)) {
              textNodes.push(node);
            }
          }
          
          textNodes.forEach(textNode => {
            if (textNode.textContent) {
              const parent = textNode.parentNode;
              if (!parent) return;
              
              const newContent = textNode.textContent.replace(
                text,
                `<span class="docx-colored" data-color="${color}">${text}</span>`
              );
              
              const tempEl = document.createElement('div');
              tempEl.innerHTML = newContent;
              
              while (tempEl.firstChild) {
                parent.insertBefore(tempEl.firstChild, textNode);
              }
              parent.removeChild(textNode);
              
              const newSpan = tempDiv.querySelector(`span.docx-colored[data-color="${color}"]`) as HTMLElement | null;
              if (newSpan) {
                targetElements.push(newSpan);
                coloredElements.add(newSpan);
              }
            }
          });
        }
        break;
        
      case 'paragraph-shading':
        targetElements = findElementsByExactText(text, ['p']);
        if (targetElements.length === 0) {
          targetElements = findElementsContainingText(text, ['p']);
        }
        break;
        
      case 'table-row-background':
        targetElements = Array.from(tempDiv.querySelectorAll('tr')).filter(tr => 
          !coloredElements.has(tr) && tr.textContent && tr.textContent.includes(text.trim())
        ) as HTMLElement[];
        break;
        
      case 'table-cell-background':
        targetElements = findElementsByExactText(text, ['td', 'th']);
        if (targetElements.length === 0) {
          targetElements = Array.from(tempDiv.querySelectorAll('td, th')).filter(cell =>
            !coloredElements.has(cell) && cell.textContent && cell.textContent.includes(text.trim())
          ) as HTMLElement[];
        }
        break;
    }
    
    // Apply styles to found elements
    if (targetElements.length > 0) {
      targetElements.forEach(element => {
        coloredElements.add(element);
        
        if (type === 'text-color') {
          element.style.color = `#${color}`;
          element.setAttribute('data-text-color-applied', color);
        } else {
          element.style.backgroundColor = `#${color}`;
          if (type === 'paragraph-shading') {
            element.style.padding = '8px';
          }
          element.setAttribute('data-bg-color-applied', color);
        }
      });
      
      logMessages.push(`✅ Success: Applied ${type} #${color} to ${targetElements.length} elements matching "${text.substring(0, 30)}..."`);
      matchResults.success++;
      matchResults.details.push({
        id,
        success: true,
        elementCount: targetElements.length,
        text: text.substring(0, 30) + '...'
      });
    } else {
      logMessages.push(`❌ Not Found: Could not find elements for ${type} with text "${text.substring(0, 30)}..."`);
      matchResults.notFound++;
      matchResults.details.push({
        id,
        success: false,
        elementCount: 0,
        text: text.substring(0, 30) + '...'
      });
    }
  });
  
  logMessages.push(`STEP 3 COMPLETE: Successfully applied ${matchResults.success} colors, failed to find elements for ${matchResults.notFound} contexts`);
  
  return { html: tempDiv.innerHTML, matchResults, logMessages };
};

// Main conversion function
export const convertDocxToHtml = async (file: File): Promise<ConversionResult> => {
  const allLogMessages: string[] = [];
  try {
    allLogMessages.push(`Processing file: ${file.name} (${file.size} bytes)`);
    
    const arrayBuffer = await file.arrayBuffer();
    
    // STEP 1: Extract color contexts
    const { colorContexts, logMessages: extractLogMessages } = await extractColorContext(arrayBuffer);
    allLogMessages.push(...extractLogMessages);
    
    // STEP 2: Convert DOCX to HTML
    allLogMessages.push("STEP 2: Converting DOCX to HTML");
    
    const result = await mammoth.convertToHtml(
      { arrayBuffer: arrayBuffer },
      {
        includeDefaultStyleMap: true,
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
          "p[style-name='Heading 3'] => h4:fresh",
          "p[style-name='Quote'] => blockquote:fresh"
        ],
        // preserveStyles: true,
        convertImage: mammoth.images.imgElement((image) => {
          return image.read("base64").then((imageBuffer) => ({
            src: `data:${image.contentType};base64,${imageBuffer}`,
            style: "max-width: 100%; height: auto;"
          }));
        })
      }
    );
    
    allLogMessages.push(`STEP 2 COMPLETE: Generated HTML with ${result.value.length} characters`);
    
    if (result.messages.length > 0) {
      allLogMessages.push("Conversion messages:");
      result.messages.forEach(msg => allLogMessages.push(`- ${msg.message}`));
    }
    
    // STEP 3: Match and apply colors
    const { html: coloredHtml, matchResults, logMessages: matchLogMessages } = 
      matchAndApplyColors(result.value, colorContexts);
    
    allLogMessages.push(...matchLogMessages);
    
    // Create the final HTML with styles
    const finalHtml = `
      <style>
        .docx-content {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 100%;
          padding: 20px;
          background: inherit;
          color: inherit;
          direction: rtl;
          text-align: right;
        }
        .docx-content * {
          max-width: 100%;
          word-wrap: break-word;
          color: inherit;
          background-color: inherit;
        }
        .docx-content *[style*="color:"],
        .docx-content *[style*="background-color:"],
        .docx-content *[data-text-color-applied],
        .docx-content *[data-bg-color-applied] {
          /* Preserve explicitly colored elements */
        }
        .docx-content h1 { font-size: 2em; margin: 1em 0; }
        .docx-content h2 { font-size: 1.5em; margin: 0.83em 0; }
        .docx-content h3 { font-size: 1.17em; margin: 1em 0; }
        .docx-content p { margin: 1em 0; }
        .docx-content img { 
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          display: block;
        }
        .docx-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          border-color: currentColor;
        }
        .docx-content td, .docx-content th {
          border: 1px solid currentColor;
          border-opacity: 0.2;
          padding: 8px;
        }
        .docx-content tr[data-bg-color-applied], 
        .docx-content td[data-bg-color-applied], 
        .docx-content th[data-bg-color-applied] {
          background-color: attr(data-bg-color-applied);
        }
        .docx-content blockquote {
          margin: 1em 0;
          padding: 1em;
          border-right: 4px solid rgba(currentColor, 0.2);
          background-color: rgba(currentColor, 0.05);
        }
        .docx-content ul, .docx-content ol {
          margin: 1em 0;
          padding-right: 2em;
          padding-left: 0;
        }
        .docx-content .docx-colored {
          display: inline;
        }
      </style>
      <div class="docx-content theme-adaptive" dir="rtl">
        ${coloredHtml}
      </div>
    `;
    
    return {
      html: finalHtml,
      success: true,
      logs: allLogMessages,
      debugInfo: {
        conversionSuccess: true,
        contentLength: coloredHtml.length,
        colorContexts: colorContexts.length,
        matchResults,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error: unknown) {
    console.error("Error processing document:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      html: '',
      success: false,
      logs: [...allLogMessages, `Error: ${errorMessage}`],
      error: errorMessage,
      debugInfo: {
        error: errorMessage,
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      }
    };
  }
}; 
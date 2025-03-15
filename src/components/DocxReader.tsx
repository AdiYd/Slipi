import React, { useState,  useRef } from 'react';
import mammoth from 'mammoth';
import { Card, Typography, message } from 'antd';
import JSZip from 'jszip';

const { Title } = Typography;

// Add this interface above the matchAndApplyColors function
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

function WordToHtml() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colorData, setColorData] = useState<any[]>([]);
  const [processingLog, setProcessingLog] = useState<string[]>([]);

  // STEP 1: Extract colors and their context
  const extractColorContext = async (arrayBuffer: ArrayBuffer) => {
    try {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(arrayBuffer);
      
      // Get document.xml
      const documentXml = await zipContents.file('word/document.xml')?.async('text');
      if (!documentXml) {
        console.log('Could not find document.xml');
        return { colorContexts: [], logMessages: ['Could not find document.xml'] };
      }
      
      const colorContexts = [];
      const logMessages = [];
      
      logMessages.push("STEP 1: Extracting color context from DOCX");
      
      // Find runs with text color
      const textColorRegex = /<w:r\b[^>]*>(?:(?!<\/w:r>).)*?<w:color\b[^>]*w:val="([^"]+)"[^>]*>(?:(?!<\/w:r>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:r>).)*?<\/w:r>/gs;
      
      let match;
      let colorContextCount = 0;
      
      while ((match = textColorRegex.exec(documentXml)) !== null) {
        const [fullMatch, colorValue, textContent] = match;
        if (colorValue !== '000000') { // Skip default black
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
      
      // Find table row background colors
      const tableRowRegex = /<w:tr\b[^>]*>(?:(?!<\/w:tr>).)*?<w:shd\b[^>]*w:fill="([^"]+)"[^>]*>(?:(?!<\/w:tr>).)*?<\/w:tr>/gs;
      let rowBgCount = 0;
      
      while ((match = tableRowRegex.exec(documentXml)) !== null) {
        const [fullMatch, fillColor] = match;
        if (fillColor !== 'auto' && fillColor !== '000000') {
          // Extract some text from the row to help identify it
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
      
      // Find table cell background colors
      const tableCellRegex = /<w:tc\b[^>]*>(?:(?!<\/w:tc>).)*?<w:shd\b[^>]*w:fill="([^"]+)"[^>]*>(?:(?!<\/w:tc>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:tc>).)*?<\/w:tc>/gs;
      let cellBgCount = 0;
      
      while ((match = tableCellRegex.exec(documentXml)) !== null) {
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
      
      // Find headings (style elements that might need coloring)
      const headingRegex = /<w:p\b[^>]*>(?:(?!<\/w:p>).)*?<w:pStyle\b[^>]*w:val="([^"]+)"[^>]*>(?:(?!<\/w:p>).)*?<w:t[^>]*>([^<]+)<\/w:t>(?:(?!<\/w:p>).)*?<\/w:p>/gs;
      
      let headingContextCount = 0;
      
      while ((match = headingRegex.exec(documentXml)) !== null) {
        const [fullMatch, styleValue, textContent] = match;
        if (styleValue.includes('Heading') || styleValue.includes('Title')) {
          colorContexts.push({
            type: 'heading',
            style: styleValue,
            color: '8DB3E2', // Default blue for headings (can be overridden if specific color found)
            text: textContent.trim(),
            fullContext: fullMatch.substring(0, 100) + '...',
            id: `heading-${headingContextCount++}`
          });
          logMessages.push(`Found heading with style "${styleValue}": "${textContent.trim().substring(0, 30)}..."`);
        }
      }
      
      // Look for specific blue shading if it exists
      if (documentXml.includes('w:fill="8DB3E2"')) {
        logMessages.push("Found blue shading color #8DB3E2 in the document");
      }
      
      logMessages.push(`STEP 1 COMPLETE: Found ${colorContexts.length} items with color context`);
      
      return { colorContexts, logMessages };
    } catch (error: unknown) {
      console.error('Error extracting color context:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { colorContexts: [], logMessages: ['Error extracting color context: ' + errorMessage] };
    }
  };

  // STEP 3: Match and apply colors
  const matchAndApplyColors = (html: string, colorContexts: any[]) => {
    if (!colorContexts || colorContexts.length === 0) {
      return { html, logMessages: ['No color contexts to apply'] };
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const logMessages = [];
    logMessages.push("STEP 3: Matching and applying colors to HTML elements");
    
    const matchResults: MatchResult = {
      success: 0,
      notFound: 0,
      details: []
    };
    
    // Track which elements have already been colored to avoid duplicates
    const coloredElements = new Set<Element>();
    
    // Process color contexts in order of specificity (most specific first)
    // Sort by text length (longer texts are more specific)
    const sortedColorContexts = [...colorContexts].sort((a, b) => {
      // Prioritize exact phrase matches over partial ones
      return b.text.length - a.text.length;
    });

    // Helper function to find elements with EXACT text content
    const findElementsByExactText = (text: string, elementTypes = ['*']) => {
      const results: HTMLElement[] = [];
      
      for (const type of elementTypes) {
        const elements = tempDiv.querySelectorAll(type);
        
        for (const element of elements) {
          // Skip elements that already have colors applied
          if (coloredElements.has(element)) continue;
          
          // Check for exact text match
          if (element.textContent?.trim() === text.trim()) {
            results.push(element as HTMLElement);
          }
        }
      }
      
      return results;
    };
    
    // Helper function to find elements containing the text
    const findElementsContainingText = (text: string, elementTypes = ['*']) => {
      const results: HTMLElement[] = [];
      
      for (const type of elementTypes) {
        const elements = tempDiv.querySelectorAll(type);
        
        for (const element of elements) {
          // Skip elements that already have colors applied
          if (coloredElements.has(element)) continue;
          
          // For shorter texts (less than 10 chars), require a word boundary match
          // to avoid matching substrings of other words
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

    // Helper function specifically for finding table elements containing text
    const findTableElementsByContent = (text: string, elementType: string) => {
      const results: HTMLElement[] = [];
      const elements = tempDiv.querySelectorAll(elementType);
      
      for (const element of elements) {
        // Skip elements that already have colors applied
        if (coloredElements.has(element)) continue;
        
        if (element.textContent && element.textContent.includes(text.trim())) {
          results.push(element as HTMLElement);
        }
      }
      
      return results;
    };
    
    // Process each color context
    sortedColorContexts.forEach(context => {
      const { type, color, text, id } = context;
      
      let targetElements: HTMLElement[] = [];
      let targetSelectors: string[] = [];
      
      // Determine appropriate elements to look for based on context type
      if (type === 'heading') {
        targetSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        // Try exact match first
        targetElements = findElementsByExactText(text, targetSelectors);
        
        // If nothing found with exact match, try contains
        if (targetElements.length === 0) {
          targetElements = findElementsContainingText(text, targetSelectors);
        }
      } else if (type === 'paragraph-shading') {
        targetSelectors = ['p'];
        // For paragraph shading, try exact match first
        targetElements = findElementsByExactText(text, targetSelectors);
        
        // If exact match failed, try contains
        if (targetElements.length === 0) {
          targetElements = findElementsContainingText(text, targetSelectors);
        }
      } else if (type === 'table-row-background') {
        // For table rows, find tr elements containing our sample text
        targetElements = findTableElementsByContent(text, 'tr');
      } else if (type === 'table-cell-background') {
        // For table cells, find td elements with exact text match first
        targetElements = findElementsByExactText(text, ['td', 'th']);
        
        // If no exact match, try contains
        if (targetElements.length === 0) {
          targetElements = findTableElementsByContent(text, 'td, th');
        }
      } else if (type === 'text-color') {
        // For text color, we need more precision
        // First look for exact text matches in spans/small elements
        targetElements = findElementsByExactText(text, ['span', 'strong', 'em', 'b', 'i']);
        
        // If no match, try to find any element with exact text match
        if (targetElements.length === 0) {
          targetElements = findElementsByExactText(text);
        }
        
        // If still no match, try to create precise spans for the matched text
        if (targetElements.length === 0) {
          // Find text nodes containing the exact text
          const textNodes: Node[] = [];
          const walk = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while ((node = walk.nextNode())) {
            if (node.textContent && node.textContent.includes(text)) {
              textNodes.push(node);
            }
          }
          
          // Process text nodes - replace the matched text with a span
          textNodes.forEach(textNode => {
            if (textNode.textContent) {
              const parent = textNode.parentNode;
              if (!parent) return;
              
              // Create a span for just the matched text
              const newContent = textNode.textContent.replace(
                text, 
                `<span class="docx-colored" data-color="${color}">${text}</span>`
              );
              
              // Replace the text node with our HTML
              const tempEl = document.createElement('div');
              tempEl.innerHTML = newContent;
              
              // Replace the original text node with our new elements
              while (tempEl.firstChild) {
                parent.insertBefore(tempEl.firstChild, textNode);
              }
              
              // Remove the original text node
              parent.removeChild(textNode);
              
              // Find our newly created span
              const newSpan = tempDiv.querySelector(`span.docx-colored[data-color="${color}"]`) as HTMLElement | null;
              if (newSpan) {
                targetElements.push(newSpan);
                // Add our dynamically created span to the colored elements set
                coloredElements.add(newSpan);
              }
            }
          });
        }
      }
      
      // Apply styles to found elements
      if (targetElements.length > 0) {
        targetElements.forEach(element => {
          // Add element to the set of colored elements to avoid duplicate coloring
          coloredElements.add(element);
          
          if (type === 'text-color') {
            element.style.color = `#${color}`;
            // Add a data attribute to help with debugging/logging
            element.setAttribute('data-text-color-applied', color);
          } else {
            element.style.backgroundColor = `#${color}`;
            
            // Add padding only to paragraphs and headings, not table cells or rows
            if (type === 'paragraph-shading' || type === 'heading') {
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setHtmlContent('');
      setColorData([]);
      setProcessingLog([]);
      
      const allLogMessages = [];

      allLogMessages.push(`Processing file: ${file.name} (${file.size} bytes)`);
      
      const arrayBuffer = await file.arrayBuffer();
      
      // STEP 1: Extract color contexts
      const { colorContexts, logMessages: extractLogMessages } = await extractColorContext(arrayBuffer) as {
        colorContexts: any[];
        logMessages: string[];
      };
      allLogMessages.push(...extractLogMessages);
      
      // Set color data for display
      setColorData(colorContexts.map((ctx: any) => ({
        type: ctx.type,
        value: ctx.color,
        text: ctx.text.substring(0, 30)
      })));
      
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
          // @ts-ignore - preserveStyles is not in the type definitions but is accepted by mammoth
          preserveStyles: true,
          convertImage: mammoth.images.imgElement((image) => {
            return image.read("base64").then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`,
                style: "max-width: 100%; height: auto;"
              };
            });
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
      
      // Update state with results
      setProcessingLog(allLogMessages);
      
      // Create an HTML representation of the logs
      const logHtml = `
        <div style="border: 0.8px solid #ccc; border-radius: 10px; padding: 10px; margin-bottom: 20px;  text-align: left; direction: ltr; font-family: monospace; white-space: pre-wrap;">
          <h3>Color Processing Log:</h3>
          <div style="max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #ddd;">
            ${allLogMessages.map(msg => {
              if (msg.startsWith('STEP')) {
                return `<strong style="color: #0066cc;">${msg}</strong>`;
              } else if (msg.includes('Success')) {
                return `<span style="color: green;">${msg}</span>`;
              } else if (msg.includes('Not Found') || msg.includes('Error')) {
                return `<span style="color: red;">${msg}</span>`;
              } else {
                return msg;
              }
            }).join('<br>')}
          </div>
          <div style="margin-top: 10px;">
            <strong>Summary:</strong> Found ${colorContexts.length} color contexts, 
            successfully applied ${matchResults?.success || 0} colors, 
            failed to match ${matchResults?.notFound || 0} contexts.
            </div>
          </div>
        `;
        
      // Add custom styles to HTML
      const finalHtml = `
        <style>
          .docx-content {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 100%;
            padding: 20px;
            /* Inherit background from parent for theme support */
            background: inherit;
            color: inherit; /* Inherit text color from parent */
            direction: rtl;
            text-align: right;
          }
          .docx-content * {
            max-width: 100%;
            word-wrap: break-word;
            /* Inherit colors by default, unless explicitly styled */
            color: inherit;
            background-color: inherit;
          }
          /* Preserve explicitly colored elements */
          .docx-content *[style*="color:"] {
            /* Keep explicit colors */
          }
          .docx-content *[style*="background-color:"] {
            /* Keep explicit background colors */
          }
          /* Preserve data attribute colored elements */
          .docx-content *[data-text-color-applied] {
            /* These already have inline styles applied */
          }
          .docx-content *[data-bg-color-applied] {
            /* These already have inline styles applied */
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
            /* Make table borders adapt to theme */
            border-color: currentColor;
          }
          .docx-content td, .docx-content th {
            border: 1px solid currentColor;
            border-opacity: 0.2;
            padding: 8px;
          }
          /* Ensure table backgrounds are visible */
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
          /* Add highlight style for docx-colored spans */
          .docx-content .docx-colored {
            display: inline;
          }
        </style>
        <div class="docx-content theme-adaptive" dir="rtl">
        ${coloredHtml}
        </div>
        ${logHtml}
      `;

      setHtmlContent(finalHtml);
      
      // Store debug info
      setDebugInfo({
        conversionSuccess: true,
        contentLength: coloredHtml.length,
        colorContexts: colorContexts.length,
        matchResults,
        timestamp: new Date().toISOString()
      });

    } catch (error: unknown) {
      console.error("Error processing document:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setProcessingLog(prev => [...prev, `Error: ${errorMessage}`]);
      setDebugInfo({
        error: errorMessage,
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      });
      message.error('Error processing document: ' + errorMessage);
    } finally {
      setLoading(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
        <Card className='card*'>
            <Title level={5}>העלאת קובץ וורד</Title>
            <div className='flex flex-col gap-4'>
            <input 
                ref={fileInputRef}
                type="file" 
                accept=".docx" 
                onChange={handleFileChange}
                className="mb-4"
            />
            {loading && <div>Loading document...</div>}
          

          
          {/* Wrapper with explicit dimensions */}
          <div style={{ 
            minHeight: '200px', 
            padding: '20px',
            overflow: 'auto'
          }}>
            {htmlContent && (
              <div 
                className="docx-viewer"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{ 
                  width: '100%',
                  minHeight: '100%',
                  direction: 'rtl'
                }}
              />
            )}
          </div>
            </div>
        </Card>
  );
}

export default WordToHtml;
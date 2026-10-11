import { DocumentPage, DocElement, PAGE_WIDTH, PAGE_HEIGHT } from '../types';

export function renderElementHtml(el: DocElement): string {
  const commonStyle = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; transform: rotate(${el.rotation}deg); transform-origin: center center; z-index: ${el.zIndex}; box-sizing: border-box;`;

  if (el.type === 'text') {
    return `
      <div style="${commonStyle} font-family: ${el.fontFamily}; font-size: ${el.fontSize}px; color: ${el.color}; text-align: ${el.textAlign}; font-weight: ${el.fontWeight}; font-style: ${el.fontStyle}; text-decoration: ${el.textDecoration}; line-height: ${el.lineHeight}; word-break: break-word; white-space: pre-wrap; padding: 4px;">${escapeHtml(el.text)}</div>
    `;
  }

  if (el.type === 'image') {
    const crop = el.crop || { top: 0, right: 0, bottom: 0, left: 0 };
    const clipStyle = `clip-path: inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%);`;

    return `
      <div style="${commonStyle} overflow: hidden;">
        <img src="${el.src}" alt="Embedded" style="width: 100%; height: 100%; object-fit: fill; display: block; ${clipStyle}" />
      </div>
    `;
  }

  if (el.type === 'embed') {
    let bodyContent = el.html || '';
    if (el.css && !bodyContent.includes('<style')) {
      bodyContent = `<style>${el.css}</style>\n` + bodyContent;
    }
    if (el.js && !bodyContent.includes('<script')) {
      bodyContent = bodyContent + `\n<script>${el.js}<\/script>`;
    }
    const combinedContent = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;font-family:sans-serif;}</style></head><body>${bodyContent}</body></html>`;
    const escapedSrcDoc = combinedContent
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `
      <div style="${commonStyle} overflow: hidden; border-radius: 4px;">
        <iframe srcdoc="${escapedSrcDoc}" style="width: 100%; height: 100%; border: none; display: block;" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    `;
  }

  return '';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateStandaloneHtml(
  pages: DocumentPage[],
  docTitle: string = 'Document',
  pageWidth: number = PAGE_WIDTH,
  pageHeight: number = PAGE_HEIGHT
): string {
  const pagesHtml = pages
    .map(
      (page, idx) => `
    <div class="page-sheet" data-page="${idx + 1}">
      ${page.elements.map(renderElementHtml).join('\n')}
    </div>
  `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(docTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #f1f3f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    .document-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 40px 16px;
    }

    /* Deterministic Chromium Page Specifications */
    .page-sheet {
      width: ${pageWidth}px;
      height: ${pageHeight}px;
      min-height: ${pageHeight}px;
      max-height: ${pageHeight}px;
      position: relative;
      background: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      /* Treat each sheet as an isolated, monolithic box. Without this, an
         element positioned past the sheet's bottom edge (top + height >
         PAGE_HEIGHT) is only *visually* clipped by overflow:hidden — Chromium
         still walks that overflowing absolutely-positioned content during print
         fragmentation and emits an extra page per sheet. Size containment makes
         the fixed W x H box independent of its contents so the printed page
         count matches the on-screen sheet count. */
      contain: strict;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .page-sheet:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    @page {
      size: ${pageWidth}px ${pageHeight}px;
      margin: 0;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .document-wrapper {
        padding: 0 !important;
        gap: 0 !important;
      }
      .page-sheet {
        box-shadow: none !important;
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="document-wrapper">
    ${pagesHtml}
  </div>
</body>
</html>`;
}

export function downloadHtmlFile(content: string, filename: string = 'document.html') {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openHtmlInNewTab(content: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const newTab = window.open(url, '_blank');
  if (!newTab) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  // Revoke blob URL after 1 minute to release memory once new tab has loaded
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

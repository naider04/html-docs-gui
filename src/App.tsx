import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DocumentPage,
  DocElement,
  TextElement,
  ImageElement,
  EmbedElement,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PaperFormat,
  PaperOrientation,
  PAPER_PRESETS,
} from './types';
import { Toolbar } from './components/Toolbar';
import { PageSheet } from './components/PageSheet';
import { ElementInspector } from './components/ElementInspector';
import { EmbedEditorModal } from './components/EmbedEditorModal';
import { PropertyPanel } from './components/PropertyPanel';
import { PaperSetupPanel } from './components/PaperSetupPanel';
import { generateStandaloneHtml, downloadHtmlFile, openHtmlInNewTab } from './utils/exportHtml';

// Sample initial image for starter template
const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="340" height="220" viewBox="0 0 340 220">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e1b4b;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="340" height="220" rx="8" fill="url(#grad)" />
    <circle cx="90" cy="70" r="35" fill="#60a5fa" opacity="0.8" />
    <polygon points="60,190 160,100 230,170 290,90 320,190" fill="#93c5fd" opacity="0.6" />
    <circle cx="280" cy="50" r="20" fill="#fbbf24" opacity="0.9" />
    <text x="170" y="200" font-family="sans-serif" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="600">Sample Document Asset</text>
  </svg>
`);

export default function App() {
  const [docTitle, setDocTitle] = useState('Product Specification');
  const [zoom, setZoom] = useState(0.85);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for editing custom HTML+CSS+JS embed
  const [editingEmbedId, setEditingEmbedId] = useState<string | null>(null);
  const [interactiveEmbedId, setInteractiveEmbedId] = useState<string | null>(null);

  // Paper Format & Orientation State
  const [paperFormat, setPaperFormat] = useState<PaperFormat>('A4');
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait');
  const [customDimensions, setCustomDimensions] = useState<{ width: number; height: number }>({
    width: 794,
    height: 1123,
  });

  // In-app clipboard for Ctrl+C, Ctrl+X, Ctrl+V
  const clipboardRef = useRef<DocElement | null>(null);
  const lastPasteTimeRef = useRef<number>(0);

  // Initial pages state
  const initialPages: DocumentPage[] = [
    {
      id: 'page-1',
      elements: [
        {
          id: 'title-1',
          pageId: 'page-1',
          type: 'text',
          x: 54,
          y: 50,
          width: 686,
          height: 60,
          rotation: 0,
          zIndex: 1,
          text: 'Design Specification & Live Components',
          fontSize: 30,
          fontFamily: "'Playfair Display', serif",
          color: '#111827',
          textAlign: 'left',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          lineHeight: 1.2,
        } as TextElement,
        {
          id: 'text-desc',
          pageId: 'page-1',
          type: 'text',
          x: 54,
          y: 120,
          width: 686,
          height: 64,
          rotation: 0,
          zIndex: 2,
          text: 'This document editor features custom HTML+CSS+JS live embeds, image corner resize & edge cropping, and hotkeys (Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+D).',
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          color: '#4b5563',
          textAlign: 'left',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          lineHeight: 1.6,
        } as TextElement,
        {
          id: 'img-1',
          pageId: 'page-1',
          type: 'image',
          x: 54,
          y: 200,
          width: 320,
          height: 220,
          rotation: 0,
          zIndex: 3,
          src: SAMPLE_IMAGE,
          crop: { top: 0, right: 0, bottom: 0, left: 0 },
          aspectRatioLocked: true,
          naturalWidth: 340,
          naturalHeight: 220,
        } as ImageElement,
        {
          id: 'embed-1',
          pageId: 'page-1',
          type: 'embed',
          x: 394,
          y: 200,
          width: 346,
          height: 220,
          rotation: 0,
          zIndex: 4,
          html: `<div class="interactive-box">
  <div class="metric-val" id="metric">84.6%</div>
  <div class="metric-label">Efficiency Benchmark</div>
  <button class="action-btn" id="btn">Simulate Run</button>
</div>

<style>
.interactive-box {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-radius: 8px;
  color: white;
  padding: 24px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
.metric-val {
  font-size: 32px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: -0.02em;
}
.metric-label {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  margin-bottom: 16px;
}
.action-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
}
.action-btn:hover { background: #1d4ed8; }
</style>

<script>
document.getElementById('btn').addEventListener('click', function() {
  const newVal = (70 + Math.random() * 25).toFixed(1) + '%';
  document.getElementById('metric').textContent = newVal;
});
</script>`,
        } as EmbedElement,
      ],
    },
  ];

  const [pages, setPages] = useState<DocumentPage[]>(initialPages);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<DocumentPage[][]>([initialPages]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushHistory = useCallback((newPages: DocumentPage[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newPages];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Set pages with history recording
  const updatePagesWithHistory = useCallback(
    (newPagesOrUpdater: DocumentPage[] | ((prev: DocumentPage[]) => DocumentPage[])) => {
      setPages((current) => {
        const next =
          typeof newPagesOrUpdater === 'function'
            ? newPagesOrUpdater(current)
            : newPagesOrUpdater;
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  // Show auto-dismissing toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2400);
  }, []);

  // Find currently selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    for (const page of pages) {
      const found = page.elements.find((el) => el.id === selectedElementId);
      if (found) return found;
    }
    return null;
  }, [pages, selectedElementId]);

  // Find element being edited in the EmbedEditorModal
  const embedToEdit = useMemo(() => {
    if (!editingEmbedId) return null;
    for (const page of pages) {
      const found = page.elements.find((el) => el.id === editingEmbedId);
      if (found && found.type === 'embed') return found as EmbedElement;
    }
    return null;
  }, [pages, editingEmbedId]);

  // UNDO
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setPages(history[targetIndex]);
      showToast('Undo');
    }
  }, [historyIndex, history, showToast]);

  // REDO
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setPages(history[targetIndex]);
      showToast('Redo');
    }
  }, [historyIndex, history, showToast]);

  // Add Text Block
  const handleAddText = useCallback(() => {
    const newId = `text-${Date.now()}`;
    const newTextEl: TextElement = {
      id: newId,
      pageId: activePageId,
      type: 'text',
      x: 54,
      y: 180,
      width: 340,
      height: 70,
      rotation: 0,
      zIndex: Date.now() % 1000,
      text: 'Double click to edit this text',
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
      color: '#111827',
      textAlign: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      lineHeight: 1.4,
    };

    updatePagesWithHistory((prev) =>
      prev.map((p) => (p.id === activePageId ? { ...p, elements: [...p.elements, newTextEl] } : p))
    );
    setSelectedElementId(newId);
  }, [activePageId, updatePagesWithHistory]);

  // Add Image Block (to left, right, or beneath) with original dimensions
  const handleAddImage = useCallback(
    (
      src: string,
      placement: 'left' | 'right' | 'beneath' = 'beneath',
      naturalW?: number,
      naturalH?: number
    ) => {
      const activePage = pages.find((p) => p.id === activePageId) || pages[0];

      // Calculate width and height from original dimensions
      let width = naturalW || 340;
      let height = naturalH || 240;

      // If dimensions are excessively huge (e.g. > PAGE_WIDTH - 60), maintain aspect ratio
      const maxWidth = PAGE_WIDTH - 80;
      if (width > maxWidth) {
        const ratio = height / width;
        width = maxWidth;
        height = Math.round(width * ratio);
      }

      // Calculate placement: left, right, or beneath
      let posX = 54;
      let posY = 200;

      if (placement === 'left') {
        posX = 40;
        // Position vertically aligned or below top
        posY = 120;
      } else if (placement === 'right') {
        posX = Math.max(40, PAGE_WIDTH - width - 40);
        posY = 120;
      } else {
        // beneath: place below the lowest existing element on the page
        if (activePage && activePage.elements.length > 0) {
          const maxBottom = Math.max(...activePage.elements.map((el) => el.y + el.height));
          posY = maxBottom + 24;
          posX = 54;
        } else {
          posY = 100;
          posX = 54;
        }
      }

      const newId = `img-${Date.now()}`;
      const newImageEl: ImageElement = {
        id: newId,
        pageId: activePageId,
        type: 'image',
        x: posX,
        y: posY,
        width,
        height,
        rotation: 0,
        zIndex: Date.now() % 1000,
        src,
        crop: { top: 0, right: 0, bottom: 0, left: 0 },
        aspectRatioLocked: true,
        naturalWidth: naturalW || width,
        naturalHeight: naturalH || height,
      };

      updatePagesWithHistory((prev) =>
        prev.map((p) => (p.id === activePageId ? { ...p, elements: [...p.elements, newImageEl] } : p))
      );
      setSelectedElementId(newId);
      showToast(`Image placed (${placement}) with original dimensions`);
    },
    [pages, activePageId, updatePagesWithHistory, showToast]
  );

  // Position existing image to left, right, or beneath
  const handleAlignImagePosition = useCallback(
    (placement: 'left' | 'right' | 'beneath') => {
      if (!selectedElement || selectedElement.type !== 'image') return;
      const activePage = pages.find((p) => p.id === selectedElement.pageId);

      let newX = selectedElement.x;
      let newY = selectedElement.y;

      if (placement === 'left') {
        newX = 40;
      } else if (placement === 'right') {
        newX = Math.max(40, PAGE_WIDTH - selectedElement.width - 40);
      } else if (placement === 'beneath') {
        if (activePage) {
          const otherElements = activePage.elements.filter((el) => el.id !== selectedElement.id);
          if (otherElements.length > 0) {
            const maxBottom = Math.max(...otherElements.map((el) => el.y + el.height));
            newY = maxBottom + 24;
          }
        }
      }

      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          elements: p.elements.map((el) =>
            el.id === selectedElement.id ? ({ ...el, x: newX, y: newY } as DocElement) : el
          ),
        }))
      );
      showToast(`Image aligned to ${placement}`);
    },
    [selectedElement, pages, showToast]
  );

  // Add HTML+CSS+JS Embed Block
  const handleAddEmbed = useCallback(() => {
    const newId = `embed-${Date.now()}`;
    const newEmbedEl: EmbedElement = {
      id: newId,
      pageId: activePageId,
      type: 'embed',
      x: 54,
      y: 220,
      width: 360,
      height: 220,
      rotation: 0,
      zIndex: Date.now() % 1000,
      html: `<div class="card">
  <h4>Live HTML Component</h4>
  <p>Edit HTML, &lt;style&gt;, and &lt;script&gt; in one editor</p>
  <button id="counter-btn" class="btn">Clicks: 0</button>
</div>

<style>
.card {
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h4 { margin: 0 0 4px; color: #0f172a; font-family: sans-serif; }
p { margin: 0 0 12px; color: #64748b; font-size: 12px; font-family: sans-serif; }
.btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
</style>

<script>
let count = 0;
document.getElementById('counter-btn').addEventListener('click', function() {
  count++;
  this.textContent = 'Clicks: ' + count;
});
</script>`,
    };

    updatePagesWithHistory((prev) =>
      prev.map((p) => (p.id === activePageId ? { ...p, elements: [...p.elements, newEmbedEl] } : p))
    );
    setSelectedElementId(newId);
  }, [activePageId, updatePagesWithHistory]);

  // Add Next Page / Sheet
  const handleAddPage = useCallback(
    (afterIndex?: number) => {
      const newPageId = `page-${Date.now()}`;
      const newPage: DocumentPage = {
        id: newPageId,
        elements: [],
      };

      updatePagesWithHistory((prev) => {
        if (typeof afterIndex === 'number') {
          const updated = [...prev];
          updated.splice(afterIndex + 1, 0, newPage);
          return updated;
        }
        return [...prev, newPage];
      });

      setActivePageId(newPageId);
      setSelectedElementId(null);
      showToast('New sheet added');
    },
    [updatePagesWithHistory, showToast]
  );

  // Delete Page
  const handleDeletePage = useCallback(
    (pageId: string) => {
      updatePagesWithHistory((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((p) => p.id !== pageId);
      });
      setActivePageId((curr) => (curr === pageId ? 'page-1' : curr));
      setSelectedElementId(null);
    },
    [updatePagesWithHistory]
  );

  // Duplicate Page
  const handleDuplicatePage = useCallback(
    (pageId: string) => {
      updatePagesWithHistory((prev) => {
        const pageIndex = prev.findIndex((p) => p.id === pageId);
        if (pageIndex === -1) return prev;
        const original = prev[pageIndex];
        const newPageId = `page-${Date.now()}`;
        const duplicatedElements = original.elements.map((el) => ({
          ...el,
          id: `${el.id}-copy-${Date.now()}`,
          pageId: newPageId,
        }));
        const duplicatedPage: DocumentPage = {
          id: newPageId,
          elements: duplicatedElements,
        };
        const updated = [...prev];
        updated.splice(pageIndex + 1, 0, duplicatedPage);
        return updated;
      });
    },
    [updatePagesWithHistory]
  );

  // Move Page Up/Down
  const handleMovePage = useCallback(
    (fromIndex: number, toIndex: number) => {
      updatePagesWithHistory((prev) => {
        if (toIndex < 0 || toIndex >= prev.length) return prev;
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    },
    [updatePagesWithHistory]
  );

  // Update selected element
  const handleUpdateElement = useCallback((id: string, updated: Partial<DocElement>) => {
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        elements: page.elements.map((el) => (el.id === id ? ({ ...el, ...updated } as DocElement) : el)),
      }))
    );
  }, []);

  // Delete element
  const handleDeleteElement = useCallback(
    (id?: string) => {
      const targetId = id || selectedElementId;
      if (!targetId) return;
      updatePagesWithHistory((prev) =>
        prev.map((page) => ({
          ...page,
          elements: page.elements.filter((el) => el.id !== targetId),
        }))
      );
      setSelectedElementId(null);
    },
    [selectedElementId, updatePagesWithHistory]
  );

  // Copy element (Ctrl+C)
  const handleCopyElement = useCallback(() => {
    if (!selectedElement) return;
    clipboardRef.current = { ...selectedElement };
    showToast(`Copied ${selectedElement.type} (Ctrl+C)`);
  }, [selectedElement, showToast]);

  // Cut element (Ctrl+X) - carries text, image, or html embed across pages
  const handleCutElement = useCallback(() => {
    if (!selectedElement) return;
    clipboardRef.current = { ...selectedElement };
    const cutId = selectedElement.id;
    const cutType = selectedElement.type;
    updatePagesWithHistory((prev) =>
      prev.map((page) => ({
        ...page,
        elements: page.elements.filter((el) => el.id !== cutId),
      }))
    );
    setSelectedElementId(null);
    showToast(`Cut ${cutType} (Ctrl+X) — click target sheet and press Ctrl+V to paste`);
  }, [selectedElement, updatePagesWithHistory, showToast]);

  // Duplicate element (Ctrl+D)
  const handleDuplicateElement = useCallback(() => {
    if (!selectedElement) return;
    const newId = `${selectedElement.type}-${Date.now()}`;
    const duplicated: DocElement = {
      ...selectedElement,
      id: newId,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      zIndex: Date.now() % 1000,
    };

    updatePagesWithHistory((prev) =>
      prev.map((p) =>
        p.id === selectedElement.pageId ? { ...p, elements: [...p.elements, duplicated] } : p
      )
    );
    setSelectedElementId(newId);
    showToast('Duplicated element (Ctrl+D)');
  }, [selectedElement, updatePagesWithHistory, showToast]);

  // Paste element from clipboard (Ctrl+V)
  const handlePasteClipboardElement = useCallback(() => {
    const now = Date.now();
    if (now - lastPasteTimeRef.current < 120) return false;
    if (!clipboardRef.current) return false;

    lastPasteTimeRef.current = now;
    const copied = clipboardRef.current;
    const newId = `${copied.type}-${Date.now()}`;

    // If pasted onto the SAME page as copied/cut, offset by +24px.
    // If pasted onto a DIFFERENT page, keep the exact same position so it lands seamlessly!
    const isSamePage = copied.pageId === activePageId;
    const posX = isSamePage ? copied.x + 24 : copied.x;
    const posY = isSamePage ? copied.y + 24 : copied.y;

    const highestZ = Math.max(
      ...pages.flatMap((p) => p.elements.map((el) => el.zIndex)),
      1
    );

    const pastedElement: DocElement = {
      ...copied,
      id: newId,
      pageId: activePageId,
      x: posX,
      y: posY,
      zIndex: highestZ + 1,
    };

    updatePagesWithHistory((prev) =>
      prev.map((p) =>
        p.id === activePageId ? { ...p, elements: [...p.elements, pastedElement] } : p
      )
    );
    setSelectedElementId(newId);

    const targetPageIndex = pages.findIndex((p) => p.id === activePageId);
    showToast(`Pasted ${pastedElement.type} onto Page ${targetPageIndex + 1} (Ctrl+V)`);
    return true;
  }, [activePageId, pages, updatePagesWithHistory, showToast]);

  // Layer ordering
  const handleBringForward = useCallback(() => {
    if (!selectedElement) return;
    const highestZ = Math.max(
      ...pages.flatMap((p) => p.elements.map((el) => el.zIndex)),
      1
    );
    handleUpdateElement(selectedElement.id, { zIndex: highestZ + 1 });
  }, [selectedElement, pages, handleUpdateElement]);

  const handleSendBackward = useCallback(() => {
    if (!selectedElement) return;
    const lowestZ = Math.min(
      ...pages.flatMap((p) => p.elements.map((el) => el.zIndex)),
      1
    );
    handleUpdateElement(selectedElement.id, { zIndex: Math.max(0, lowestZ - 1) });
  }, [selectedElement, pages, handleUpdateElement]);

  // HOTKEYS: Ctrl+X, Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === 'textarea' || activeTag === 'input';

      // 1. CTRL+Z: Undo (when not typing inside inputs)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInputActive) {
          e.preventDefault();
          handleUndo();
          return;
        }
      }

      // 2. CTRL+Y or CTRL+SHIFT+Z: Redo
      if (
        (isCmdOrCtrl && e.key.toLowerCase() === 'y') ||
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInputActive) {
          e.preventDefault();
          handleRedo();
          return;
        }
      }

      // 3. CTRL+X: Cut selected element (images, text, html embed)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'x') {
        if (!isInputActive && selectedElement) {
          e.preventDefault();
          handleCutElement();
          return;
        }
      }

      // 4. CTRL+C: Copy selected element
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (!isInputActive && selectedElement) {
          e.preventDefault();
          handleCopyElement();
          return;
        }
      }

      // 5. CTRL+V: Paste copied/cut element
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        if (!isInputActive && clipboardRef.current) {
          // If in-app clipboard has an element, trigger paste
          e.preventDefault();
          handlePasteClipboardElement();
          return;
        }
      }

      // 6. CTRL+D: Duplicate selected element
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        if (selectedElement) {
          e.preventDefault();
          handleDuplicateElement();
          return;
        }
      }

      // 7. Delete / Backspace: Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        if (!isInputActive) {
          e.preventDefault();
          handleDeleteElement();
          return;
        }
      }

      // 8. Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElement,
    selectedElementId,
    handleUndo,
    handleRedo,
    handleCutElement,
    handleCopyElement,
    handlePasteClipboardElement,
    handleDuplicateElement,
    handleDeleteElement,
  ]);

  // GLOBAL CLIPBOARD PASTE: Supports pasting cut/copied elements or external images with original dimensions
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'textarea' || activeTag === 'input') {
        return; // Allow native paste inside text fields
      }

      // Check if system clipboard has an image file
      const items = e.clipboardData?.items;
      let hasSystemImage = false;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              hasSystemImage = true;
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = (loadEvt) => {
                const src = loadEvt.target?.result as string;
                if (src) {
                  // Measure exact original natural dimensions
                  const tempImg = new Image();
                  tempImg.onload = () => {
                    handleAddImage(
                      src,
                      'beneath',
                      tempImg.naturalWidth,
                      tempImg.naturalHeight
                    );
                  };
                  tempImg.src = src;
                }
              };
              reader.readAsDataURL(file);
              return;
            }
          }
        }
      }

      // If no external system image, paste in-app cut/copied element (text, image, html embed)
      if (!hasSystemImage && clipboardRef.current) {
        e.preventDefault();
        handlePasteClipboardElement();
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePasteClipboardElement, handleAddImage]);

  // Active page helpers
  const activePageIndex = useMemo(
    () => Math.max(0, pages.findIndex((p) => p.id === activePageId)),
    [pages, activePageId]
  );
  const activePage = pages[activePageIndex];

  // Dynamic Paper Dimensions based on format, orientation, or custom size
  const { pageWidth, pageHeight } = useMemo(() => {
    let baseW = 794;
    let baseH = 1123;
    if (paperFormat === 'Custom') {
      baseW = customDimensions.width;
      baseH = customDimensions.height;
    } else {
      const preset = PAPER_PRESETS[paperFormat] || PAPER_PRESETS.A4;
      baseW = preset.width;
      baseH = preset.height;
    }

    if (orientation === 'landscape') {
      return {
        pageWidth: Math.max(baseW, baseH),
        pageHeight: Math.min(baseW, baseH),
      };
    } else {
      return {
        pageWidth: Math.min(baseW, baseH),
        pageHeight: Math.max(baseW, baseH),
      };
    }
  }, [paperFormat, orientation, customDimensions]);

  // Export to Deterministic HTML File
  const handleExportHtml = () => {
    const htmlString = generateStandaloneHtml(pages, docTitle, pageWidth, pageHeight);
    downloadHtmlFile(htmlString, `${docTitle.toLowerCase().replace(/\s+/g, '-')}.html`);
    showToast('Downloaded deterministic HTML');
  };

  // Print: Opens the generated HTML in a new tab (without converting to PDF or triggering print dialog)
  const handlePrint = () => {
    const htmlString = generateStandaloneHtml(pages, docTitle, pageWidth, pageHeight);
    openHtmlInNewTab(htmlString);
    showToast('Opened HTML in a new tab');
  };

  // Save changes from EmbedEditorModal
  const handleSaveEmbed = (combinedHtml: string) => {
    if (!editingEmbedId) return;
    handleUpdateElement(editingEmbedId, { html: combinedHtml });
    showToast('Updated HTML embed');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#eceff1] flex flex-col antialiased">
      {/* Top Application Toolbar - Fixed */}
      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddEmbed={handleAddEmbed}
        onAddPage={() => handleAddPage()}
        zoom={zoom}
        onZoomChange={setZoom}
        onExportHtml={handleExportHtml}
        onPrint={handlePrint}
        title={docTitle}
        onTitleChange={setDocTitle}
        paperFormat={paperFormat}
        onPaperFormatChange={setPaperFormat}
        orientation={orientation}
        onOrientationChange={setOrientation}
      />

      {/* Contextual Element Inspector - Floats at top center, fixed and does not scroll */}
      {selectedElement && (
        <div className="no-print absolute top-[52px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <ElementInspector
              element={selectedElement}
              onUpdate={(updated) => handleUpdateElement(selectedElement.id, updated)}
              onDelete={() => handleDeleteElement()}
              onDuplicate={handleDuplicateElement}
              onCut={handleCutElement}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              onOpenEmbedEditor={() => setEditingEmbedId(selectedElement.id)}
              onAlignImagePosition={handleAlignImagePosition}
              isInteractive={interactiveEmbedId === selectedElement.id}
              onToggleInteractive={() =>
                setInteractiveEmbedId((prev) => (prev === selectedElement.id ? null : selectedElement.id))
              }
            />
          </div>
        </div>
      )}

      {/* Workspace Area: Fixed Left Setup Panel + Scrollable Canvas + Fixed Right Property Panel */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Paper & Sheet Setup Panel on the Left - FIXED (never scrolls when viewing other pages) */}
        <PaperSetupPanel
          paperFormat={paperFormat}
          onPaperFormatChange={setPaperFormat}
          orientation={orientation}
          onOrientationChange={setOrientation}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          onCustomDimensionsChange={(w, h) => setCustomDimensions({ width: w, height: h })}
          pages={pages}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          onAddPage={() => handleAddPage()}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onMovePage={handleMovePage}
        />

        {/* Main Canvas Area - Dominant White Paper Sheet (Only this container scrolls) */}
        <main
          className="flex-1 h-full min-w-0 overflow-y-auto overflow-x-auto flex flex-col items-center py-8 px-4 print-page-container"
          onClick={() => {
            setSelectedElementId(null);
            setInteractiveEmbedId(null);
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              width: `${pageWidth}px`,
            }}
            className="flex flex-col items-center"
          >
            {pages.map((page, idx) => (
              <PageSheet
                key={page.id}
                page={page}
                pageIndex={idx}
                totalPages={pages.length}
                isActive={activePageId === page.id}
                selectedElementId={selectedElementId}
                zoom={zoom}
                onSelectPage={() => setActivePageId(page.id)}
                onSelectElement={(id) => {
                  setSelectedElementId(id);
                  if (id !== interactiveEmbedId) {
                    setInteractiveEmbedId(null);
                  }
                }}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onAddNextPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onDuplicatePage={handleDuplicatePage}
                onMovePage={handleMovePage}
                onOpenEmbedEditor={(embedId) => setEditingEmbedId(embedId)}
                interactiveEmbedId={interactiveEmbedId}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
              />
            ))}
          </div>
        </main>

        {/* Live Numerical Properties Panel on the Right - FIXED (never scrolls when viewing other pages) */}
        <PropertyPanel
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
        />
      </div>

      {/* Custom HTML + CSS + JS Embed Modal */}
      <EmbedEditorModal
        isOpen={!!editingEmbedId}
        element={embedToEdit}
        onClose={() => setEditingEmbedId(null)}
        onSave={handleSaveEmbed}
      />

      {/* Quick Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none border border-white/10">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

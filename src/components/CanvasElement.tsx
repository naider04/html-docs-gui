import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DocElement, TextElement, ImageElement, EmbedElement } from '../types';
import { RotateCw, Edit, Play, Square } from 'lucide-react';

interface CanvasElementProps {
  element: DocElement;
  isSelected: boolean;
  zoom: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updated: Partial<DocElement>) => void;
  onDelete: () => void;
  onOpenEmbedEditor?: () => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onOpenEmbedEditor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [activeCropEdge, setActiveCropEdge] = useState<string | null>(null);

  // Close editing and interactive modes when deselected
  useEffect(() => {
    if (!isSelected) {
      setIsEditingText(false);
      setIsInteractiveMode(false);
    }
  }, [isSelected]);

  // Combined HTML+CSS+JS srcdoc for embed elements
  const embedSrcDoc = useMemo(() => {
    if (element.type !== 'embed') return '';
    const emb = element as EmbedElement;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ${emb.css || ''}
  </style>
</head>
<body>
  ${emb.html || ''}
  <script>
    try {
      ${emb.js || ''}
    } catch (err) {
      console.error("Embed script error:", err);
    }
  <\/script>
</body>
</html>`;
  }, [element]);

  // DRAG MOVEMENT HANDLER
  const handleDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.handle') || isEditingText || isInteractiveMode) {
      return;
    }
    e.stopPropagation();
    onSelect(e as unknown as React.MouseEvent);

    document.body.classList.add('is-dragging');
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startX = element.x;
    const startY = element.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointerX) / zoom;
      const dy = (moveEvent.clientY - startPointerY) / zoom;
      onUpdate({
        x: Math.round(startX + dx),
        y: Math.round(startY + dy),
      });
    };

    const onPointerUp = () => {
      document.body.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // ROTATION HANDLER
  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!containerRef.current) return;
    document.body.classList.add('is-dragging');
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;

      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const snap of snapAngles) {
        if (Math.abs(deg - snap) < 4 || (moveEvent.shiftKey && Math.abs(deg - snap) < 10)) {
          deg = snap === 360 ? 0 : snap;
          break;
        }
      }

      onUpdate({ rotation: Math.round(deg) });
    };

    const onPointerUp = () => {
      document.body.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // CORNER RESIZE HANDLER (NW, NE, SE, SW)
  const handleCornerResizeStart = (e: React.PointerEvent, corner: 'nw' | 'ne' | 'se' | 'sw') => {
    e.stopPropagation();
    e.preventDefault();

    document.body.classList.add('is-dragging');
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startX = element.x;
    const startY = element.y;
    const startWidth = element.width;
    const startHeight = element.height;

    // Lock image ratio by default:
    const isImage = element.type === 'image';
    const lockRatio = isImage ? (element as ImageElement).aspectRatioLocked !== false : false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const rad = (element.rotation * Math.PI) / 180;
      const rawDx = (moveEvent.clientX - startPointerX) / zoom;
      const rawDy = (moveEvent.clientY - startPointerY) / zoom;

      const dx = rawDx * Math.cos(-rad) - rawDy * Math.sin(-rad);
      const dy = rawDx * Math.sin(-rad) + rawDy * Math.cos(-rad);

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX;
      let newY = startY;

      if (corner === 'se') {
        if (lockRatio) {
          const scale = Math.max(0.1, (startWidth + dx) / startWidth);
          newWidth = Math.max(30, startWidth * scale);
          newHeight = Math.max(30, startHeight * scale);
        } else {
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight + dy);
        }
      } else if (corner === 'sw') {
        if (lockRatio) {
          const scale = Math.max(0.1, (startWidth - dx) / startWidth);
          newWidth = Math.max(30, startWidth * scale);
          newHeight = Math.max(30, startHeight * scale);
        } else {
          newWidth = Math.max(30, startWidth - dx);
          newHeight = Math.max(30, startHeight + dy);
        }
        const widthDiff = newWidth - startWidth;
        newX = startX - widthDiff * Math.cos(rad);
        newY = startY - widthDiff * Math.sin(rad);
      } else if (corner === 'ne') {
        if (lockRatio) {
          const scale = Math.max(0.1, (startWidth + dx) / startWidth);
          newWidth = Math.max(30, startWidth * scale);
          newHeight = Math.max(30, startHeight * scale);
        } else {
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight - dy);
        }
        const heightDiff = newHeight - startHeight;
        newX = startX + heightDiff * Math.sin(rad);
        newY = startY - heightDiff * Math.cos(rad);
      } else if (corner === 'nw') {
        if (lockRatio) {
          const scale = Math.max(0.1, (startWidth - dx) / startWidth);
          newWidth = Math.max(30, startWidth * scale);
          newHeight = Math.max(30, startHeight * scale);
        } else {
          newWidth = Math.max(30, startWidth - dx);
          newHeight = Math.max(30, startHeight - dy);
        }
        const widthDiff = newWidth - startWidth;
        const heightDiff = newHeight - startHeight;
        newX = startX - widthDiff * Math.cos(rad) + heightDiff * Math.sin(rad);
        newY = startY - widthDiff * Math.sin(rad) - heightDiff * Math.cos(rad);
      }

      onUpdate({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        x: Math.round(newX),
        y: Math.round(newY),
      });
    };

    const onPointerUp = () => {
      document.body.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // EDGE CROP HANDLER (FOR IMAGES: N, E, S, W)
  const handleEdgeCropStart = (e: React.PointerEvent, edge: 'n' | 'e' | 's' | 'w') => {
    e.stopPropagation();
    e.preventDefault();
    if (element.type !== 'image') return;

    document.body.classList.add('is-dragging');
    setActiveCropEdge(edge);
    const imgEl = element as ImageElement;
    const startCrop = { ...imgEl.crop };
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const rad = (element.rotation * Math.PI) / 180;
      const rawDx = (moveEvent.clientX - startPointerX) / zoom;
      const rawDy = (moveEvent.clientY - startPointerY) / zoom;

      const dx = rawDx * Math.cos(-rad) - rawDy * Math.sin(-rad);
      const dy = rawDx * Math.sin(-rad) + rawDy * Math.cos(-rad);

      const newCrop = { ...startCrop };

      if (edge === 'n') {
        const deltaPct = (dy / element.height) * 100;
        newCrop.top = Math.max(0, Math.min(85 - newCrop.bottom, Math.round(startCrop.top + deltaPct)));
      } else if (edge === 's') {
        const deltaPct = (-dy / element.height) * 100;
        newCrop.bottom = Math.max(0, Math.min(85 - newCrop.top, Math.round(startCrop.bottom + deltaPct)));
      } else if (edge === 'w') {
        const deltaPct = (dx / element.width) * 100;
        newCrop.left = Math.max(0, Math.min(85 - newCrop.right, Math.round(startCrop.left + deltaPct)));
      } else if (edge === 'e') {
        const deltaPct = (-dx / element.width) * 100;
        newCrop.right = Math.max(0, Math.min(85 - newCrop.left, Math.round(startCrop.right + deltaPct)));
      }

      onUpdate({ crop: newCrop });
    };

    const onPointerUp = () => {
      document.body.classList.remove('is-dragging');
      setActiveCropEdge(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: element.zIndex,
      }}
      className={`group select-none cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'
      }`}
    >
      {/* 1. TEXT ELEMENT CONTENT */}
      {element.type === 'text' && (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditingText(true);
          }}
          style={{
            fontFamily: (element as TextElement).fontFamily,
            fontSize: `${(element as TextElement).fontSize}px`,
            color: (element as TextElement).color,
            textAlign: (element as TextElement).textAlign,
            fontWeight: (element as TextElement).fontWeight,
            fontStyle: (element as TextElement).fontStyle,
            textDecoration: (element as TextElement).textDecoration,
            lineHeight: (element as TextElement).lineHeight || 1.4,
            width: '100%',
            height: '100%',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          className="p-1 overflow-hidden"
        >
          {isEditingText ? (
            <textarea
              autoFocus
              value={(element as TextElement).text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              onBlur={() => setIsEditingText(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditingText(false);
              }}
              style={{
                fontFamily: (element as TextElement).fontFamily,
                fontSize: `${(element as TextElement).fontSize}px`,
                color: (element as TextElement).color,
                textAlign: (element as TextElement).textAlign,
                fontWeight: (element as TextElement).fontWeight,
                fontStyle: (element as TextElement).fontStyle,
                textDecoration: (element as TextElement).textDecoration,
                lineHeight: (element as TextElement).lineHeight || 1.4,
              }}
              className="w-full h-full bg-transparent resize-none outline-none border border-blue-400 p-0 m-0"
            />
          ) : (
            (element as TextElement).text || <span className="text-neutral-400 italic">Double click to type text</span>
          )}
        </div>
      )}

      {/* 2. IMAGE ELEMENT CONTENT */}
      {element.type === 'image' && (
        <div className="w-full h-full relative overflow-hidden pointer-events-none">
          <img
            src={(element as ImageElement).src}
            alt="User content"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              clipPath: `inset(${(element as ImageElement).crop.top}% ${(element as ImageElement).crop.right}% ${(element as ImageElement).crop.bottom}% ${(element as ImageElement).crop.left}%)`,
            }}
            className="w-full h-full block"
          />

          {isSelected && (
            <div
              style={{
                position: 'absolute',
                top: `${(element as ImageElement).crop.top}%`,
                left: `${(element as ImageElement).crop.left}%`,
                right: `${(element as ImageElement).crop.right}%`,
                bottom: `${(element as ImageElement).crop.bottom}%`,
                border: '1.5px dashed rgba(245, 158, 11, 0.9)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      )}

      {/* 3. HTML+CSS+JS EMBED CONTENT */}
      {element.type === 'embed' && (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onOpenEmbedEditor) onOpenEmbedEditor();
          }}
          className="w-full h-full relative overflow-hidden bg-white rounded shadow-2xs border border-neutral-200"
        >
          {/* Sandboxed iframe */}
          <iframe
            srcDoc={embedSrcDoc}
            title="Embedded HTML/JS"
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: isInteractiveMode ? 'auto' : 'none',
            }}
          />

          {/* Transparent overlay: guarantees click, select, drag, and resize ALWAYS work reliably */}
          {!isInteractiveMode && (
            <div
              className="absolute inset-0 z-10 cursor-move bg-transparent"
              title="Click to select, drag to reposition, double-click to edit code"
            />
          )}

          {/* Action buttons on selection */}
          {isSelected && (
            <div className="no-print absolute top-2 right-2 flex items-center gap-1.5 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInteractiveMode(!isInteractiveMode);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] shadow font-medium transition-colors ${
                  isInteractiveMode
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-white/95 hover:bg-white text-neutral-700 border border-neutral-300'
                }`}
                title={
                  isInteractiveMode
                    ? 'Exit interactive mode to reposition/resize'
                    : 'Test click buttons/inputs inside embed'
                }
              >
                {isInteractiveMode ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Done Testing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current text-emerald-600" />
                    <span>Interact</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenEmbedEditor) onOpenEmbedEditor();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-neutral-900/90 hover:bg-neutral-950 text-white rounded text-[11px] shadow font-medium"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Code</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SELECTION BOUNDS & INTERACTIVE HANDLES */}
      {isSelected && (
        <div className="selection-overlay absolute inset-0 pointer-events-none z-30">
          {/* ROTATION HANDLE */}
          <div
            className="absolute left-1/2 -top-7 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing handle"
            onPointerDown={handleRotateStart}
            title="Drag to rotate element (Shift to snap)"
          >
            <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
              <RotateCw className="w-3 h-3 text-blue-600" />
            </div>
            <div className="w-0.5 h-2 bg-blue-500" />
          </div>

          {/* CORNER RESIZE HANDLES: NW, NE, SE, SW */}
          <div
            className="handle absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
            onPointerDown={(e) => handleCornerResizeStart(e, 'nw')}
            title="Drag corner to resize"
          />
          <div
            className="handle absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
            onPointerDown={(e) => handleCornerResizeStart(e, 'ne')}
            title="Drag corner to resize"
          />
          <div
            className="handle absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
            onPointerDown={(e) => handleCornerResizeStart(e, 'se')}
            title="Drag corner to resize"
          />
          <div
            className="handle absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
            onPointerDown={(e) => handleCornerResizeStart(e, 'sw')}
            title="Drag corner to resize"
          />

          {/* EDGE CROP HANDLES (ONLY FOR IMAGES) */}
          {element.type === 'image' && (
            <>
              {/* TOP EDGE */}
              <div
                className={`handle absolute left-1/2 -top-1.5 -translate-x-1/2 w-7 h-2 rounded bg-amber-500 border border-white cursor-ns-resize pointer-events-auto shadow-xs flex items-center justify-center hover:scale-110 transition-transform ${
                  activeCropEdge === 'n' ? 'scale-125 bg-amber-600' : ''
                }`}
                onPointerDown={(e) => handleEdgeCropStart(e, 'n')}
                title="Drag top edge to crop"
              >
                <div className="w-3 h-0.5 bg-white rounded-full" />
              </div>

              {/* BOTTOM EDGE */}
              <div
                className={`handle absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-7 h-2 rounded bg-amber-500 border border-white cursor-ns-resize pointer-events-auto shadow-xs flex items-center justify-center hover:scale-110 transition-transform ${
                  activeCropEdge === 's' ? 'scale-125 bg-amber-600' : ''
                }`}
                onPointerDown={(e) => handleEdgeCropStart(e, 's')}
                title="Drag bottom edge to crop"
              >
                <div className="w-3 h-0.5 bg-white rounded-full" />
              </div>

              {/* LEFT EDGE */}
              <div
                className={`handle absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-7 rounded bg-amber-500 border border-white cursor-ew-resize pointer-events-auto shadow-xs flex items-center justify-center hover:scale-110 transition-transform ${
                  activeCropEdge === 'w' ? 'scale-125 bg-amber-600' : ''
                }`}
                onPointerDown={(e) => handleEdgeCropStart(e, 'w')}
                title="Drag left edge to crop"
              >
                <div className="w-0.5 h-3 bg-white rounded-full" />
              </div>

              {/* RIGHT EDGE */}
              <div
                className={`handle absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-7 rounded bg-amber-500 border border-white cursor-ew-resize pointer-events-auto shadow-xs flex items-center justify-center hover:scale-110 transition-transform ${
                  activeCropEdge === 'e' ? 'scale-125 bg-amber-600' : ''
                }`}
                onPointerDown={(e) => handleEdgeCropStart(e, 'e')}
                title="Drag right edge to crop"
              >
                <div className="w-0.5 h-3 bg-white rounded-full" />
              </div>
            </>
          )}

          {activeCropEdge && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-amber-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
              Cropping edge: {activeCropEdge.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

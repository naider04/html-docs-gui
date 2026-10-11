import React from 'react';
import { DocElement, TextElement, ImageElement, EmbedElement, PAGE_WIDTH } from '../types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Trash2,
  Copy,
  Scissors,
  BringToFront,
  SendToBack,
  RotateCw,
  Crop as CropIcon,
  Code as CodeIcon,
  Lock,
  Unlock,
  MoveHorizontal,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Play,
  Square,
} from 'lucide-react';

interface ElementInspectorProps {
  element: DocElement | null;
  onUpdate: (updated: Partial<DocElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCut?: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onOpenEmbedEditor?: () => void;
  onAlignImagePosition?: (position: 'left' | 'right' | 'beneath') => void;
  isInteractive?: boolean;
  onToggleInteractive?: () => void;
}

const FONT_OPTIONS = [
  { label: 'Inter (Sans)', value: "'Inter', sans-serif" },
  { label: 'Merriweather (Serif)', value: "'Merriweather', serif" },
  { label: 'Playfair Display (Display)', value: "'Playfair Display', serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Fira Code (Monospace)', value: "'Fira Code', monospace" },
  { label: 'Georgia (Classic Serif)', value: "Georgia, serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

const PRESET_COLORS = [
  '#111827', // Black / Dark Slate
  '#4b5563', // Slate Gray
  '#dc2626', // Red
  '#ea580c', // Orange
  '#d97706', // Amber
  '#16a34a', // Emerald Green
  '#2563eb', // Royal Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
];

const LINE_HEIGHT_OPTIONS = [1.0, 1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.5];

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onCut,
  onBringForward,
  onSendBackward,
  onOpenEmbedEditor,
  onAlignImagePosition,
  isInteractive = false,
  onToggleInteractive,
}) => {
  if (!element) return null;

  return (
    <div className="no-print bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-lg rounded-xl px-4 py-2 flex flex-wrap items-center gap-2.5 transition-all text-xs text-neutral-700">
      {/* Type badge */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
        {element.type === 'text' && 'Text'}
        {element.type === 'image' && 'Image'}
        {element.type === 'embed' && 'HTML+JS Embed'}
      </div>

      <div className="h-4 w-px bg-neutral-200" />

      {/* TEXT CONTROLS */}
      {element.type === 'text' && (
        <>
          {/* Font Family */}
          <div className="flex items-center gap-1">
            <select
              value={(element as TextElement).fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded px-2 py-1 text-xs font-medium text-neutral-800 outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-400 font-medium">Size</span>
            <input
              type="number"
              min={9}
              max={120}
              value={(element as TextElement).fontSize}
              onChange={(e) => onUpdate({ fontSize: Math.max(8, Number(e.target.value)) })}
              className="w-13 bg-neutral-50 border border-neutral-200 rounded px-1.5 py-1 text-xs text-center font-medium focus:ring-1 focus:ring-neutral-400 outline-none"
            />
            <span className="text-neutral-400 text-[10px]">px</span>
          </div>

          {/* Line Height (Editable Feature) */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded px-2 py-0.5">
            <span className="text-neutral-500 font-medium text-[11px]">Line Height</span>
            <input
              type="number"
              min={0.8}
              max={4.0}
              step={0.1}
              value={(element as TextElement).lineHeight || 1.4}
              onChange={(e) =>
                onUpdate({ lineHeight: Math.max(0.8, Number(parseFloat(e.target.value).toFixed(1))) })
              }
              className="w-12 bg-white border border-neutral-200 rounded px-1 py-0.5 text-xs text-center font-medium outline-none"
            />
            <select
              value={(element as TextElement).lineHeight || 1.4}
              onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
              className="bg-transparent text-[11px] text-neutral-500 cursor-pointer outline-none"
              title="Preset Line Heights"
            >
              {LINE_HEIGHT_OPTIONS.map((lh) => (
                <option key={lh} value={lh}>
                  {lh}x
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-neutral-200" />

          {/* Font Styles: Bold, Italic, Underline */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200">
            <button
              title="Bold (Ctrl+B)"
              onClick={() =>
                onUpdate({
                  fontWeight:
                    (element as TextElement).fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`p-1 rounded transition-colors ${
                (element as TextElement).fontWeight === 'bold'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              title="Italic (Ctrl+I)"
              onClick={() =>
                onUpdate({
                  fontStyle:
                    (element as TextElement).fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-1 rounded transition-colors ${
                (element as TextElement).fontStyle === 'italic'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              title="Underline (Ctrl+U)"
              onClick={() =>
                onUpdate({
                  textDecoration:
                    (element as TextElement).textDecoration === 'underline'
                      ? 'none'
                      : 'underline',
                })
              }
              className={`p-1 rounded transition-colors ${
                (element as TextElement).textDecoration === 'underline'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200">
            {(['left', 'center', 'right', 'justify'] as const).map((align) => {
              const Icon =
                align === 'left'
                  ? AlignLeft
                  : align === 'center'
                  ? AlignCenter
                  : align === 'right'
                  ? AlignRight
                  : AlignJustify;
              const isActive = (element as TextElement).textAlign === align;
              return (
                <button
                  key={align}
                  title={`Align ${align}`}
                  onClick={() => onUpdate({ textAlign: align })}
                  className={`p-1 rounded transition-colors ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-neutral-200" />

          {/* Text Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Color</span>
            <div className="flex items-center gap-1">
              <label className="relative cursor-pointer flex items-center">
                <input
                  type="color"
                  value={(element as TextElement).color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-neutral-300 p-0 overflow-hidden"
                />
              </label>
              <div className="flex items-center gap-1 ml-1">
                {PRESET_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdate({ color: c })}
                    style={{ backgroundColor: c }}
                    className="w-3.5 h-3.5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* IMAGE CONTROLS */}
      {element.type === 'image' && (
        <>
          <div className="flex items-center gap-2">
            {/* Position to Left, Right, or Beneath page */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200 gap-0.5">
              <button
                onClick={() => {
                  if (onAlignImagePosition) {
                    onAlignImagePosition('left');
                  } else {
                    onUpdate({ x: 30 });
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors"
                title="Position image to Left side of page"
              >
                <ArrowLeftToLine className="w-3.5 h-3.5" />
                <span>To Left</span>
              </button>
              <button
                onClick={() => {
                  if (onAlignImagePosition) {
                    onAlignImagePosition('right');
                  } else {
                    onUpdate({ x: Math.max(0, PAGE_WIDTH - element.width - 30) });
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors"
                title="Position image to Right side of page"
              >
                <ArrowRightToLine className="w-3.5 h-3.5" />
                <span>To Right</span>
              </button>
              <button
                onClick={() => {
                  if (onAlignImagePosition) {
                    onAlignImagePosition('beneath');
                  } else {
                    onUpdate({ y: element.y + 120 });
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors"
                title="Position image Beneath existing elements"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>To Beneath</span>
              </button>
            </div>

            {/* Crop Info & Reset */}
            {((element as ImageElement).crop.top > 0 ||
              (element as ImageElement).crop.right > 0 ||
              (element as ImageElement).crop.bottom > 0 ||
              (element as ImageElement).crop.left > 0) && (
              <button
                onClick={() =>
                  onUpdate({ crop: { top: 0, right: 0, bottom: 0, left: 0 } })
                }
                className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                title="Reset crop edges to 0%"
              >
                <CropIcon className="w-3.5 h-3.5" />
                <span>Reset Crop</span>
              </button>
            )}

            <button
              onClick={() =>
                onUpdate({
                  aspectRatioLocked: (element as ImageElement).aspectRatioLocked === false ? true : false,
                })
              }
              className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                (element as ImageElement).aspectRatioLocked !== false
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
              title="Lock/unlock aspect ratio"
            >
              {(element as ImageElement).aspectRatioLocked !== false ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Ratio</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Free Resize</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* EMBED CONTROLS */}
      {element.type === 'embed' && (
        <div className="flex items-center gap-2">
          {/* Interact / Test Live Mode Toggle */}
          {onToggleInteractive && (
            <button
              onClick={onToggleInteractive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                isInteractive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 shadow-xs'
              }`}
              title={
                isInteractive
                  ? 'Exit live interaction to reposition/resize element'
                  : 'Interact with embedded buttons, forms, and scripts'
              }
            >
              {isInteractive ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Done Testing</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-emerald-600" />
                  <span>Interact</span>
                </>
              )}
            </button>
          )}

          {/* Edit HTML + CSS + JS Button */}
          <button
            onClick={onOpenEmbedEditor}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition-colors"
          >
            <CodeIcon className="w-3.5 h-3.5" />
            <span>Edit HTML + CSS + JS</span>
          </button>

          <span className="text-[11px] text-neutral-400">
            Interactive sandboxed renderer
          </span>
        </div>
      )}

      <div className="h-4 w-px bg-neutral-200" />

      {/* Rotation Indicator & Reset */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdate({ rotation: 0 })}
          title="Reset rotation to 0°"
          className="flex items-center gap-1 px-1.5 py-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{Math.round(element.rotation)}°</span>
        </button>
      </div>

      {/* Layer Ordering */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onBringForward}
          title="Bring to Front"
          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
        >
          <BringToFront className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onSendBackward}
          title="Send to Back"
          className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
        >
          <SendToBack className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-neutral-200" />

      {/* Cut, Duplicate & Delete */}
      <div className="flex items-center gap-1">
        {onCut && (
          <button
            onClick={onCut}
            title="Cut Element to move to another page (Ctrl+X)"
            className="p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDuplicate}
          title="Duplicate Element (Ctrl+D)"
          className="p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="Delete Element (Del)"
          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

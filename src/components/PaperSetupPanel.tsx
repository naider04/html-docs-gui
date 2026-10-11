import React from 'react';
import {
  PaperFormat,
  PaperOrientation,
  DocumentPage,
} from '../types';
import {
  Compass,
  FileText,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface PaperSetupPanelProps {
  paperFormat: PaperFormat;
  onPaperFormatChange: (format: PaperFormat) => void;
  orientation: PaperOrientation;
  onOrientationChange: (orientation: PaperOrientation) => void;
  pageWidth: number;
  pageHeight: number;
  onCustomDimensionsChange: (width: number, height: number) => void;
  pages: DocumentPage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const PaperSetupPanel: React.FC<PaperSetupPanelProps> = ({
  paperFormat,
  onPaperFormatChange,
  orientation,
  onOrientationChange,
  pageWidth,
  pageHeight,
  onCustomDimensionsChange,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
}) => {
  return (
    <aside className="no-print w-60 h-full bg-white/95 backdrop-blur-md border-r border-neutral-200/90 flex flex-col shrink-0 z-20 select-none shadow-xs text-xs text-neutral-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-semibold text-neutral-800 text-xs">Paper & Sheet Setup</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 font-semibold">
          {paperFormat}
        </span>
      </div>

      {/* Content - Scrolls within the panel if needed */}
      <div className="p-3.5 space-y-4 overflow-y-auto flex-1">
        {/* 1. PAPER SIZE SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-neutral-600 font-medium">Paper Size</label>
          <select
            value={paperFormat}
            onChange={(e) => onPaperFormatChange(e.target.value as PaperFormat)}
            className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded px-2 py-1.5 text-xs text-neutral-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">US Letter (8.5 × 11 in)</option>
            <option value="Legal">US Legal (8.5 × 14 in)</option>
            <option value="A3">A3 (297 × 420 mm)</option>
            <option value="A5">A5 (148 × 210 mm)</option>
            <option value="Custom">Custom Dimensions</option>
          </select>
        </div>

        {/* 2. ORIENTATION TOGGLE */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-neutral-600 font-medium">Orientation</label>
          <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-neutral-100 rounded border border-neutral-200">
            <button
              onClick={() => onOrientationChange('portrait')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
                orientation === 'portrait'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="w-2.5 h-3.5 border border-current rounded-2xs" />
              <span>Portrait</span>
            </button>

            <button
              onClick={() => onOrientationChange('landscape')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
                orientation === 'landscape'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="w-3.5 h-2.5 border border-current rounded-2xs" />
              <span>Landscape</span>
            </button>
          </div>
        </div>

        {/* 3. DIMENSIONS READOUT / CUSTOM INPUT */}
        {paperFormat === 'Custom' ? (
          <div className="space-y-1.5 bg-neutral-50 border border-neutral-200 rounded p-2.5">
            <label className="text-[11px] text-neutral-600 font-medium">Custom Width & Height</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-white border border-neutral-200 rounded px-2 py-1">
                <span className="text-neutral-400 text-[10px] w-4">W</span>
                <input
                  type="number"
                  min={300}
                  max={3000}
                  value={pageWidth}
                  onChange={(e) =>
                    onCustomDimensionsChange(
                      Math.max(300, Number(e.target.value) || 794),
                      pageHeight
                    )
                  }
                  className="w-full bg-transparent text-right font-mono text-xs outline-none"
                />
                <span className="text-neutral-400 text-[10px] ml-1">px</span>
              </div>

              <div className="flex items-center bg-white border border-neutral-200 rounded px-2 py-1">
                <span className="text-neutral-400 text-[10px] w-4">H</span>
                <input
                  type="number"
                  min={300}
                  max={3000}
                  value={pageHeight}
                  onChange={(e) =>
                    onCustomDimensionsChange(
                      pageWidth,
                      Math.max(300, Number(e.target.value) || 1123)
                    )
                  }
                  className="w-full bg-transparent text-right font-mono text-xs outline-none"
                />
                <span className="text-neutral-400 text-[10px] ml-1">px</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 font-mono">
            <span>Dimensions:</span>
            <span className="text-neutral-800 font-semibold">{pageWidth} × {pageHeight} px</span>
          </div>
        )}

        {/* 4. PAGES LIST & NAVIGATION */}
        <div className="space-y-2 pt-2 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-neutral-400" />
              Document Pages ({pages.length})
            </span>
            <button
              onClick={onAddPage}
              className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
              title="Add New Sheet"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {pages.map((p, idx) => {
              const isCurrent = p.id === activePageId;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPage(p.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-medium'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-center font-mono text-[10px] text-neutral-400">
                      {idx + 1}
                    </span>
                    <span className="truncate text-xs">
                      Page {idx + 1}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ({p.elements.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, idx - 1);
                        }}
                        className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                        title="Move Page Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    )}
                    {idx < pages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, idx + 1);
                        }}
                        className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                        title="Move Page Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(p.id);
                      }}
                      className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                      title="Duplicate Page"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(p.id);
                        }}
                        className="p-0.5 text-red-400 hover:text-red-600 rounded"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. SUMMARY INFO */}
        <div className="pt-2 border-t border-neutral-200 space-y-1.5 text-[11px] text-neutral-500">
          <div className="flex justify-between">
            <span className="text-neutral-400">Total Sheets:</span>
            <span className="font-semibold text-neutral-800">{pages.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Total Elements:</span>
            <span className="font-semibold text-neutral-800">
              {pages.reduce((acc, p) => acc + p.elements.length, 0)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

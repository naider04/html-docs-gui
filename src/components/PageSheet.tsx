import React from 'react';
import { DocumentPage, DocElement, PAGE_WIDTH, PAGE_HEIGHT } from '../types';
import { CanvasElement } from './CanvasElement';
import { Trash2, Copy, ChevronUp, ChevronDown, Plus } from 'lucide-react';

interface PageSheetProps {
  page: DocumentPage;
  pageIndex: number;
  totalPages: number;
  isActive: boolean;
  selectedElementId: string | null;
  zoom: number;
  onSelectPage: () => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updated: Partial<DocElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddNextPage: (afterIndex: number) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onOpenEmbedEditor: (elementId: string) => void;
  interactiveEmbedId?: string | null;
  pageWidth?: number;
  pageHeight?: number;
}

export const PageSheet: React.FC<PageSheetProps> = ({
  page,
  pageIndex,
  totalPages,
  isActive,
  selectedElementId,
  zoom,
  onSelectPage,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onAddNextPage,
  onDeletePage,
  onDuplicatePage,
  onMovePage,
  onOpenEmbedEditor,
  interactiveEmbedId,
  pageWidth = PAGE_WIDTH,
  pageHeight = PAGE_HEIGHT,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Page Header / Meta Bar */}
      <div
        className="no-print w-full flex items-center justify-between text-xs text-neutral-500 mb-2 px-1"
        style={{ maxWidth: `${pageWidth}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-700 bg-white/80 px-2 py-0.5 rounded shadow-xs border border-neutral-200">
            Page {pageIndex + 1} of {totalPages}
          </span>
          {isActive && (
            <span className="text-[11px] text-blue-600 font-medium">Active Sheet</span>
          )}
        </div>

        {/* Page Actions */}
        <div className="flex items-center gap-1 bg-white/80 border border-neutral-200/90 rounded px-1.5 py-0.5 shadow-xs">
          {pageIndex > 0 && (
            <button
              onClick={() => onMovePage(pageIndex, pageIndex - 1)}
              className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded"
              title="Move Page Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          {pageIndex < totalPages - 1 && (
            <button
              onClick={() => onMovePage(pageIndex, pageIndex + 1)}
              className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded"
              title="Move Page Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDuplicatePage(page.id)}
            className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded"
            title="Duplicate Page"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {totalPages > 1 && (
            <button
              onClick={() => onDeletePage(page.id)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              title="Delete Page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* The White Sheet */}
      <div
        className={`page-sheet relative bg-white transition-shadow ${
          isActive
            ? 'shadow-[0_12px_32px_rgba(0,0,0,0.14)] ring-1 ring-blue-500/20'
            : 'shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
        }`}
        style={{
          width: `${pageWidth}px`,
          height: `${pageHeight}px`,
          minHeight: `${pageHeight}px`,
          maxHeight: `${pageHeight}px`,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={() => {
          onSelectPage();
          onSelectElement(null);
        }}
      >
        {/* Subtle empty placeholder */}
        {page.elements.length === 0 && (
          <div className="no-print absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-neutral-300">
            <p className="text-sm font-medium">Empty sheet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Add Text, Image (Ctrl+V), or HTML Embed here
            </p>
          </div>
        )}

        {/* Elements on this page */}
        {page.elements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={selectedElementId === el.id}
            zoom={zoom}
            onSelect={(e) => {
              e.stopPropagation();
              onSelectPage();
              onSelectElement(el.id);
            }}
            onUpdate={(updated) => onUpdateElement(el.id, updated)}
            onDelete={() => onDeleteElement(el.id)}
            onOpenEmbedEditor={() => onOpenEmbedEditor(el.id)}
            isInteractive={interactiveEmbedId === el.id}
          />
        ))}
      </div>

      {/* Button to add the next page/sheet */}
      <div className="no-print my-6 flex items-center justify-center w-full">
        <button
          onClick={() => onAddNextPage(pageIndex)}
          className="group flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-neutral-600 hover:text-neutral-900 font-medium text-xs rounded-full border border-neutral-300/80 hover:border-neutral-400 shadow-sm hover:shadow transition-all hover:scale-105"
        >
          <div className="w-5 h-5 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>Add Next Page</span>
        </button>
      </div>
    </div>
  );
};

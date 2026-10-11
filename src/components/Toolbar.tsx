import React, { useRef, useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Code as CodeIcon,
  PlusSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  FileText,
  ChevronDown,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowDownToLine,
} from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: (src: string, placement?: 'left' | 'right' | 'beneath') => void;
  onAddEmbed: () => void;
  onAddPage: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onExportHtml: () => void;
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddImage,
  onAddEmbed,
  onAddPage,
  zoom,
  onZoomChange,
  onExportHtml,
  title,
  onTitleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingPlacement, setPendingPlacement] = useState<'left' | 'right' | 'beneath'>('beneath');
  const [showImageMenu, setShowImageMenu] = useState(false);

  const handleTriggerUpload = (placement: 'left' | 'right' | 'beneath' = 'beneath') => {
    setPendingPlacement(placement);
    setShowImageMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        onAddImage(result, pendingPlacement);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-xs px-4 py-2 flex items-center justify-between gap-4 select-none">
      {/* Brand & Document Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-neutral-900 block leading-tight">
              PageCraft
            </span>
            <span className="text-[10px] text-neutral-400 block leading-tight">
              Document Editor
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

        {/* Editable Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Document"
          className="bg-transparent hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm font-medium text-neutral-800 rounded px-2 py-1 border border-transparent hover:border-neutral-200 focus:border-neutral-300 outline-none transition-colors w-36 sm:w-48 truncate"
        />
      </div>

      {/* Main Creation Tools */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onAddText}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/90 active:bg-neutral-200 text-neutral-800 rounded-md text-xs font-medium transition-colors shadow-xs"
          title="Add Text Block"
        >
          <Type className="w-3.5 h-3.5 text-neutral-700" />
          <span>Add Text</span>
        </button>

        {/* Add Image with Left, Right, Beneath placement options */}
        <div className="relative">
          <div className="flex items-center bg-neutral-100 rounded-md shadow-xs border border-neutral-200/50">
            <button
              onClick={() => handleTriggerUpload('beneath')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-l-md transition-colors"
              title="Add Image beneath elements (or Ctrl+V to paste)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
              <span>Add Image</span>
            </button>
            <button
              onClick={() => setShowImageMenu(!showImageMenu)}
              className="px-1.5 py-1.5 hover:bg-neutral-200 text-neutral-600 rounded-r-md border-l border-neutral-200 transition-colors"
              title="Image Placement Options (Left, Right, Beneath)"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 w-44 z-50 text-xs text-neutral-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                Position on page
              </div>
              <button
                onClick={() => handleTriggerUpload('left')}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 text-left"
              >
                <ArrowLeftToLine className="w-3.5 h-3.5 text-neutral-500" />
                <span>To Left Side</span>
              </button>
              <button
                onClick={() => handleTriggerUpload('right')}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 text-left"
              >
                <ArrowRightToLine className="w-3.5 h-3.5 text-neutral-500" />
                <span>To Right Side</span>
              </button>
              <button
                onClick={() => handleTriggerUpload('beneath')}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 text-left"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-neutral-500" />
                <span>Beneath Page/Elements</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* HTML+CSS+JS Embed Block */}
        <button
          onClick={onAddEmbed}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/90 active:bg-neutral-200 text-neutral-800 rounded-md text-xs font-medium transition-colors shadow-xs"
          title="Embed custom HTML, CSS, and JS"
        >
          <CodeIcon className="w-3.5 h-3.5 text-neutral-700" />
          <span>HTML Embed</span>
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-1 hidden md:block" />

        <button
          onClick={onAddPage}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 rounded-md text-xs font-medium transition-colors"
          title="Add Next Page"
        >
          <PlusSquare className="w-3.5 h-3.5" />
          <span>Add Page</span>
        </button>
      </div>

      {/* Right Controls: Zoom & Export HTML (No Print/PDF) */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-neutral-100 rounded-md p-0.5 border border-neutral-200">
          <button
            onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(1))))}
            className="p-1 text-neutral-600 hover:text-neutral-900 rounded hover:bg-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="px-2 text-[11px] font-medium text-neutral-700 hover:text-neutral-900"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(1.5, Number((zoom + 0.1).toFixed(1))))}
            className="p-1 text-neutral-600 hover:text-neutral-900 rounded hover:bg-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(0.85)}
            className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-white"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <div className="h-4 w-px bg-neutral-200 hidden lg:block" />

        {/* Deterministic HTML Export */}
        <button
          onClick={onExportHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
          title="Export standalone HTML document"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
};

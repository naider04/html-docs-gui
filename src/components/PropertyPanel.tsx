import React from 'react';
import {
  DocElement,
  TextElement,
  ImageElement,
} from '../types';
import {
  Maximize2,
  RotateCw,
  Layers,
  Crop as CropIcon,
  Lock,
  Unlock,
  Move,
  FileText,
  Sliders,
} from 'lucide-react';

interface PropertyPanelProps {
  selectedElement: DocElement | null;
  onUpdateElement: (id: string, updated: Partial<DocElement>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedElement,
  onUpdateElement,
}) => {
  return (
    <aside className="no-print w-64 h-full bg-white/95 backdrop-blur-md border-l border-neutral-200/90 flex flex-col shrink-0 z-20 select-none shadow-xs text-xs text-neutral-700">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-semibold text-neutral-800 text-xs">Element Properties</span>
        </div>
        {selectedElement && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold">
            {selectedElement.type}
          </span>
        )}
      </div>

      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        {selectedElement ? (
          <div className="space-y-4">
            {/* 1. POSITION & DIMENSIONS (LIVE EDITABLE) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-3 h-3 text-neutral-400" />
                Position & Size
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* X Position */}
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
                  <span className="text-neutral-400 font-mono font-medium text-[11px] w-4">X</span>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        x: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-transparent text-right font-mono text-neutral-800 outline-none text-xs"
                  />
                  <span className="text-neutral-400 text-[10px] ml-1">px</span>
                </div>

                {/* Y Position */}
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
                  <span className="text-neutral-400 font-mono font-medium text-[11px] w-4">Y</span>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        y: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-transparent text-right font-mono text-neutral-800 outline-none text-xs"
                  />
                  <span className="text-neutral-400 text-[10px] ml-1">px</span>
                </div>

                {/* Width */}
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
                  <span className="text-neutral-400 font-mono font-medium text-[11px] w-4">W</span>
                  <input
                    type="number"
                    min={20}
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => {
                      const newW = Math.max(20, Number(e.target.value) || 20);
                      if (
                        selectedElement.type === 'image' &&
                        (selectedElement as ImageElement).aspectRatioLocked !== false
                      ) {
                        const ratio = selectedElement.height / selectedElement.width;
                        onUpdateElement(selectedElement.id, {
                          width: newW,
                          height: Math.round(newW * ratio),
                        });
                      } else {
                        onUpdateElement(selectedElement.id, { width: newW });
                      }
                    }}
                    className="w-full bg-transparent text-right font-mono text-neutral-800 outline-none text-xs"
                  />
                  <span className="text-neutral-400 text-[10px] ml-1">px</span>
                </div>

                {/* Height */}
                <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
                  <span className="text-neutral-400 font-mono font-medium text-[11px] w-4">H</span>
                  <input
                    type="number"
                    min={20}
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => {
                      const newH = Math.max(20, Number(e.target.value) || 20);
                      if (
                        selectedElement.type === 'image' &&
                        (selectedElement as ImageElement).aspectRatioLocked !== false
                      ) {
                        const ratio = selectedElement.width / selectedElement.height;
                        onUpdateElement(selectedElement.id, {
                          height: newH,
                          width: Math.round(newH * ratio),
                        });
                      } else {
                        onUpdateElement(selectedElement.id, { height: newH });
                      }
                    }}
                    className="w-full bg-transparent text-right font-mono text-neutral-800 outline-none text-xs"
                  />
                  <span className="text-neutral-400 text-[10px] ml-1">px</span>
                </div>
              </div>
            </div>

            {/* 2. ROTATION */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-neutral-400" />
                Rotation
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400">
                  <span className="text-neutral-400 font-mono font-medium text-[11px] w-4">∠</span>
                  <input
                    type="number"
                    value={Math.round(selectedElement.rotation)}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        rotation: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-transparent text-right font-mono text-neutral-800 outline-none text-xs"
                  />
                  <span className="text-neutral-400 text-[10px] ml-1">°</span>
                </div>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { rotation: 0 })}
                  className="px-2 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                  title="Reset rotation to 0°"
                >
                  0°
                </button>
                <button
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      rotation: (Math.round(selectedElement.rotation) + 90) % 360,
                    })
                  }
                  className="px-2 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[11px]"
                  title="Rotate +90°"
                >
                  +90°
                </button>
              </div>
            </div>

            {/* 3. IMAGE CROPPING & RATIO */}
            {selectedElement.type === 'image' && (
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CropIcon className="w-3 h-3 text-neutral-400" />
                    Crop Insets (%)
                  </span>
                  {((selectedElement as ImageElement).crop.top > 0 ||
                    (selectedElement as ImageElement).crop.right > 0 ||
                    (selectedElement as ImageElement).crop.bottom > 0 ||
                    (selectedElement as ImageElement).crop.left > 0) && (
                    <button
                      onClick={() =>
                        onUpdateElement(selectedElement.id, {
                          crop: { top: 0, right: 0, bottom: 0, left: 0 },
                        })
                      }
                      className="text-[10px] text-amber-700 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1">
                    <span className="text-neutral-400 text-[10px] w-8">Top</span>
                    <input
                      type="number"
                      min={0}
                      max={85}
                      value={(selectedElement as ImageElement).crop.top}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(85, Number(e.target.value) || 0));
                        onUpdateElement(selectedElement.id, {
                          crop: { ...(selectedElement as ImageElement).crop, top: val },
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">%</span>
                  </div>

                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1">
                    <span className="text-neutral-400 text-[10px] w-8">Right</span>
                    <input
                      type="number"
                      min={0}
                      max={85}
                      value={(selectedElement as ImageElement).crop.right}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(85, Number(e.target.value) || 0));
                        onUpdateElement(selectedElement.id, {
                          crop: { ...(selectedElement as ImageElement).crop, right: val },
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">%</span>
                  </div>

                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1">
                    <span className="text-neutral-400 text-[10px] w-8">Bottom</span>
                    <input
                      type="number"
                      min={0}
                      max={85}
                      value={(selectedElement as ImageElement).crop.bottom}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(85, Number(e.target.value) || 0));
                        onUpdateElement(selectedElement.id, {
                          crop: { ...(selectedElement as ImageElement).crop, bottom: val },
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">%</span>
                  </div>

                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1">
                    <span className="text-neutral-400 text-[10px] w-8">Left</span>
                    <input
                      type="number"
                      min={0}
                      max={85}
                      value={(selectedElement as ImageElement).crop.left}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(85, Number(e.target.value) || 0));
                        onUpdateElement(selectedElement.id, {
                          crop: { ...(selectedElement as ImageElement).crop, left: val },
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-500">Aspect Ratio</span>
                  <button
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        aspectRatioLocked:
                          (selectedElement as ImageElement).aspectRatioLocked === false ? true : false,
                      })
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border ${
                      (selectedElement as ImageElement).aspectRatioLocked !== false
                        ? 'bg-neutral-800 text-white border-neutral-800'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {(selectedElement as ImageElement).aspectRatioLocked !== false ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Free</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 4. TEXT PROPERTIES */}
            {selectedElement.type === 'text' && (
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-neutral-400" />
                  Typography
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5">
                    <span className="text-neutral-400 text-[10px] w-10">Size</span>
                    <input
                      type="number"
                      min={8}
                      max={120}
                      value={(selectedElement as TextElement).fontSize}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          fontSize: Math.max(8, Number(e.target.value) || 16),
                        })
                      }
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">px</span>
                  </div>

                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5">
                    <span className="text-neutral-400 text-[10px] w-10">Line H</span>
                    <input
                      type="number"
                      min={0.8}
                      max={4.0}
                      step={0.1}
                      value={(selectedElement as TextElement).lineHeight || 1.4}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          lineHeight: Math.max(0.8, Number(parseFloat(e.target.value).toFixed(1))),
                        })
                      }
                      className="w-full bg-transparent text-right font-mono text-xs outline-none"
                    />
                    <span className="text-neutral-400 text-[10px] ml-1">x</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LAYER Z-INDEX */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-neutral-400" />
                Stacking Order
              </span>
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5">
                <span className="text-neutral-500 text-[11px]">Layer Z-Index</span>
                <span className="font-mono font-semibold text-neutral-800">{selectedElement.zIndex}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center space-y-2 text-neutral-400">
            <Maximize2 className="w-6 h-6 mx-auto text-neutral-300" />
            <p className="text-xs font-medium text-neutral-600">No element selected</p>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Click any text, image, or HTML embed on the paper sheet to view and edit its live position and size.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

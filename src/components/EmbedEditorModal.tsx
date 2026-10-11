import React, { useState } from 'react';
import { EmbedElement } from '../types';
import { X, Check, Code, Palette, Zap } from 'lucide-react';

interface EmbedEditorModalProps {
  element: EmbedElement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { html: string; css: string; js: string }) => void;
}

export const EmbedEditorModal: React.FC<EmbedEditorModalProps> = ({
  element,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !element) return null;

  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [html, setHtml] = useState(element.html || '');
  const [css, setCss] = useState(element.css || '');
  const [js, setJs] = useState(element.js || '');

  const handleApply = () => {
    onSave({ html, css, js });
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">
              Custom HTML + CSS + JS Embed
            </h3>
            <p className="text-xs text-neutral-500">
              Live rendered directly inside your document
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-neutral-200 px-5 pt-2 bg-neutral-50/50 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'html'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'css'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>CSS</span>
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'js'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>JavaScript</span>
          </button>
        </div>

        {/* Code Editors */}
        <div className="flex-1 p-4 bg-neutral-900 overflow-auto min-h-[300px]">
          {activeTab === 'html' && (
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<!-- Write HTML here -->\n<div class='custom-card'>Hello World</div>"
              className="w-full h-full min-h-[280px] bg-transparent text-emerald-400 font-mono text-xs outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activeTab === 'css' && (
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="/* Write CSS styles here */\n.custom-card {\n  background: #2563eb;\n  color: white;\n  padding: 16px;\n}"
              className="w-full h-full min-h-[280px] bg-transparent text-blue-300 font-mono text-xs outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activeTab === 'js' && (
            <textarea
              value={js}
              onChange={(e) => setJs(e.target.value)}
              placeholder="// Write JavaScript here\nconsole.log('Embed initialized');"
              className="w-full h-full min-h-[280px] bg-transparent text-amber-300 font-mono text-xs outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 bg-neutral-50">
          <span className="text-[11px] text-neutral-400 font-mono">
            Renders securely inside an isolated sandbox
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

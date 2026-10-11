import React, { useState, useEffect } from 'react';
import { EmbedElement } from '../types';
import { X, Check, Code, Sparkles } from 'lucide-react';

interface EmbedEditorModalProps {
  element: EmbedElement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (combinedHtml: string) => void;
}

export const EmbedEditorModal: React.FC<EmbedEditorModalProps> = ({
  element,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !element) return null;

  // Prepare initial unified HTML containing HTML, <style>, and <script>
  const getInitialCode = () => {
    // If element already has combined markup or legacy split fields
    let code = element.html || '';

    // If there were legacy css or js fields not yet included in html
    if (element.css && !code.includes('<style')) {
      code = `<style>\n${element.css.trim()}\n</style>\n\n` + code;
    }
    if (element.js && !code.includes('<script')) {
      code = code + `\n\n<script>\n${element.js.trim()}\n</script>`;
    }

    return code;
  };

  const [code, setCode] = useState(getInitialCode());

  // Sync if element changes
  useEffect(() => {
    setCode(getInitialCode());
  }, [element]);

  const handleApply = () => {
    onSave(code);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                HTML Embed Editor
              </h3>
              <p className="text-xs text-neutral-500">
                Write HTML markup with embedded <code className="text-blue-600 font-mono text-[11px]">&lt;style&gt;</code> and <code className="text-amber-600 font-mono text-[11px]">&lt;script&gt;</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Single Unified Editor Body */}
        <div className="flex-1 p-4 bg-neutral-900 overflow-auto min-h-[340px] flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pb-2 mb-2 border-b border-neutral-800">
            <span>document.html</span>
            <span className="text-neutral-500">Supports full HTML5, &lt;style&gt;, and &lt;script&gt;</span>
          </div>
          <textarea
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`<!-- Write HTML with <style> and <script> here -->\n<div class="card">\n  <h3>Hello World</h3>\n  <button id="btn">Click Me</button>\n</div>\n\n<style>\n.card {\n  padding: 16px;\n  background: #2563eb;\n  color: white;\n  border-radius: 8px;\n  text-align: center;\n}\n</style>\n\n<script>\ndocument.getElementById('btn').addEventListener('click', () => {\n  alert('Button clicked!');\n});\n</script>`}
            className="flex-1 w-full min-h-[300px] bg-transparent text-emerald-300 font-mono text-xs outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Renders live inside your document</span>
          </div>
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

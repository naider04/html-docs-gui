export type ElementType = 'text' | 'image' | 'embed';

export interface ImageCrop {
  top: number;    // percentage 0 to 100
  right: number;  // percentage 0 to 100
  bottom: number; // percentage 0 to 100
  left: number;   // percentage 0 to 100
}

export interface BaseElement {
  id: string;
  pageId: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  lineHeight: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  crop: ImageCrop;
  aspectRatioLocked?: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface EmbedElement extends BaseElement {
  type: 'embed';
  html: string;
  css?: string;
  js?: string;
}

export type DocElement = TextElement | ImageElement | EmbedElement;

export interface DocumentPage {
  id: string;
  elements: DocElement[];
}

export interface DocumentState {
  title: string;
  pages: DocumentPage[];
}

export type PaperFormat = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Custom';
export type PaperOrientation = 'portrait' | 'landscape';

export interface PaperConfig {
  format: PaperFormat;
  orientation: PaperOrientation;
  width: number;
  height: number;
}

export const PAPER_PRESETS: Record<Exclude<PaperFormat, 'Custom'>, { width: number; height: number; label: string }> = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' },
  A3: { width: 1123, height: 1587, label: 'A3 (297 × 420 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
};

// Standard A4 default dimensions in CSS px at 96 DPI
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

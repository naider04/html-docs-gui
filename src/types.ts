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
  css: string;
  js: string;
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

// Standard A4 dimensions in CSS px at 96 DPI
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

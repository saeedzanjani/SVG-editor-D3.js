import * as d3 from 'd3';

// UI Component related interfaces

export interface LabelCustomization {
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  textAnchor: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';

export type InputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'url' | 'tel';

export type InputSize = 'small' | 'medium' | 'large';

// Property panel interfaces
export interface PropertyGroup {
  name: string;
  properties: Property[];
  expanded: boolean;
}

export interface Property {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'range';
  value: string | number | boolean;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface TransformValues {
  scaleX: number;
  scaleY: number;
  rotate: number;
}

// Canvas-related interfaces
export interface CanvasTransform {
  panX: number;
  panY: number;
  zoom: number;
}


export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeHandle {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface CanvasState {
  showGrid: boolean;
  showRulers: boolean;
  showContextMenu: boolean;
  showMousePosition: boolean;
  contextMenuPosition: MousePosition;
  rightClickPosition: MousePosition;
  mousePosition: MousePosition;
}

// Additional component interfaces
export interface FileUploadEvent {
  file: File;
}

export interface CategoryOption {
  id: string;
  name: string;
}


export interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}


export interface DragDropEvent {
  type: 'dragstart' | 'dragend' | 'dragover' | 'dragleave' | 'drop';
  data: unknown;
  position?: { x: number; y: number };
  files?: FileList;
}

// Toolbar-related interfaces
export interface ToolConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface SaveResult {
  success: boolean;
  message: string;
}

export interface StatusItem {
  label: string;
  value: string;
  type?: 'normal' | 'preview' | 'warning' | 'error';
}

// Service-related interfaces
export interface FileUploadResult {
  success: boolean;
  template?: any;
  error?: string;
}

export interface AnimationConfig {
  elementId: string;
  enabled: boolean;
  type: 'color-change' | 'scale' | 'rotate' | 'opacity';
  duration: number;
  interval: number;
  color?: string;
  originalColor?: string;
  intervalId?: any;
}

export interface StoredSvgData {
  id: string;
  name: string;
  svgContent: string;
  timestamp: number;
  thumbnail?: string;
}

// Utils-related interfaces
export interface CanvasInteractionConfig {
  svgEditorService: any;
  dialogManager?: any;
  signals: {
    rightClickPosition: () => { x: number; y: number };
    showContextMenu: { set: (value: boolean) => void };
  };
}

export interface SelectionConfig {
  svgEditorService: any;
}

export interface MenuState {
  showFileMenu: any; // WritableSignal<boolean>
  showEditMenu: any; // WritableSignal<boolean>
  showViewMenu: any; // WritableSignal<boolean>
}

export interface DrawingElement {
  id: string;
  type: string; // SvgElementType
  attributes: Record<string, any>;
  position: { x: number; y: number };
  selected: boolean;
}

export interface ContextMenuAction {
  type: 'addLabel' | 'addImageLabel' | 'uploadImage' | 'customizeLabel' | 'deleteElement';
  elementId?: string;
}

// D3-related types
export interface D3Selection {
  element: d3.Selection<any, any, any, any>;
  svgElementId: string;
}
export type D3DragEvent = d3.D3DragEvent<any, any, any>;
export type D3DragBehavior = d3.DragBehavior<any, any, any>;

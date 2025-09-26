export interface SvgElement {
  id: string;
  type: SvgElementType;
  attributes: Record<string, any>;
  children?: SvgElement[];
  parentId?: string;
  layerId: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  transform?: SvgTransform;
  bounds?: SvgBounds;
}

export interface SvgTransform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  skewX: number;
  skewY: number;
}

export interface SvgBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SvgLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

export enum SvgElementType {
  RECT = 'rect',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  LINE = 'line',
  POLYLINE = 'polyline',
  POLYGON = 'polygon',
  PATH = 'path',
  TEXT = 'text',
  IMAGE = 'image',
  GROUP = 'g',
  DEFS = 'defs',
  CLIP_PATH = 'clipPath',
  MASK = 'mask',
  GRADIENT = 'gradient',
  PATTERN = 'pattern'
}

export interface SvgEditorState {
  elements: SvgElement[];
  layers: SvgLayer[];
  selectedElementIds: string[];
  activeTool: EditorTool;
  canvas: {
    width: number;
    height: number;
    viewBox: string;
    zoom: number;
    panX: number;
    panY: number;
  };
}

export interface SvgEditorAction {
  id: string;
  type: ActionType;
  elementId?: string;
  data: any;
  timestamp: number;
}

export enum ActionType {
  ADD_ELEMENT = 'ADD_ELEMENT',
  REMOVE_ELEMENT = 'REMOVE_ELEMENT',
  UPDATE_ELEMENT = 'UPDATE_ELEMENT',
  MOVE_ELEMENT = 'MOVE_ELEMENT',
  TRANSFORM_ELEMENT = 'TRANSFORM_ELEMENT',
  SELECT_ELEMENT = 'SELECT_ELEMENT',
  GROUP_ELEMENTS = 'GROUP_ELEMENTS',
  UNGROUP_ELEMENTS = 'UNGROUP_ELEMENTS',
  COPY_ELEMENT = 'COPY_ELEMENT',
  PASTE_ELEMENT = 'PASTE_ELEMENT',
  CREATE_LAYER = 'CREATE_LAYER',
  DELETE_LAYER = 'DELETE_LAYER',
  UPDATE_LAYER = 'UPDATE_LAYER'
}

export enum EditorTool {
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  ZOOM = 'ZOOM',
  PAN = 'PAN'
}

export interface SvgEditorConfig {
  canvasWidth: number;
  canvasHeight: number;
  defaultViewBox: string;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  enableHistory: boolean;
  maxHistorySize: number;
}

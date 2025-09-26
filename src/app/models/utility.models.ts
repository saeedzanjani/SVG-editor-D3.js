// Utility and helper related interfaces

export interface DialogManagerConfig {
  signals: {
    showLabelCustomizationDialog: { set: (value: boolean) => void };
    selectedElementForDialog: { set: (value: any) => void };
  };
  callbacks: {
    onLabelCustomizationSave: (data: any) => void;
  };
}

export interface EventHandlerConfig {
  svgEditorService: any;
  previewModeService: any;
  getCanvasContainer: () => HTMLElement;
  getSvgCanvas: () => SVGSVGElement;
  getFileInput: () => HTMLInputElement;
  signals: {
    isDragging: { set: (value: boolean) => void };
    dragStart: { set: (value: { x: number; y: number }) => void };
    mousePosition: { set: (value: { x: number; y: number }) => void };
    showContextMenu: { set: (value: boolean) => void };
    contextMenuPosition: { set: (value: { x: number; y: number }) => void };
    rightClickPosition: { set: (value: { x: number; y: number }) => void };
    showLabelCustomizationDialog: { set: (value: boolean) => void };
    selectedElementForDialog: { set: (value: any) => void };
  };
  callbacks: {
    onLabelCustomizationSave: (data: any) => void;
    onTextToolClick: (position: { x: number; y: number }) => void;
  };
}

import { EditorTool } from '../models/svg-element.model';
import { ToolConfig } from '../models/component.models';

export const TOOLBAR_CONSTANTS = {
  TOOLS: [
    {
      id: EditorTool.SELECT,
      name: 'Select',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      description: 'Select and move elements'
    },
    {
      id: EditorTool.TEXT,
      name: 'Text',
      icon: 'M5 4v3h5.5v12h3V7H19V4H5z',
      description: 'Add text labels'
    },
    {
      id: 'image' as any,
      name: 'Image',
      icon: 'M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z',
      description: 'Add image labels'
    },
    {
      id: EditorTool.ZOOM,
      name: 'Zoom',
      icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
      description: 'Zoom in/out'
    },
    {
      id: EditorTool.PAN,
      name: 'Pan',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      description: 'Pan around the canvas'
    },
    {
      id: 'FIT_TO_SCREEN' as any,
      name: 'Fit to Screen',
      icon: 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z',
      description: 'Fit SVG content to screen'
    }
  ] as ToolConfig[],


  EXPORT_FILENAME: 'svg-editor-export.svg',
  DEFAULT_IMAGE_POSITION: { x: 100, y: 100 },
  DEFAULT_IMAGE_SIZE: { width: 100, height: 100 }
} as const;

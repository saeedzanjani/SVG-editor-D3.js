export const TEXT_CONSTANTS = {
  FONT_FAMILIES: [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'monospace', label: 'Monospace' }
  ],

  TEXT_ANCHORS: [
    { value: 'start', label: 'Left' },
    { value: 'middle', label: 'Center' },
    { value: 'end', label: 'Right' }
  ],

  FONT_SIZE: {
    MIN: 8,
    MAX: 200,
    DEFAULT: 16,
    STEP: 1
  },

  DEFAULT_COLOR: '#000000',
  DEFAULT_TEXT: 'New Label',

  PREVIEW: {
    SVG_WIDTH: 200,
    SVG_HEIGHT: 50,
    TEXT_Y: 25,
    TEXT_POSITIONS: {
      start: 10,
      middle: 100,
      end: 190
    }
  }
} as const;

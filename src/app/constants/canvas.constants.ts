export const CANVAS_CONSTANTS = {
  // Grid and UI
  GRID_SIZE: 20,
  MENU_WIDTH: 180,
  MENU_HEIGHT: 250,

  // Zoom limits
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 10,
  ZOOM_FACTOR: 1.2,
  ZOOM_DELTA: {
    IN: 1.1,
    OUT: 0.9
  },

  // Drawing thresholds
  MIN_SIZE_THRESHOLD: 5,
  MIN_RADIUS_THRESHOLD: 5,

  // Animation
  ANIMATION_SCALE: 1.2,
  ANIMATION_ROTATION: 360,
  ANIMATION_OPACITY: 0.3,

  // Default element properties
  DEFAULT_STROKE: '#000000',
  DEFAULT_STROKE_WIDTH: 2,
  DEFAULT_FILL: 'none',
  DEFAULT_TEXT_FILL: '#000000',
  DEFAULT_FONT_SIZE: '18',
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  DEFAULT_FONT_WEIGHT: 'normal',
  DEFAULT_TEXT_ANCHOR: 'start',

  // Element dimensions
  DEFAULT_IMAGE_WIDTH: 50,
  DEFAULT_IMAGE_HEIGHT: 50,
  DEFAULT_UPLOADED_IMAGE_WIDTH: 100,
  DEFAULT_UPLOADED_IMAGE_HEIGHT: 100,

  // Layer
  DEFAULT_LAYER_ID: 'default-layer',

  // File handling
  PLACEHOLDER_IMAGE: '/assets/placeholder-image.svg'
} as const;

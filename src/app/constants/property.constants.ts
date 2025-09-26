export const PROPERTY_CONSTANTS = {
  GROUPS: {
    BASIC: 'basic',
    APPEARANCE: 'appearance',
    TRANSFORM: 'transform',
    TYPE_SPECIFIC: 'type-specific',
    ANIMATION: 'animation'
  } as const,

  GROUP_TITLES: {
    'basic': 'Basic',
    'appearance': 'Appearance',
    'transform': 'Transform',
    'type-specific': 'Element Properties',
    'animation': 'Animation'
  } as const,

  DEFAULT_EXPANDED_GROUPS: ['basic', 'appearance', 'transform'] as const,

  FONT_FAMILIES: [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' }
  ] as const,

  TEXT_ANCHORS: [
    { value: 'start', label: 'Start' },
    { value: 'middle', label: 'Middle' },
    { value: 'end', label: 'End' }
  ] as const,

  ANIMATION_TYPES: [
    { value: 'color-change', label: 'Color Change' },
    { value: 'scale', label: 'Scale' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'opacity', label: 'Opacity' }
  ] as const,

  RANGES: {
    OPACITY: { min: 0, max: 1, step: 0.1 },
    STROKE_WIDTH: { min: 0, max: 50, step: 0.5 },
    FONT_SIZE: { min: 1, max: 200, step: 1 },
    SCALE: { min: 0.1, max: 10, step: 0.1 },
    ROTATION: { min: -360, max: 360, step: 1 },
    ANIMATION_DURATION: { min: 100, max: 10000, step: 100 },
    ANIMATION_INTERVAL: { min: 1000, max: 60000, step: 1000 }
  } as const,

  DEFAULTS: {
    OPACITY: 1,
    STROKE_WIDTH: 1,
    FONT_SIZE: 16,
    SCALE: 1,
    ROTATION: 0,
    ANIMATION_DURATION: 1000,
    ANIMATION_INTERVAL: 5000,
    ANIMATION_COLOR: '#ff0000',
    FILL_COLOR: '#000000',
    STROKE_COLOR: '#000000'
  } as const
} as const;

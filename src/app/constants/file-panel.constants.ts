export interface SvgTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  filePath: string;
  category: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
}

export const FILE_PANEL_CONSTANTS = {
  TEMPLATES: [] as SvgTemplate[],

  CATEGORIES: [
    { id: 'all', name: 'All Files' },
    { id: 'uploaded', name: 'Uploaded Files' }
  ] as TemplateCategory[],

  DEFAULT_SELECTED_TEMPLATE: null,
  DEFAULT_CATEGORY: 'all',
  SEARCH_PLACEHOLDER: 'Search templates...',
  SVG_FILE_TYPES: '.svg,image/svg+xml',
  INVALID_FILE_MESSAGE: 'Please select a valid SVG file.'
} as const;

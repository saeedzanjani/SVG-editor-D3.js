import { SvgElementType } from '../models/svg-element.model';
import { SvgEditorService } from '../services/svg-editor.service';
import { SvgTemplate } from '../constants/file-panel.constants';
import { TOOLBAR_CONSTANTS } from '../constants/toolbar.constants';

export class FileUtils {
  static createFileInput(accept: string, onFileSelected: (file: File) => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileSelected(file);
      }
    };
    input.click();
  }

  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static parseSvgContent(svgContent: string): SVGSVGElement | null {
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      return svgDoc.querySelector('svg');
    } catch (error) {
      return null;
    }
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  static createImageElementData(imageUrl: string, x: number = TOOLBAR_CONSTANTS.DEFAULT_IMAGE_POSITION.x, y: number = TOOLBAR_CONSTANTS.DEFAULT_IMAGE_POSITION.y): any {
    return {
      type: SvgElementType.IMAGE,
      attributes: {
        x,
        y,
        width: TOOLBAR_CONSTANTS.DEFAULT_IMAGE_SIZE.width,
        height: TOOLBAR_CONSTANTS.DEFAULT_IMAGE_SIZE.height,
        href: imageUrl,
        'data-label-type': 'uploaded-image'
      },
      layerId: 'default-layer',
      visible: true,
      locked: false,
      selected: false
    };
  }

  static confirm(message: string): boolean {
    return confirm(message);
  }

  static alert(message: string): void {
    alert(message);
  }

  static async loadTemplate(
    template: SvgTemplate,
    svgEditorService: SvgEditorService
  ): Promise<void> {
    try {
      svgEditorService.clearAllElements();

      let svgText: string;

      if (template.filePath.startsWith('<svg') || template.filePath.startsWith('<?xml')) {
        svgText = template.filePath;
      } else {
        const response = await fetch(template.filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        svgText = await response.text();
      }

      svgEditorService.loadSvgFromString(svgText);

      const event = new CustomEvent('svg:content:loaded', {
        detail: { svgContent: svgText }
      });
      window.dispatchEvent(event);
    } catch (error) {
      throw new Error(`Failed to load template ${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateSvgFile(file: File): { isValid: boolean; error?: string } {
    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
      return { isValid: false, error: 'Please select a valid SVG file (.svg extension required).' };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large. Please select a file smaller than 10MB.' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'File is empty. Please select a valid SVG file.' };
    }

    return { isValid: true };
  }

  static validateSvgContent(svgContent: string): { isValid: boolean; error?: string } {
    try {
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        return { isValid: false, error: 'Invalid SVG content. File must contain valid SVG markup.' };
      }

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const parseError = svgDoc.querySelector('parsererror');

      if (parseError) {
        return { isValid: false, error: 'Invalid SVG format. Please check the file content.' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Failed to parse SVG content.' };
    }
  }

  static handleFileUpload(
    file: File,
    svgEditorService: SvgEditorService
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileValidation = this.validateSvgFile(file);
      if (!fileValidation.isValid) {
        reject(new Error(fileValidation.error));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const svgContent = e.target?.result as string;
          if (!svgContent) {
            reject(new Error('Failed to read file content.'));
            return;
          }

          const contentValidation = this.validateSvgContent(svgContent);
          if (!contentValidation.isValid) {
            reject(new Error(contentValidation.error));
            return;
          }

          svgEditorService.loadSvgFromString(svgContent);
          resolve();
        } catch (error) {
          reject(new Error(`Failed to load SVG content: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };

      reader.readAsText(file);
    });
  }

  static filterTemplates(
    templates: SvgTemplate[],
    category: string,
    searchQuery: string
  ): SvgTemplate[] {
    let filtered = templates;

    if (category !== 'all') {
      filtered = filtered.filter(template => template.category === category);
    }

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  static showError(message: string): void {
    alert(message);
  }
}

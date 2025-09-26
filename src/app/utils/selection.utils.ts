import { SvgElement } from '../models/svg-element.model';
import { SvgEditorService } from '../services/svg-editor.service';
import { SelectionConfig } from '../models/component.models';

export class SelectionUtils {
  private config: SelectionConfig;

  constructor(config: SelectionConfig) {
    this.config = config;
  }

  getSelectedElement(elementId: string): SvgElement | null {
    return this.config.svgEditorService.elements().find((e: SvgElement) => e.id === elementId) || null;
  }

  getResizeHandles(element: SvgElement): Array<{ id: string; x: number; y: number; type: string }> {
    if (!element.bounds) return [];

    const { x, y, width, height } = element.bounds;
    const handleSize = 8;

    return [
      { id: 'nw', x: x, y: y, type: 'nw' },
      { id: 'n', x: x + width / 2, y: y, type: 'n' },
      { id: 'ne', x: x + width, y: y, type: 'ne' },
      { id: 'e', x: x + width, y: y + height / 2, type: 'e' },
      { id: 'se', x: x + width, y: y + height, type: 'se' },
      { id: 's', x: x + width / 2, y: y + height, type: 's' },
      { id: 'sw', x: x, y: y + height, type: 'sw' },
      { id: 'w', x: x, y: y + height / 2, type: 'w' }
    ];
  }

  performSelection(selectionRect: { x: number; y: number; width: number; height: number }): void {
    const elementsInRect = this.config.svgEditorService.elements().filter((element: SvgElement) => {
      const bounds = element.bounds;
      if (!bounds) return false;
      return selectionRect.x < bounds.x + bounds.width &&
             selectionRect.x + selectionRect.width > bounds.x &&
             selectionRect.y < bounds.y + bounds.height &&
             selectionRect.y + selectionRect.height > bounds.y;
    });

    elementsInRect.forEach((element: SvgElement) => {
      this.config.svgEditorService.selectElement(element.id);
    });
  }
}

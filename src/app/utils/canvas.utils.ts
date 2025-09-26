import { CanvasTransform, SelectionRect, MousePosition } from '../models/component.models';
import { CANVAS_CONSTANTS } from '../constants/canvas.constants';

export class CanvasUtils {
  static generateCanvasTransform(panX: number, panY: number, zoom: number): string {
    return `translate(${panX}, ${panY}) scale(${zoom})`;
  }


  static calculateSelectionRect(start: MousePosition, current: MousePosition): SelectionRect {
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);

    return { x, y, width, height };
  }

  static getMousePosition(event: MouseEvent, container: HTMLElement): MousePosition {
    const rect = container.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  static updateCursor(container: HTMLElement, tool: string): void {
    if (!container) return;

    switch (tool) {
      case 'SELECT':
        container.style.cursor = 'default';
        break;
      case 'PAN':
        container.style.cursor = 'grab';
        break;
      default:
        container.style.cursor = 'default';
    }
  }

  static calculateZoom(newZoom: number, direction: 'in' | 'out'): number {
    const factor = direction === 'in' ? CANVAS_CONSTANTS.ZOOM_DELTA.IN : CANVAS_CONSTANTS.ZOOM_DELTA.OUT;
    return Math.max(
      CANVAS_CONSTANTS.MIN_ZOOM,
      Math.min(CANVAS_CONSTANTS.MAX_ZOOM, newZoom * factor)
    );
  }

  static resetCanvasTransform(): { panX: number; panY: number; zoom: number } {
    return {
      panX: 0,
      panY: 0,
      zoom: 1
    };
  }

  static isPointInRect(point: MousePosition, rect: SelectionRect): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
  }

  static getElementCenter(element: any): MousePosition | null {
    if (!element || !element.bounds) return null;

    return {
      x: element.bounds.x + element.bounds.width / 2,
      y: element.bounds.y + element.bounds.height / 2
    };
  }

  static generateElementId(): string {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getElementAtPosition(position: MousePosition, elements: any[]): any | null {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.bounds && this.isPointInRect(position, element.bounds)) {
        return element;
      }
    }
    return null;
  }

  static screenToSvgCoordinates(screenX: number, screenY: number, canvas: any): MousePosition {
    if (canvas && typeof canvas.getBoundingClientRect === 'function') {
      const rect = canvas.getBoundingClientRect();
      const point = canvas.createSVGPoint();
      point.x = screenX - rect.left;
      point.y = screenY - rect.top;
      const svgPoint = point.matrixTransform(canvas.getScreenCTM()?.inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    }
    return { x: screenX, y: screenY };
  }

  static adjustContextMenuPosition(position: MousePosition, menuWidth: number, menuHeight: number, containerWidth: number, containerHeight: number): MousePosition {
    let x = position.x;
    let y = position.y;

    if (x + menuWidth > containerWidth) {
      x = containerWidth - menuWidth - 10;
    }
    if (y + menuHeight > containerHeight) {
      y = containerHeight - menuHeight - 10;
    }
    if (x < 0) x = 10;
    if (y < 0) y = 10;

    return { x, y };
  }
}

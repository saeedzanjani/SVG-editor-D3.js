import { SvgElement } from '../models/svg-element.model';
import { CanvasUtils } from './canvas.utils';
import { DrawingUtils } from './drawing.utils';
import { ContextMenuAction } from '../models/component.models';

export class ContextMenuUtils {
  static calculateLabelPosition(
    selectedElementIds: string[],
    rightClickPosition: { x: number; y: number },
    canvas: { width: number; height: number; viewBox: string },
    getElementCenter: (elementId: string) => { x: number; y: number } | null
  ): { x: number; y: number } {
    if (selectedElementIds.length > 0) {
      const selectedElementId = selectedElementIds[0];
      const elementCenter = getElementCenter(selectedElementId);

      if (elementCenter) {
        return elementCenter;
      }
    }

    return CanvasUtils.screenToSvgCoordinates(
      rightClickPosition.x,
      rightClickPosition.y,
      canvas
    );
  }

  /**
   * Create text label element
   */
  static createTextLabel(
    selectedElementIds: string[],
    rightClickPosition: { x: number; y: number },
    canvas: { width: number; height: number; viewBox: string },
    getElementCenter: (elementId: string) => { x: number; y: number } | null
  ): { x: number; y: number } {
    const position = this.calculateLabelPosition(
      selectedElementIds,
      rightClickPosition,
      canvas,
      getElementCenter
    );

    return DrawingUtils.createTextLabel(position.x, position.y) as any;
  }

  static createImageLabel(
    selectedElementIds: string[],
    rightClickPosition: { x: number; y: number },
    canvas: { width: number; height: number; viewBox: string },
    getElementCenter: (elementId: string) => { x: number; y: number } | null
  ): { x: number; y: number } {
    const position = this.calculateLabelPosition(
      selectedElementIds,
      rightClickPosition,
      canvas,
      getElementCenter
    );

    return DrawingUtils.createImageLabel(position.x, position.y) as any;
  }

  static createUploadedImage(
    imageUrl: string,
    selectedElementIds: string[],
    rightClickPosition: { x: number; y: number },
    canvas: { width: number; height: number; viewBox: string },
    getElementCenter: (elementId: string) => { x: number; y: number } | null
  ): { x: number; y: number } {
    const position = this.calculateLabelPosition(
      selectedElementIds,
      rightClickPosition,
      canvas,
      getElementCenter
    );

    return DrawingUtils.createUploadedImage(position.x, position.y, imageUrl) as any;
  }

  static canCustomizeElement(element: SvgElement): boolean {
    return element.type === 'text';
  }

  static findElementById(elements: SvgElement[], elementId: string): SvgElement | null {
    return elements.find(el => el.id === elementId) || null;
  }
}

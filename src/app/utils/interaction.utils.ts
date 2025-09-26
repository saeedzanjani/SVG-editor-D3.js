import * as d3 from 'd3';
import { SvgElement, EditorTool, LabelCustomization, EventHandlerConfig } from '../models';
import { SvgEditorService } from '../services/svg-editor.service';
import { PreviewModeService } from '../services/preview-mode.service';
import { CanvasUtils, ContextMenuUtils } from './index';
import { D3Selection, CanvasInteractionConfig } from '../models/component.models';

export class InteractionUtils {
  static calculateDragDistance(
    startPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ): number {
    return Math.sqrt(
      Math.pow(currentPos.x - startPos.x, 2) +
      Math.pow(currentPos.y - startPos.y, 2)
    );
  }

  static hasActuallyDragged(
    startPos: { x: number; y: number },
    currentPos: { x: number; y: number },
    threshold: number = 3
  ): boolean {
    return this.calculateDragDistance(startPos, currentPos) > threshold;
  }

  static applySelectionStyle(element: d3.Selection<any, any, any, any>): void {
    element
      .style('stroke', '#007bff')
      .style('stroke-width', '2px');
  }

  static removeSelectionStyle(element: d3.Selection<any, any, any, any>): void {
    element
      .style('stroke', null)
      .style('stroke-width', null);
  }

  static applyDragStyle(element: d3.Selection<any, any, any, any>): void {
    element
      .style('opacity', 0.7)
      .style('stroke', '#007bff')
      .style('stroke-width', 2);
  }

  static removeDragStyle(element: d3.Selection<any, any, any, any>): void {
    element
      .style('opacity', 1)
      .style('stroke', null)
      .style('stroke-width', null);
  }

  static toggleElementSelection(
    element: d3.Selection<any, any, any, any>,
    elementId: string,
    currentSelections: D3Selection[]
  ): D3Selection[] {
    const existing = currentSelections.findIndex(sel => sel.svgElementId === elementId);

    if (existing >= 0) {
      this.removeSelectionStyle(element);
      currentSelections.splice(existing, 1);
    } else {
      this.applySelectionStyle(element);
      currentSelections.push({ element, svgElementId: elementId });
    }

    return [...currentSelections];
  }

  static clearAllSelections(selections: D3Selection[]): void {
    selections.forEach(sel => {
      this.removeSelectionStyle(sel.element);
    });
  }

  static dispatchDragEvent(elementId: string, x: number, y: number, dx: number, dy: number): void {
    const dragEvent = new CustomEvent('d3:object:drag', {
      detail: { elementId, x, y, dx, dy }
    });
    window.dispatchEvent(dragEvent);
  }

  static dispatchSelectionEvent(elementId: string, element: Element | null): void {
    const selectionEvent = new CustomEvent('d3:object:selected', {
      detail: { elementId, element }
    });
    window.dispatchEvent(selectionEvent);
  }
}

export class EventHandlers {
  private config: EventHandlerConfig;

  constructor(config: EventHandlerConfig) {
    this.config = config;
  }

  onMouseDown(event: MouseEvent): void {
    const rect = this.config.getCanvasContainer().getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.config.signals.mousePosition.set(position);

    if (event.button === 0) {
      const tool = this.config.svgEditorService.activeTool();

      if (tool === EditorTool.SELECT) {
        this.config.signals.isDragging.set(true);
        this.config.signals.dragStart.set(position);
      } else if (this.isDrawingTool(tool)) {
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.config.getCanvasContainer().getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.config.signals.mousePosition.set(position);
  }

  onMouseUp(event: MouseEvent): void {
    if (this.config.signals.isDragging.set) {
      this.config.signals.isDragging.set(false);
    }
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const canvas = this.config.svgEditorService.canvas();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, canvas.zoom * zoomFactor));

    this.config.svgEditorService.setCanvasZoom(newZoom);
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();

    const rect = this.config.getCanvasContainer().getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const target = event.target as Element;

    if (target && target.tagName && target.tagName !== 'svg' && target.tagName !== 'g' && target.tagName !== 'defs') {
      if (!target.id) {
        const elementId = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        target.id = elementId;
      }

      this.config.svgEditorService.clearSelection();
      this.config.svgEditorService.selectElement(target.id);
    } else {
      this.config.svgEditorService.clearSelection();
    }

    const adjustedPosition = CanvasUtils.adjustContextMenuPosition(
      position,
      200,
      300,
      rect.width,
      rect.height
    );

    this.config.signals.rightClickPosition.set(position);
    this.config.signals.contextMenuPosition.set(adjustedPosition);
    this.config.signals.showContextMenu.set(true);
  }

  onCanvasClick(event: MouseEvent): void {
    this.config.signals.showContextMenu.set(false);

    if (event.target === this.config.getSvgCanvas()) {
      const tool = this.config.svgEditorService.activeTool();

      if (tool === EditorTool.TEXT) {
        this.handleTextToolClick(event);
      } else {
        this.config.svgEditorService.clearSelection();
      }
    }
  }

  onLabelCustomizationSave(data: LabelCustomization): void {
    this.config.callbacks.onLabelCustomizationSave(data);
  }

  private isDrawingTool(tool: EditorTool): boolean {
    return false;
  }

  private handleTextToolClick(event: MouseEvent): void {
    const rect = this.config.getCanvasContainer().getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.config.callbacks.onTextToolClick(position);
  }
}

export class CanvasInteraction {
  private config: CanvasInteractionConfig;

  constructor(config: CanvasInteractionConfig) {
    this.config = config;
  }

  addLabel(): void {
    const position = this.config.signals.rightClickPosition;
    const selectedElementIds = this.config.svgEditorService.selectedElementIds();

    const targetElementId = selectedElementIds.length === 1 ? selectedElementIds[0] : undefined;

    if (this.config.dialogManager) {
      this.config.dialogManager.openLabelCustomizationDialogForNewLabel(position(), targetElementId);
    }

    this.config.signals.showContextMenu.set(false);
  }

  addImageLabel(): void {
    const position = this.config.signals.rightClickPosition;
    const selectedElementIds = this.config.svgEditorService.selectedElementIds();
    const canvas = this.config.svgEditorService.canvas();
    const elements = this.config.svgEditorService.elements();

    const label = ContextMenuUtils.createImageLabel(
      selectedElementIds,
      position(),
      canvas,
      (elementId: string) => {
        const element = elements.find((e: SvgElement) => e.id === elementId);
        return element ? { x: element.x + element.width / 2, y: element.y + element.height / 2 } : null;
      }
    );

    this.config.svgEditorService.addElement(label);
    this.config.signals.showContextMenu.set(false);
  }

  uploadImage(): void {
    const position = this.config.signals.rightClickPosition;
    const selectedElementIds = this.config.svgEditorService.selectedElementIds();
    const canvas = this.config.svgEditorService.canvas();
    const elements = this.config.svgEditorService.elements();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result as string;
          if (result) {
            const imageElement = ContextMenuUtils.createUploadedImage(
              result,
              selectedElementIds,
              position(),
              canvas,
              (elementId: string) => {
                const element = elements.find((e: SvgElement) => e.id === elementId);
                return element ? { x: element.x + element.width / 2, y: element.y + element.height / 2 } : null;
              }
            );
            this.config.svgEditorService.addElement(imageElement);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    this.config.signals.showContextMenu.set(false);
  }

  customizeLabel(): void {
    const selectedIds = this.config.svgEditorService.selectedElementIds();
    if (selectedIds.length === 1) {
      const element = ContextMenuUtils.findElementById(
        this.config.svgEditorService.elements(),
        selectedIds[0]
      );
      if (element && ContextMenuUtils.canCustomizeElement(element)) {
        if (this.config.dialogManager) {
          this.config.dialogManager.openLabelCustomizationDialog(element);
        }
        this.config.signals.showContextMenu.set(false);
      }
    }
  }

  deleteElement(): void {
    const selectedIds = this.config.svgEditorService.selectedElementIds();
    selectedIds.forEach((id: string) => {
      this.config.svgEditorService.removeElement(id);
    });
    this.config.signals.showContextMenu.set(false);
  }

  private screenToSvgCoordinates(
    screenX: number,
    screenY: number,
    canvas: { width: number; height: number; viewBox: string; panX: number; panY: number; zoom: number }
  ): { x: number; y: number } {
    const viewBoxParts = canvas.viewBox.split(' ').map(Number);
    const viewBoxX = viewBoxParts[0];
    const viewBoxY = viewBoxParts[1];
    const viewBoxWidth = viewBoxParts[2];
    const viewBoxHeight = viewBoxParts[3];

    const svgX = viewBoxX + (screenX / canvas.width) * viewBoxWidth;
    const svgY = viewBoxY + (screenY / canvas.height) * viewBoxHeight;

    const transformedX = (svgX - canvas.panX) / canvas.zoom;
    const transformedY = (svgY - canvas.panY) / canvas.zoom;

    return {
      x: transformedX,
      y: transformedY
    };
  }
}

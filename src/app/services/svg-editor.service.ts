import { Injectable, signal, computed } from '@angular/core';
import * as d3 from 'd3';
import {
  SvgElement,
  SvgEditorState,
  EditorTool,
} from '../models/svg-element.model';
import { D3Utils } from '../utils/d3.utils';
import { InteractionUtils } from '../utils/interaction.utils';
import { ElementUtils } from '../utils/element.utils';

@Injectable({
  providedIn: 'root'
})
export class SvgEditorService {
  private svg: d3.Selection<any, any, any, any> | null = null;
  private readonly _state = signal<SvgEditorState>(this.getInitialState());
  private readonly _selectedObjects = signal<any[]>([]);
  private readonly _isDragging = signal(false);
  private readonly _zoom = signal(d3.zoom<SVGSVGElement, any>());
  private _draggedElement: d3.Selection<any, any, any, any> | null = null;
  private _dragEndTimeout: ReturnType<typeof setTimeout> | null = null;
  private _dragStartPosition: { x: number; y: number } | null = null;
  private _hasActuallyDragged = false;
  private _pendingSvgContent: string | null = null;

  readonly state = this._state.asReadonly();
  readonly elements = computed(() => this._state().elements);
  readonly selectedElementIds = computed(() => this._state().selectedElementIds);
  readonly activeTool = computed(() => this._state().activeTool);
  readonly canvas = computed(() => this._state().canvas);
  readonly selectedElements = computed(() => {
    const selectedIds = this.selectedElementIds();
    if (selectedIds.length === 0) return [];

    // Use cached element data from state instead of DOM queries
    const elements = this.elements();
    return selectedIds.map(id => {
      const element = elements.find(el => el.id === id);
      if (element) {
        return {
          id: element.id,
          tagName: element.type.toLowerCase(),
          attributes: element.attributes,
          type: element.type,
          layerId: element.layerId,
          visible: element.visible,
          locked: element.locked,
          selected: element.selected
        };
      }
      return null;
    }).filter((element): element is SvgElement & { tagName: string } => element !== null);
  });
  readonly selectedObjects = this._selectedObjects.asReadonly();
  readonly isDragging = this._isDragging.asReadonly();

  private getInitialState(): SvgEditorState {
    return {
      elements: [],
      layers: [{ id: 'default', name: 'Default', visible: true, locked: false, opacity: 1, order: 0 }],
      selectedElementIds: [],
      activeTool: EditorTool.SELECT,
      canvas: { width: 1200, height: 800, viewBox: '0 0 6002.83 5024.85', zoom: 1, panX: 0, panY: 0 },
    };
  }

  initialize(svgElement: SVGSVGElement, width: number, height: number): void {
    this.svg = d3.select(svgElement);
    const zoom = D3Utils.initializeSvg(svgElement, width, height);
    this._zoom.set(zoom);

    if (this._pendingSvgContent) {
      this.loadSvgContent(this._pendingSvgContent);
      this._pendingSvgContent = null;
    }
  }

  loadSvgContent(svgContent: string): void {
    if (!this.svg) return;
    D3Utils.loadSvgContent(this.svg, svgContent);
    this.setupInteractions();

    this.ensureAllElementsHaveIds();
    const zoomGroup = this.svg.select('.zoom-group');
    D3Utils.applyClickHandlers(zoomGroup, (event) => {
      if (this._isDragging()) return;
      this.handleClick(event);
    });
  }

  private ensureAllElementsHaveIds(): void {
    if (!this.svg) return;
    const zoomGroup = this.svg.select('.zoom-group');

    const allElements = zoomGroup.selectAll('*').filter(function() {
      const element = this as Element;
      const tagName = element.tagName.toLowerCase();
      return !['defs', 'clipPath', 'mask', 'pattern', 'linearGradient', 'radialGradient', 'stop', 'style', 'script', 'title', 'desc', 'metadata'].includes(tagName);
    });

    const newElements: SvgElement[] = [];

    allElements.each(function() {
      const element = d3.select(this);
      const domElement = this as Element;

      let elementId = domElement.id;
      if (!elementId || elementId === '') {
        elementId = D3Utils.generateId();
        element.attr('id', elementId);
      }

      const svgElement = ElementUtils.createSvgElementFromDom(domElement, elementId);
      if (svgElement) {
        newElements.push(svgElement);
      }
    });

    if (newElements.length > 0) {
      this._state.update(state => ({
        ...state,
        elements: [...state.elements, ...newElements]
      }));
    }
  }

  private setupInteractions(): void {
    if (!this.svg) return;
    const zoomGroup = this.svg.select('.zoom-group');

    const drag = D3Utils.createDragBehavior(
      (event) => {
        this._isDragging.set(true);
        this._hasActuallyDragged = false;
        this._dragStartPosition = { x: event.x, y: event.y };

        const target = d3.select(event.sourceEvent.target);
        InteractionUtils.applyDragStyle(target);
        this._draggedElement = target;
      },
      (event) => {
        if (this._dragStartPosition) {
          if (InteractionUtils.hasActuallyDragged(this._dragStartPosition, { x: event.x, y: event.y })) {
            this._hasActuallyDragged = true;
          }
        }

        if (this._hasActuallyDragged) {
          this.handleDrag(event);
        }
      },
      (event) => {
        this._isDragging.set(false);
        const target = d3.select(event.sourceEvent.target);
        InteractionUtils.removeDragStyle(target);

        if (this._dragEndTimeout) {
          clearTimeout(this._dragEndTimeout);
        }
        this._dragEndTimeout = setTimeout(() => {
          this._draggedElement = null;
          this._dragEndTimeout = null;
          this._dragStartPosition = null;
          this._hasActuallyDragged = false;
        }, 10);
      }
    );

    D3Utils.applyDragBehavior(zoomGroup, drag);
    D3Utils.applyClickHandlers(zoomGroup, (event) => {
      if (this._isDragging()) return;
      this.handleClick(event);
    });
  }

  private handleDrag(event: d3.D3DragEvent<any, any, any>): void {
    const element = this._draggedElement;
    if (!element) return;

    const dx = event.dx;
    const dy = event.dy;
    const elementId = element.attr('id');

    if (!elementId) return;

    const updated = D3Utils.updateElementPosition(element, dx, dy);

    if (updated) {
      InteractionUtils.dispatchDragEvent(elementId, event.x, event.y, dx, dy);
    }
  }

  private handleClick(event: MouseEvent): void {
    const element = d3.select(event.target as Element);
    const elementId = element.attr('id') || D3Utils.generateId();

    if (this._isDragging() || this._hasActuallyDragged) {
      return;
    }

    if (!element.attr('id')) {
      element.attr('id', elementId);
    }

    if (event.ctrlKey || event.metaKey) {
      this.toggleSelection(element, elementId);
    } else {
      this.selectD3Element(element, elementId);
    }

    InteractionUtils.dispatchSelectionEvent(elementId, element.node());
  }

  private selectD3Element(element: d3.Selection<any, any, any, any>, elementId: string): void {
    this.clearD3Selection();
    InteractionUtils.applySelectionStyle(element);
    this._selectedObjects.set([{ element, svgElementId: elementId }]);
    this.selectElement(elementId);
  }

  private toggleSelection(element: d3.Selection<any, any, any, any>, elementId: string): void {
    const current = this._selectedObjects();
    const updated = InteractionUtils.toggleElementSelection(element, elementId, current);
    this._selectedObjects.set(updated);
  }

  private clearD3Selection(): void {
    InteractionUtils.clearAllSelections(this._selectedObjects());
    this._selectedObjects.set([]);
  }

  setActiveTool(tool: EditorTool): void {
    this._state.update(state => ({ ...state, activeTool: tool }));
  }

  selectElement(elementId: string, multiSelect = false): void {
    this._state.update(state => {
      let selectedIds = multiSelect ? [...state.selectedElementIds] : [];
      if (multiSelect && selectedIds.includes(elementId)) {
        selectedIds = selectedIds.filter(id => id !== elementId);
      } else {
        selectedIds.push(elementId);
      }
      return { ...state, selectedElementIds: selectedIds };
    });
  }

  clearSelection(): void {
    this._state.update(state => ({ ...state, selectedElementIds: [] }));
  }

  addElement(element: Omit<SvgElement, 'id'>): void {
    const newElement: SvgElement = {
      ...element,
      id: D3Utils.generateId()
    };

    const bounds = ElementUtils.getElementBounds(newElement);
    if (bounds) {
      newElement.bounds = bounds;
    }

    this._state.update(state => ({
      ...state,
      elements: [...state.elements, newElement]
    }));

    this.renderElementToCanvas(newElement);
  }

  updateElement(elementId: string, updates: Partial<SvgElement>): void {
    this._state.update(state => ({
      ...state,
      elements: state.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
  }

  setCanvasZoom(zoom: number): void {
    this.setZoom(zoom);
    this._state.update(state => ({
      ...state,
      canvas: { ...state.canvas, zoom }
    }));
  }

  setCanvasPan(panX: number, panY: number): void {
    this._state.update(state => ({
      ...state,
      canvas: { ...state.canvas, panX, panY }
    }));
  }

  removeElement(elementId: string): void {
    if (this.svg) {
      this.svg.select(`#${elementId}`).remove();
    }
    this._state.update(state => ({
      ...state,
      elements: state.elements.filter(el => el.id !== elementId),
      selectedElementIds: state.selectedElementIds.filter(id => id !== elementId)
    }));
  }

  updateElementProperties(elementId: string, properties: any): void {
    if (this.svg) {
      const element = this.svg.select(`#${elementId}`);
      if (!element.empty()) {
        Object.keys(properties).forEach(key => {
          element.attr(key, properties[key]);
        });
      }
    }
  }

  setZoom(zoom: number): void {
    if (this.svg) {
      const zoomBehavior = this._zoom();
      D3Utils.setZoom(this.svg, zoomBehavior, zoom);
    }
  }

  getZoom(): number {
    if (!this.svg) return 1;
    return D3Utils.getZoom(this.svg);
  }

  exportToSvg(): string {
    if (!this.svg) return '';
    return D3Utils.exportSvg(this.svg);
  }

  loadSvgFromString(svgContent: string): void {
    if (this.svg) {
      this.loadSvgContent(svgContent);
    } else {
      this._pendingSvgContent = svgContent;
    }
  }

  setPendingSvgContent(svgContent: string): void {
    this._pendingSvgContent = svgContent;
  }

  exportSvg(): string {
    if (!this.svg) {
      return '';
    }

    try {
      const svgElement = this.svg.node() as SVGElement;
      if (!svgElement) {
        return '';
      }

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      const tempElements = clonedSvg.querySelectorAll('.temp, .preview, .selection-rectangle');
      tempElements.forEach(el => el.remove());

      return new XMLSerializer().serializeToString(clonedSvg);
    } catch (error) {
      console.error('Error exporting SVG:', error);
      return '';
    }
  }

  loadStateFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('svg-editor-state');
      if (saved) {
        const state = JSON.parse(saved);
        this._state.set(state);
      }
    } catch (error) {
    }
  }

  clearAllElements(): void {
    this._state.update(state => ({ ...state, elements: [], selectedElementIds: [] }));
  }


  destroy(): void {
    if (this._dragEndTimeout) {
      clearTimeout(this._dragEndTimeout);
      this._dragEndTimeout = null;
    }

    if (this.svg) {
      D3Utils.clearSvg(this.svg);
      this.svg = null;
    }
  }

  getElementProperties(elementId: string): Record<string, any> {
    if (!this.svg) return {};
    return ElementUtils.getElementProperties(this.svg, elementId);
  }

  getElementCenter(elementId: string): { x: number; y: number } | null {
    if (!this.svg) return null;
    return ElementUtils.getElementCenterFromDOM(this.svg, elementId);
  }

  updateElementPropertiesFromPanel(elementId: string, properties: Record<string, any>): void {
    if (!this.svg) return;
    ElementUtils.updateElementProperties(this.svg, elementId, properties);
    this.updateElement(elementId, { attributes: properties });
  }

  /**
   * Update text element properties and reposition to center of nearest element
   */
  updateTextElementProperties(elementId: string, properties: Record<string, any>): void {
    if (!this.svg) return;

    ElementUtils.updateElementProperties(this.svg, elementId, properties);

    const element = this.svg.select(`#${elementId}`);
    if (!element.empty()) {
      const node = element.node();
      if (node && node instanceof Element && node.tagName && node.tagName.toLowerCase() === 'text') {
        const nearestElementCenter = ElementUtils.findNearestElementToText(this.svg, elementId);
        if (nearestElementCenter) {
          element.attr('x', nearestElementCenter.x);
          element.attr('y', nearestElementCenter.y);

          const updatedProperties = {
            ...properties,
            x: nearestElementCenter.x,
            y: nearestElementCenter.y
          };
          this.updateElement(elementId, { attributes: updatedProperties });
        } else {
          this.updateElement(elementId, { attributes: properties });
        }
      } else {
        this.updateElement(elementId, { attributes: properties });
      }
    }
  }

  private renderElementToCanvas(element: SvgElement): void {
    if (!this.svg) return;

    ElementUtils.renderElementToCanvas(
      this.svg,
      element,
      (event) => this.handleClick(event),
      (event, d3Element) => {
        this._draggedElement = d3Element;
      }
    );

    this.reapplyClickHandlers();
  }

  private reapplyClickHandlers(): void {
    if (!this.svg) return;
    const zoomGroup = this.svg.select('.zoom-group');
    D3Utils.applyClickHandlers(zoomGroup, (event) => {
      if (this._isDragging()) return;
      this.handleClick(event);
    });
  }
}

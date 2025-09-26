import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgEditorService } from '../../services/svg-editor.service';
import { PreviewModeService } from '../../services/preview-mode.service';
import { SvgElement, EditorTool, SvgElementType } from '../../models/svg-element.model';
import { LabelCustomizationDialogComponent } from '../label-customization-dialog/label-customization-dialog.component';
import { LabelCustomization, ContextMenuItem, DragDropEvent } from '../../models';
import {
  CanvasUtils,
  AnimationUtils,
  ContextMenuUtils,
  EventHandlers,
  DialogManager,
  CanvasInteraction,
  SelectionUtils,
  D3Utils
} from '../../utils';
import {
  CanvasControlsComponent,
  ContextMenuComponent,
  SelectionHandlesComponent,
  DragSelectionComponent,
  MousePositionComponent
} from '../shared';
import * as d3 from 'd3';

@Component({
  selector: 'app-svg-canvas',
  standalone: true,
  imports: [
    CommonModule,
    LabelCustomizationDialogComponent,
    CanvasControlsComponent,
    ContextMenuComponent,
    SelectionHandlesComponent,
    DragSelectionComponent,
    MousePositionComponent
  ],
  templateUrl: './svg-canvas.component.html',
  styleUrls: ['./svg-canvas.component.scss']
})
export class SvgCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svgCanvas', { static: true }) svgCanvas!: ElementRef<SVGSVGElement>;
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  readonly Math = Math;

  private svgEditorService = inject(SvgEditorService);
  private previewModeService = inject(PreviewModeService);

  eventHandlers!: EventHandlers;
  dialogManager!: DialogManager;
  canvasInteraction!: CanvasInteraction;
  selectionUtils!: SelectionUtils;

  private readonly _isDragging = signal(false);
  private readonly _dragStart = signal({ x: 0, y: 0 });
  private readonly _mousePosition = signal({ x: 0, y: 0 });
  private readonly _showContextMenu = signal(false);
  private readonly _contextMenuPosition = signal({ x: 0, y: 0 });
  private readonly _rightClickPosition = signal({ x: 0, y: 0 });
  private readonly _showMousePosition = signal(false);
  private readonly _showLabelCustomizationDialog = signal(false);
  private readonly _selectedElementForDialog = signal<SvgElement | null>(null);

  readonly elements = this.svgEditorService.elements;
  readonly selectedElementIds = this.svgEditorService.selectedElementIds;
  readonly activeTool = this.svgEditorService.activeTool;
  readonly canvas = this.svgEditorService.canvas;
  readonly isDragging = this._isDragging.asReadonly();
  readonly mousePosition = this._mousePosition.asReadonly();
  readonly showContextMenu = this._showContextMenu.asReadonly();
  readonly contextMenuPosition = this._contextMenuPosition.asReadonly();
  readonly rightClickPosition = this._rightClickPosition.asReadonly();
  readonly showMousePosition = this._showMousePosition.asReadonly();
  readonly showLabelCustomizationDialog = this._showLabelCustomizationDialog.asReadonly();
  readonly selectedElementForDialog = this._selectedElementForDialog.asReadonly();
  readonly dragStart = this._dragStart.asReadonly();
  readonly isDraggingSelection = this._isDragging.asReadonly();

  readonly canvasTransform = computed(() => {
    const canvas = this.canvas();
    return CanvasUtils.generateCanvasTransform(canvas.panX, canvas.panY, canvas.zoom);
  });


  readonly selectionRect = computed(() => {
    const start = this._dragStart();
    const current = this._mousePosition();
    return CanvasUtils.calculateSelectionRect(start, current);
  });

  readonly contextMenuItems = computed((): ContextMenuItem[] => [
    {
      id: 'add-label',
      label: 'Add Text Label',
      icon: 'M5 4v3h5.5v12h3V7H19V4H5z',
      action: () => this.canvasInteraction.addLabel()
    },
    {
      id: 'add-image-label',
      label: 'Add Image Label',
      icon: 'M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z',
      action: () => this.canvasInteraction.addImageLabel()
    },
    {
      id: 'upload-image',
      label: 'Upload Image',
      icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
      action: () => this.canvasInteraction.uploadImage()
    },
    {
      id: 'separator-1',
      label: '',
      icon: '',
      action: () => {},
      separator: true
    },
    {
      id: 'customize-label',
      label: 'Customize Label',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      action: () => this.canvasInteraction.customizeLabel(),
      disabled: this.selectedElementIds().length !== 1
    },
    {
      id: 'delete-element',
      label: 'Delete Element',
      icon: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
      action: () => this.canvasInteraction.deleteElement()
    }
  ]);


  private mouseMoveListener?: (event: MouseEvent) => void;
  private mouseUpListener?: (event: MouseEvent) => void;
  private wheelListener?: (event: WheelEvent) => void;
  private animationEventListener?: (event: CustomEvent) => void;
  private globalClickListener?: (event: MouseEvent) => void;

  constructor() {
    this.setupEffects();
    this.initializeUtilities();
  }

  private initializeUtilities(): void {
    this.selectionUtils = new SelectionUtils({
      svgEditorService: this.svgEditorService
    });

    this.dialogManager = new DialogManager({
      signals: {
        showLabelCustomizationDialog: this._showLabelCustomizationDialog,
        selectedElementForDialog: this._selectedElementForDialog
      },
      callbacks: {
        onLabelCustomizationSave: (data) => this.onLabelCustomizationSave(data)
      }
    });

    this.canvasInteraction = new CanvasInteraction({
      svgEditorService: this.svgEditorService,
      dialogManager: this.dialogManager,
      signals: {
        rightClickPosition: this._rightClickPosition,
        showContextMenu: this._showContextMenu
      },
    });
  }

  ngAfterViewInit(): void {
    this.initializeEventHandlers();
    this.setupEventListeners();
    this.setupD3Zoom();
    this.initializeD3Canvas();
  }

  private initializeEventHandlers(): void {
    this.eventHandlers = new EventHandlers({
      svgEditorService: this.svgEditorService,
      previewModeService: this.previewModeService,
      getCanvasContainer: () => this.canvasContainer.nativeElement,
      getSvgCanvas: () => this.svgCanvas.nativeElement,
      getFileInput: () => this.fileInput.nativeElement,
      signals: {
        isDragging: this._isDragging,
        dragStart: this._dragStart,
        mousePosition: this._mousePosition,
        showContextMenu: this._showContextMenu,
        contextMenuPosition: this._contextMenuPosition,
        rightClickPosition: this._rightClickPosition,
        showLabelCustomizationDialog: this._showLabelCustomizationDialog,
        selectedElementForDialog: this._selectedElementForDialog
      },
      callbacks: {
        onLabelCustomizationSave: (data) => this.onLabelCustomizationSave(data),
        onTextToolClick: (position) => this.onTextToolClick(position)
      }
    });
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    this.svgEditorService.destroy();
  }

  private setupEventListeners(): void {
    this.mouseMoveListener = (event: MouseEvent) => this.eventHandlers.onMouseMove(event);
    this.mouseUpListener = (event: MouseEvent) => this.eventHandlers.onMouseUp(event);
    this.wheelListener = (event: WheelEvent) => this.eventHandlers.onWheel(event);
    this.animationEventListener = (event: CustomEvent) => this.handleAnimationEvent(event);
    this.globalClickListener = (event: MouseEvent) => this.onGlobalClick(event);

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
    document.addEventListener('click', this.globalClickListener);
    this.canvasContainer.nativeElement.addEventListener('wheel', this.wheelListener, { passive: false });
    window.addEventListener('preview:animation:execute', this.animationEventListener as EventListener);
  }

  private removeEventListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
    if (this.globalClickListener) {
      document.removeEventListener('click', this.globalClickListener);
    }
    if (this.wheelListener) {
      this.canvasContainer.nativeElement.removeEventListener('wheel', this.wheelListener);
    }
    if (this.animationEventListener) {
      window.removeEventListener('preview:animation:execute', this.animationEventListener as EventListener);
    }
  }

  private setupEffects(): void {
    effect(() => {
      const tool = this.activeTool();
      this.updateCursor(tool);
    });
  }

  private updateCursor(tool: EditorTool): void {
    const container = this.canvasContainer?.nativeElement;
    if (!container) return;

    CanvasUtils.updateCursor(container, tool);
  }

  private setupD3Zoom(): void {
    const svg = d3.select(this.svgCanvas.nativeElement);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        this.svgEditorService.setCanvasPan(transform.x, transform.y);
        this.svgEditorService.setCanvasZoom(transform.k);
      });

    svg.call(zoom);
  }

  private initializeD3Canvas(): void {
    this.svgEditorService.initialize(this.svgCanvas.nativeElement, 1200, 800);
  }

  zoomIn(): void {
    const canvas = this.canvas();
    const newZoom = CanvasUtils.calculateZoom(canvas.zoom, 'in');
    this.svgEditorService.setCanvasZoom(newZoom);
  }

  zoomOut(): void {
    const canvas = this.canvas();
    const newZoom = CanvasUtils.calculateZoom(canvas.zoom, 'out');
    this.svgEditorService.setCanvasZoom(newZoom);
  }

  resetZoom(): void {
    const resetTransform = CanvasUtils.resetCanvasTransform();
    this.svgEditorService.setCanvasZoom(resetTransform.zoom);
    this.svgEditorService.setCanvasPan(resetTransform.panX, resetTransform.panY);
  }


  onContextMenuItemClick(item: ContextMenuItem): void {
    if (!item.disabled && item.action) {
      item.action();
      this._showContextMenu.set(false);
    }
  }

  private onGlobalClick(event: MouseEvent): void {
    if (this._showContextMenu()) {
      const target = event.target as Element;
      const canvasContainer = this.canvasContainer?.nativeElement;

      if (canvasContainer && !canvasContainer.contains(target)) {
        this._showContextMenu.set(false);
      }
    }
  }

  onDragSelectionStart(event: DragDropEvent): void {
    if (this.activeTool() === 'SELECT') {
      this._isDragging.set(true);
      this._dragStart.set(event.position || { x: 0, y: 0 });
    }
  }

  onDragSelectionMove(event: DragDropEvent): void {
    if (this.isDraggingSelection() && event.position) {
      this._mousePosition.set(event.position);
    }
  }

  onDragSelectionEnd(event: DragDropEvent): void {
    if (this.isDraggingSelection()) {
      this._isDragging.set(false);
      this.selectionUtils.performSelection(this.selectionRect());
    }
  }


  private onLabelCustomizationSave(customization: LabelCustomization): void {
    const element = this.selectedElementForDialog();
    if (element) {
      if ((element as any).isNewLabel) {
        const targetElementId = (element as any).targetElementId;
        let textPosition = { x: element.attributes['x'], y: element.attributes['y'] };

        if (targetElementId) {
          const targetCenter = this.svgEditorService.getElementCenter(targetElementId);
          if (targetCenter) {
            textPosition = targetCenter;
          }
        }

        const newTextElement: SvgElement = {
          id: this.generateElementId(),
          type: SvgElementType.TEXT,
          attributes: {
            x: textPosition.x,
            y: textPosition.y,
            textContent: customization.text,
            fill: customization.color,
            'font-size': customization.fontSize,
            'font-family': customization.fontFamily,
            'font-weight': 'normal',
            'text-anchor': customization.textAnchor,
            stroke: 'none',
            'stroke-width': '0',
            'data-label-type': 'text'
          },
          layerId: 'default',
          visible: true,
          locked: false,
          selected: true
        };

        this.svgEditorService.addElement(newTextElement);
      } else {
        this.svgEditorService.updateTextElementProperties(element.id, {
          textContent: customization.text,
          fill: customization.color,
          'font-size': customization.fontSize,
          'font-family': customization.fontFamily,
          'text-anchor': customization.textAnchor
        });
      }
    }
  }

  private generateElementId(): string {
    return CanvasUtils.generateElementId();
  }

  private onTextToolClick(position: { x: number; y: number }): void {
    this.svgEditorService.addElement({
      type: SvgElementType.TEXT,
      attributes: {
        x: position.x,
        y: position.y,
        textContent: 'New Label',
        fill: '#000000',
        'font-size': '18',
        'font-family': 'Arial, sans-serif',
        'font-weight': 'normal',
        'text-anchor': 'start',
        stroke: 'none',
        'stroke-width': '0',
        'data-label-type': 'text'
      },
      layerId: 'default',
      visible: true,
      locked: false,
      selected: true
    });

    const elements = this.svgEditorService.elements();
    const newTextElement = elements.find(el => el.type === SvgElementType.TEXT && el.attributes['textContent'] === 'New Label');
    if (newTextElement) {
      this.dialogManager.openLabelCustomizationDialog(newTextElement);
    }
  }

  private handleAnimationEvent(event: CustomEvent): void {
    if (!this.svgCanvas?.nativeElement) return;

    AnimationUtils.handleAnimationEvent(
      event,
      this.svgCanvas.nativeElement,
      (elementId: string, properties: Record<string, any>) => {
        this.svgEditorService.updateElementProperties(elementId, properties);
      }
    );
  }
}

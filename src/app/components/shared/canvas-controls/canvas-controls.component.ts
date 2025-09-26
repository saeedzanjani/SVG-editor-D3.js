import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SvgEditorService } from '../../../services/svg-editor.service';
import { D3Utils } from '../../../utils/d3.utils';

@Component({
  selector: 'app-canvas-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas-controls.component.html',
  styleUrls: ['./canvas-controls.component.scss']
})
export class CanvasControlsComponent {
  private svgEditorService = inject(SvgEditorService);


  readonly canvas = this.svgEditorService.canvas;

  zoomIn(): void {
    const currentZoom = this.canvas().zoom;
    const newZoom = Math.min(10, currentZoom * 1.2);
    this.svgEditorService.setCanvasZoom(newZoom);
  }

  zoomOut(): void {
    const currentZoom = this.canvas().zoom;
    const newZoom = Math.max(0.1, currentZoom / 1.2);
    this.svgEditorService.setCanvasZoom(newZoom);
  }

  resetZoom(): void {
    this.svgEditorService.setCanvasZoom(1);
    this.svgEditorService.setCanvasPan(0, 0);
  }

}

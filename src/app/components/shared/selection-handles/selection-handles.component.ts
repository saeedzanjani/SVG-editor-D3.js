import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SvgElement } from '../../../models/svg-element.model';
import { ResizeHandle } from '../../../models/component.models';

@Component({
  selector: 'app-selection-handles',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './selection-handles.component.html',
  styleUrls: ['./selection-handles.component.scss']
})
export class SelectionHandlesComponent {
  selectedElementIds = input.required<string[]>();
  getSelectedElement = input.required<(id: string) => SvgElement | null>();
  getResizeHandles = input.required<(element: SvgElement) => ResizeHandle[]>();

  getElement(elementId: string): SvgElement | null {
    return this.getSelectedElement()(elementId);
  }

  getHandles(element: SvgElement): ResizeHandle[] {
    return this.getResizeHandles()(element);
  }
}

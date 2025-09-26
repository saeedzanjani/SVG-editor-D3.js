import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SelectionRect } from '../../../models/component.models';

@Component({
  selector: 'app-drag-selection',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './drag-selection.component.html',
  styleUrls: ['./drag-selection.component.scss']
})
export class DragSelectionComponent {
  isDragging = input.required<boolean>();
  activeTool = input.required<string>();
  selectionRect = input.required<SelectionRect>();
}

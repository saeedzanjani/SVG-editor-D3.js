import { Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MousePosition } from '../../../models/component.models';

@Component({
  selector: 'app-mouse-position',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './mouse-position.component.html',
  styleUrls: ['./mouse-position.component.scss']
})
export class MousePositionComponent {
  showMousePosition = input.required<boolean>();
  mousePosition = input.required<MousePosition>();
}

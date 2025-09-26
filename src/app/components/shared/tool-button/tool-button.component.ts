import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolConfig } from '../../../models/component.models';

@Component({
  selector: 'app-tool-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tool-button.component.html',
  styleUrls: ['./tool-button.component.scss']
})
export class ToolButtonComponent {
  @Input() tool!: ToolConfig;
  @Input() active = false;
  @Output() toolClick = new EventEmitter<ToolConfig>();

  onClick(): void {
    this.toolClick.emit(this.tool);
  }
}

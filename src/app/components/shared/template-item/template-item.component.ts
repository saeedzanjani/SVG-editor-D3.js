import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgTemplate } from '../../../constants/file-panel.constants';

@Component({
  selector: 'app-template-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {
  @Input({ required: true }) template!: SvgTemplate;
  @Input() selected = false;
  @Output() templateSelect = new EventEmitter<SvgTemplate>();
  @Output() templateDelete = new EventEmitter<SvgTemplate>();

  onTemplateClick(): void {
    this.templateSelect.emit(this.template);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.templateDelete.emit(this.template);
  }
}

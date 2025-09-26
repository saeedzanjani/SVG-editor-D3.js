import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateItemComponent } from '../template-item/template-item.component';
import { SvgTemplate } from '../../../constants';

@Component({
  selector: 'app-template-grid',
  standalone: true,
  imports: [CommonModule, TemplateItemComponent],
  templateUrl: './template-grid.component.html',
  styleUrls: ['./template-grid.component.scss']
})
export class TemplateGridComponent {
  @Input() templates: SvgTemplate[] = [];
  @Input() selectedTemplateId: string | null = null;
  @Input() showEmptyState: boolean = true;
  @Input() emptyStateMessage: string = 'No templates found';
  @Input() emptyStateHint: string = 'Try adjusting your search or category filter';

  @Output() templateSelect = new EventEmitter<SvgTemplate>();
  @Output() templateDelete = new EventEmitter<SvgTemplate>();

  isTemplateSelected(templateId: string): boolean {
    return this.selectedTemplateId === templateId;
  }

  onTemplateSelect(template: SvgTemplate): void {
    this.templateSelect.emit(template);
  }

  onTemplateDelete(template: SvgTemplate): void {
    this.templateDelete.emit(template);
  }
}

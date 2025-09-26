import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryOption } from '../../../models/component.models';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent {
  @Input() categories: CategoryOption[] = [];
  @Input() selectedCategory: string = '';
  @Input() placeholder: string = 'Select category';
  @Input() disabled: boolean = false;

  @Output() categoryChange = new EventEmitter<string>();

  onCategoryChange(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLSelectElement;
    this.categoryChange.emit(target.value);
  }
}

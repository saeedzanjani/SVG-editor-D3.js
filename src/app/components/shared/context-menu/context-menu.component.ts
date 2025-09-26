import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuItem } from '../../../models/component.models';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
  visible = input.required<boolean>();
  position = input.required<{ x: number; y: number }>();
  items = input.required<ContextMenuItem[]>();

  itemClick = output<ContextMenuItem>();

  onItemClick(item: ContextMenuItem): void {
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
  }
}

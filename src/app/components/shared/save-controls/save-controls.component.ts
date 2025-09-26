import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-save-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-controls.component.html',
  styleUrls: ['./save-controls.component.scss']
})
export class SaveControlsComponent {
  hasContent = input.required<boolean>();

  save = output<void>();

  onSave(): void {
    this.save.emit();
  }
}

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  visible = input<boolean>(false);
  title = input<string>('');
  size = input<'small' | 'medium' | 'large'>('medium');
  closable = input<boolean>(true);

  close = output<void>();

  onOverlayClick(): void {
    if (this.closable()) {
      this.close.emit();
    }
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  onCloseClick(): void {
    this.close.emit();
  }
}

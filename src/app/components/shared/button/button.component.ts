import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonType, ButtonSize } from '../../../models';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  type = input<ButtonType>('primary');
  size = input<ButtonSize>('medium');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<string>('');
  iconPosition = input<'left' | 'right'>('left');
  fullWidth = input<boolean>(false);

  click = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit(event);
    }
  }
}

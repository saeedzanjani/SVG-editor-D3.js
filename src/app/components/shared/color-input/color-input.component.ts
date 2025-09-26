import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss']
})
export class ColorInputComponent {
  value = input<string>('#000000');
  disabled = input<boolean>(false);
  placeholder = input<string>('#000000');

  colorChange = output<string>();

  private readonly _color = signal<string>('#000000');
  readonly color = this._color.asReadonly();

  ngOnInit(): void {
    this._color.set(this.value());
  }

  onColorPickerChange(newColor: string): void {
    this._color.set(newColor);
    this.colorChange.emit(newColor);
  }

  onTextInputChange(newColor: string): void {
    if (this.isValidColor(newColor)) {
      this._color.set(newColor);
      this.colorChange.emit(newColor);
    }
  }

  private isValidColor(color: string): boolean {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color);
  }
}

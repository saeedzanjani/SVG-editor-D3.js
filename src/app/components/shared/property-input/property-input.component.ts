import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Property } from '../../../models/component.models';

@Component({
  selector: 'app-property-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-input.component.html',
  styleUrls: ['./property-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyInputComponent {
  property = input.required<Property>();
  propertyChange = output<{ property: Property; value: string | number | boolean }>();

  onInput(event: Event): void {
    let value: string | number | boolean;
    if (event?.target) {
      const target = event.target as HTMLInputElement;
      if (target.type === 'checkbox') {
        value = target.checked;
      } else if (target.type === 'number') {
        value = parseFloat(target.value);
      } else if (target.type === 'range') {
        value = parseFloat(target.value);
      } else {
        value = target.value;
      }
    } else {
      value = event as unknown as string | number | boolean;
    }

    this.propertyChange.emit({
      property: this.property(),
      value
    });
  }

  getRangeValue(): string {
    const value = this.property().value;
    if (typeof value === 'number') {
      return (value * 100).toFixed(0);
    }
    return '0';
  }
}

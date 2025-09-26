import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyGroup, Property } from '../../../models/component.models';
import { PropertyInputComponent } from '../property-input/property-input.component';
import { PropertyUtils } from '../../../utils/property.utils';

@Component({
  selector: 'app-property-group',
  standalone: true,
  imports: [CommonModule, PropertyInputComponent],
  templateUrl: './property-group.component.html',
  styleUrls: ['./property-group.component.scss']
})
export class PropertyGroupComponent {
  group = input.required<PropertyGroup>();
  groupToggle = output<string>();
  propertyChange = output<{ property: Property; value: string | number | boolean }>();

  toggleGroup(): void {
    this.groupToggle.emit(this.group().name);
  }

  onPropertyChange(event: { property: Property; value: string | number | boolean }): void {
    this.propertyChange.emit(event);
  }
}

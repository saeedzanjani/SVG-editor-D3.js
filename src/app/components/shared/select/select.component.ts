import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectOption } from '../../../models';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  options = input<SelectOption[]>([]);
  value = input<string>('');
  disabled = input<boolean>(false);
  placeholder = input<string>('');

  valueChange = output<string>();

  private readonly _selectedValue = signal<string>('');
  readonly selectedValue = this._selectedValue.asReadonly();

  ngOnInit(): void {
    this._selectedValue.set(this.value());
  }

  onSelectionChange(newValue: string): void {
    this._selectedValue.set(newValue);
    this.valueChange.emit(newValue);
  }
}

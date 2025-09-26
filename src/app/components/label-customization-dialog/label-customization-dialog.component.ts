import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgElement, LabelCustomization, SelectOption } from '../../models';
import { TEXT_CONSTANTS } from '../../constants/text.constants';
import { TextUtils } from '../../utils/text.utils';
import {
  DialogComponent,
  ColorInputComponent,
  SelectComponent,
  ButtonComponent
} from '../shared';

@Component({
  selector: 'app-label-customization-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    ColorInputComponent,
    SelectComponent,
    ButtonComponent
  ],
  templateUrl: './label-customization-dialog.component.html',
  styleUrls: ['./label-customization-dialog.component.scss']
})
export class LabelCustomizationDialogComponent implements OnChanges {
  @Input() element: SvgElement | null = null;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<LabelCustomization>();

  private readonly _customization = signal<LabelCustomization>(
    TextUtils.getDefaultLabelCustomization()
  );

  readonly customization = this._customization.asReadonly();
  readonly fontFamilyOptions: SelectOption[] = [...TEXT_CONSTANTS.FONT_FAMILIES];
  readonly textAnchorOptions: SelectOption[] = [...TEXT_CONSTANTS.TEXT_ANCHORS];
  readonly TEXT_CONSTANTS = TEXT_CONSTANTS;

  readonly previewTextX = computed(() =>
    TextUtils.getTextXPosition(this.customization().textAnchor)
  );

  ngOnInit(): void {
    if (this.element) {
      this.loadElementData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['element'] && this.element) {
      this.loadElementData();
    }
  }

  private loadElementData(): void {
    if (!this.element) return;

    const textProperties = TextUtils.extractTextPropertiesFromElement(this.element);
    this._customization.set(textProperties);
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit(this.customization());
    this.close.emit();
  }

  onTextChange(text: string): void {
    this._customization.update(customization => ({ ...customization, text }));
  }

  onColorChange(color: string): void {
    this._customization.update(customization => ({ ...customization, color }));
  }

  onFontSizeChange(fontSize: number): void {
    this._customization.update(customization => ({ ...customization, fontSize }));
  }

  onFontFamilyChange(fontFamily: string): void {
    this._customization.update(customization => ({ ...customization, fontFamily }));
  }

  onTextAnchorChange(textAnchor: string): void {
    this._customization.update(customization => ({ ...customization, textAnchor }));
  }
}

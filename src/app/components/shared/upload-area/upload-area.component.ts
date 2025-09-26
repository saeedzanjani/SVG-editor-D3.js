import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadEvent } from '../../../models/component.models';

@Component({
  selector: 'app-upload-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-area.component.html',
  styleUrls: ['./upload-area.component.scss']
})
export class UploadAreaComponent {
  @Input() accept: string = '.svg,image/svg+xml';
  @Input() multiple: boolean = false;
  @Input() disabled: boolean = false;
  @Input() uploadText: string = 'Click to upload SVG file';
  @Input() uploadHint: string = 'or drag and drop';
  @Input() showIcon: boolean = true;

  @Output() fileUpload = new EventEmitter<FileUploadEvent>();
  @Output() dragOver = new EventEmitter<boolean>();

  private readonly _isDragOver = signal(false);
  readonly isDragOver = this._isDragOver.asReadonly();

  onFileSelect(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.fileUpload.emit({ file });
      target.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(true);
    this.dragOver.emit(true);
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);
    this.dragOver.emit(false);
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);
    this.dragOver.emit(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.fileUpload.emit({ file });
    }
  }
}

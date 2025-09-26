import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-controls.component.html',
  styleUrls: ['./preview-controls.component.scss']
})
export class PreviewControlsComponent {
  isPreviewMode = input.required<boolean>();

  play = output<void>();
  pause = output<void>();
  stop = output<void>();

  onPlay(): void {
    this.play.emit();
  }

  onPause(): void {
    this.pause.emit();
  }

  onStop(): void {
    this.stop.emit();
  }
}

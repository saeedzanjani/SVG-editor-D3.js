import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animation-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animation-controls.component.html',
  styleUrls: ['./animation-controls.component.scss']
})
export class AnimationControlsComponent {
  animationEnabled = input.required<boolean>();
  hasAnimation = input.required<boolean>();
  isAnimationRunning = input.required<boolean>();

  addAnimation = output<void>();
  pauseAnimation = output<void>();
  resumeAnimation = output<void>();
  stopAnimation = output<void>();
  previewAnimation = output<void>();
  removeAnimation = output<void>();

  onAddAnimation(): void {
    this.addAnimation.emit();
  }

  onPauseAnimation(): void {
    this.pauseAnimation.emit();
  }

  onResumeAnimation(): void {
    this.resumeAnimation.emit();
  }

  onStopAnimation(): void {
    this.stopAnimation.emit();
  }

  onPreviewAnimation(): void {
    this.previewAnimation.emit();
  }

  onRemoveAnimation(): void {
    this.removeAnimation.emit();
  }
}

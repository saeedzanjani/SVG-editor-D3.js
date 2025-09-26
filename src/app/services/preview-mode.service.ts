import { Injectable, signal } from '@angular/core';
import { AnimationConfig } from '../models/component.models';

@Injectable({
  providedIn: 'root'
})
export class PreviewModeService {
  private readonly _isPreviewMode = signal(false);
  private readonly _animations = signal<Map<string, AnimationConfig>>(new Map());

  readonly isPreviewMode = this._isPreviewMode.asReadonly();
  readonly animations = this._animations.asReadonly();

  togglePreviewMode(): void {
    this._isPreviewMode.update(mode => !mode);
  }

  setPreviewMode(enabled: boolean): void {
    this._isPreviewMode.set(enabled);
  }

  enablePreviewMode(): void {
    this._isPreviewMode.set(true);
  }

  disablePreviewMode(): void {
    this._isPreviewMode.set(false);
    this.stopAllAnimations();
  }

  addAnimation(config: AnimationConfig): void {
    this._animations.update(animations => {
      const newAnimations = new Map(animations);
      newAnimations.set(config.elementId, config);
      return newAnimations;
    });
  }

  removeAnimation(elementId: string): void {
    this._animations.update(animations => {
      const newAnimations = new Map(animations);
      const config = newAnimations.get(elementId);
      if (config?.intervalId) {
        clearInterval(config.intervalId);
      }
      newAnimations.delete(elementId);
      return newAnimations;
    });
  }

  startAnimation(elementId: string): void {
    const animations = this._animations();
    const config = animations.get(elementId);
    if (!config || !config.enabled) return;

    if (config.intervalId) {
      clearInterval(config.intervalId);
    }

    const intervalId = setInterval(() => {
      this.executeAnimation(config);
    }, config.interval);

    this._animations.update(animations => {
      const newAnimations = new Map(animations);
      const updatedConfig = { ...config, intervalId };
      newAnimations.set(elementId, updatedConfig);
      return newAnimations;
    });
  }

  stopAnimation(elementId: string): void {
    const animations = this._animations();
    const config = animations.get(elementId);
    if (config?.intervalId) {
      clearInterval(config.intervalId);
      this._animations.update(animations => {
        const newAnimations = new Map(animations);
        const updatedConfig = { ...config, intervalId: undefined };
        newAnimations.set(elementId, updatedConfig);
        return newAnimations;
      });
    }
  }

  pauseAnimation(elementId: string): void {
    this.stopAnimation(elementId);
  }

  resumeAnimation(elementId: string): void {
    this.startAnimation(elementId);
  }

  isAnimationRunning(elementId: string): boolean {
    const animations = this._animations();
    const config = animations.get(elementId);
    const isRunning = !!(config?.intervalId);
    return isRunning;
  }

  private executeAnimation(config: AnimationConfig): void {
    const event = new CustomEvent('preview:animation:execute', {
      detail: { config }
    });
    window.dispatchEvent(event);
  }

  private stopAllAnimations(): void {
    const animations = this._animations();
    animations.forEach((config, elementId) => {
      if (config.intervalId) {
        clearInterval(config.intervalId);
      }
    });
    this._animations.set(new Map());
  }

  getAnimationConfig(elementId: string): AnimationConfig | undefined {
    return this._animations().get(elementId);
  }

  updateAnimationConfig(elementId: string, updates: Partial<AnimationConfig>): void {
    this._animations.update(animations => {
      const newAnimations = new Map(animations);
      const existingConfig = newAnimations.get(elementId);
      if (existingConfig) {
        const updatedConfig = { ...existingConfig, ...updates };
        newAnimations.set(elementId, updatedConfig);
      }
      return newAnimations;
    });
  }
}

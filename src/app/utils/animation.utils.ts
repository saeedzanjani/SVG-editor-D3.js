import { CANVAS_CONSTANTS } from '../constants/canvas.constants';
import { AnimationConfig } from '../models/component.models';
import * as d3 from 'd3';

export class AnimationUtils {
  private static animationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  static clearAllAnimations(): void {
    this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.animationTimeouts.clear();
  }

  static clearAnimation(elementId: string): void {
    const timeout = this.animationTimeouts.get(elementId);
    if (timeout) {
      clearTimeout(timeout);
      this.animationTimeouts.delete(elementId);
    }
  }

  static executeColorChangeAnimation(
    d3Element: d3.Selection<any, any, any, any>,
    config: AnimationConfig,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void
  ): void {
    if (!config.originalColor) {
      config.originalColor = d3Element.attr('fill') || d3Element.attr('stroke') || '#000000';
    }

    const existingTimeout = this.animationTimeouts.get(config.elementId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    d3Element.attr('fill', config.color || '#000000');

    const timeout = setTimeout(() => {
      d3Element.attr('fill', config.originalColor || '#000000');
      this.animationTimeouts.delete(config.elementId);
    }, config.duration);

    this.animationTimeouts.set(config.elementId, timeout);
  }

  static executeScaleAnimation(
    d3Element: d3.Selection<any, any, any, any>,
    config: AnimationConfig
  ): void {
    const currentTransform = d3Element.attr('transform') || '';

    d3Element.attr('transform', `${currentTransform} scale(${CANVAS_CONSTANTS.ANIMATION_SCALE})`);

    setTimeout(() => {
      d3Element.attr('transform', currentTransform);
    }, config.duration);
  }

  static executeRotateAnimation(
    d3Element: d3.Selection<any, any, any, any>,
    config: AnimationConfig
  ): void {
    const currentTransform = d3Element.attr('transform') || '';

    d3Element.attr('transform', `${currentTransform} rotate(${CANVAS_CONSTANTS.ANIMATION_ROTATION})`);

    setTimeout(() => {
      d3Element.attr('transform', currentTransform);
    }, config.duration);
  }

  static executeOpacityAnimation(
    d3Element: d3.Selection<any, any, any, any>,
    config: AnimationConfig
  ): void {
    const originalOpacity = d3Element.attr('opacity') || '1';

    d3Element.attr('opacity', CANVAS_CONSTANTS.ANIMATION_OPACITY.toString());

    setTimeout(() => {
      d3Element.attr('opacity', originalOpacity);
    }, config.duration);
  }

  static executeColorChangeAnimationDirect(
    config: AnimationConfig,
    getElementProperties: (elementId: string) => Record<string, any>,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void,
    updateAnimationConfig: (elementId: string, updates: Partial<AnimationConfig>) => void
  ): void {
    const elementProperties = getElementProperties(config.elementId);

    if (!config.originalColor) {
      config.originalColor = elementProperties['fill'] || elementProperties['stroke'] || '#000000';
      updateAnimationConfig(config.elementId, { originalColor: config.originalColor });
    }

    updateElementProperties(config.elementId, { 'fill': config.color });

    setTimeout(() => {
      updateElementProperties(config.elementId, { 'fill': config.originalColor });
    }, config.duration);
  }

  static executeScaleAnimationDirect(
    config: AnimationConfig,
    getElementProperties: (elementId: string) => Record<string, any>,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void
  ): void {
    const elementProperties = getElementProperties(config.elementId);
    const currentTransform = elementProperties['transform'] || '';

    const newTransform = currentTransform ?
      `${currentTransform} scale(${CANVAS_CONSTANTS.ANIMATION_SCALE})` :
      `scale(${CANVAS_CONSTANTS.ANIMATION_SCALE})`;
    updateElementProperties(config.elementId, { 'transform': newTransform });

    setTimeout(() => {
      updateElementProperties(config.elementId, { 'transform': currentTransform || undefined });
    }, config.duration);
  }

  static executeRotateAnimationDirect(
    config: AnimationConfig,
    getElementProperties: (elementId: string) => Record<string, any>,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void
  ): void {
    const elementProperties = getElementProperties(config.elementId);
    const currentTransform = elementProperties['transform'] || '';

    const newTransform = currentTransform ?
      `${currentTransform} rotate(${CANVAS_CONSTANTS.ANIMATION_ROTATION})` :
      `rotate(${CANVAS_CONSTANTS.ANIMATION_ROTATION})`;
    updateElementProperties(config.elementId, { 'transform': newTransform });

    setTimeout(() => {
      updateElementProperties(config.elementId, { 'transform': currentTransform || undefined });
    }, config.duration);
  }

  static executeOpacityAnimationDirect(
    config: AnimationConfig,
    getElementProperties: (elementId: string) => Record<string, any>,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void
  ): void {
    const elementProperties = getElementProperties(config.elementId);
    const originalOpacity = elementProperties['opacity'] || '1';

    updateElementProperties(config.elementId, { 'opacity': CANVAS_CONSTANTS.ANIMATION_OPACITY.toString() });

    setTimeout(() => {
      updateElementProperties(config.elementId, { 'opacity': originalOpacity });
    }, config.duration);
  }

  static handleAnimationEvent(
    event: CustomEvent,
    svgElement: SVGSVGElement,
    updateElementProperties: (elementId: string, properties: Record<string, any>) => void
  ): void {
    const config = event.detail?.config;
    if (!config) return;

    const d3Element = d3.select(svgElement).select(`#${config.elementId}`);

    if (!d3Element || d3Element.empty()) {
      return;
    }

    switch (config.type) {
      case 'color-change':
        AnimationUtils.executeColorChangeAnimation(
          d3Element,
          config,
          updateElementProperties
        );
        break;
      case 'scale':
        AnimationUtils.executeScaleAnimation(d3Element, config);
        break;
      case 'rotate':
        AnimationUtils.executeRotateAnimation(d3Element, config);
        break;
      case 'opacity':
        AnimationUtils.executeOpacityAnimation(d3Element, config);
        break;
      default:
    }
  }
}

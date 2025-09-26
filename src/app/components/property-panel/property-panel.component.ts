import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgEditorService } from '../../services/svg-editor.service';
import { PreviewModeService } from '../../services/preview-mode.service';
import { AnimationConfig } from '../../models/component.models';
import { SvgElement } from '../../models/svg-element.model';
import { PropertyGroup, Property } from '../../models/component.models';
import { PropertyUtils } from '../../utils/property.utils';
import { PROPERTY_CONSTANTS } from '../../constants/property.constants';
import { PropertyGroupComponent, AnimationControlsComponent } from '../shared';

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [CommonModule, PropertyGroupComponent, AnimationControlsComponent],
  templateUrl: './property-panel.component.html',
  styleUrls: ['./property-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelComponent {
  private svgEditorService = inject(SvgEditorService);
  private previewModeService = inject(PreviewModeService);

  private readonly _expandedGroups = signal<Set<string>>(new Set(PROPERTY_CONSTANTS.DEFAULT_EXPANDED_GROUPS));
  private readonly _showAnimationPanel = signal(false);
  private readonly _animationProperties = signal<any>({});

  readonly selectedElements = this.svgEditorService.selectedElements;
  readonly selectedElementIds = this.svgEditorService.selectedElementIds;
  readonly expandedGroups = this._expandedGroups.asReadonly();
  readonly showAnimationPanel = this._showAnimationPanel.asReadonly();
  readonly animationProperties = this._animationProperties.asReadonly();

  readonly propertyGroups = computed(() => {
    const selectedIds = this.selectedElementIds();
    if (selectedIds.length === 0) return [];

    const firstElementId = selectedIds[0];
    const elementProperties = this.svgEditorService.getElementProperties(firstElementId);

    if (Object.keys(elementProperties).length === 0) return [];

    const groups: PropertyGroup[] = [];

    groups.push({
      name: PROPERTY_CONSTANTS.GROUPS.BASIC,
      expanded: this.expandedGroups().has(PROPERTY_CONSTANTS.GROUPS.BASIC),
      properties: PropertyUtils.getBasicProperties(elementProperties)
    });

    groups.push({
      name: PROPERTY_CONSTANTS.GROUPS.APPEARANCE,
      expanded: this.expandedGroups().has(PROPERTY_CONSTANTS.GROUPS.APPEARANCE),
      properties: PropertyUtils.getAppearanceProperties(elementProperties)
    });

    groups.push({
      name: PROPERTY_CONSTANTS.GROUPS.TRANSFORM,
      expanded: this.expandedGroups().has(PROPERTY_CONSTANTS.GROUPS.TRANSFORM),
      properties: PropertyUtils.getTransformProperties(elementProperties)
    });

    const typeSpecificProps = PropertyUtils.getTypeSpecificProperties(elementProperties);
    if (typeSpecificProps.length > 0) {
      groups.push({
        name: PROPERTY_CONSTANTS.GROUPS.TYPE_SPECIFIC,
        expanded: this.expandedGroups().has(PROPERTY_CONSTANTS.GROUPS.TYPE_SPECIFIC),
        properties: typeSpecificProps
      });
    }

    groups.push({
      name: PROPERTY_CONSTANTS.GROUPS.ANIMATION,
      expanded: this.expandedGroups().has(PROPERTY_CONSTANTS.GROUPS.ANIMATION),
      properties: PropertyUtils.getAnimationProperties(this.animationProperties())
    });

    return groups;
  });

  constructor() {
    effect(() => {
      const elements = this.selectedElements();
      if (elements.length > 0) {
        this.updateAnimationProperties(elements[0]);
      }
    });
  }

  private updateAnimationProperties(element: SvgElement): void {
    const animationProps = {
      enabled: false,
      type: 'color-change',
      duration: 1000,
      interval: 5000,
      color: '#ff0000'
    };

    this._animationProperties.set(animationProps);
  }

  onPropertyChange(property: Property, value: string | number | boolean): void {
    const selectedIds = this.selectedElementIds();
    if (selectedIds.length === 0) return;

    selectedIds.forEach(elementId => {
      if (property.key.startsWith('animation-')) {
        this.updateAnimationProperty(property.key, value);
      } else if (['translateX', 'translateY', 'scaleX', 'scaleY', 'rotate'].includes(property.key)) {
        this.updateTransformProperty(elementId, property.key, value as number);
      } else if (property.key === 'visible') {
        this.updateVisibilityProperty(elementId, value as boolean);
      } else {
        this.updateAttributeProperty(elementId, property.key, value);
      }
    });
  }

  private updateAnimationProperty(key: string, value: string | number | boolean): void {
    const animationKey = key.replace('animation-', '');
    this._animationProperties.update(props => ({
      ...props,
      [animationKey]: value
    }));

    if ((animationKey === 'interval' || animationKey === 'duration') && this.hasRunningAnimations()) {
      this.restartRunningAnimations();
    }
  }

  private updateTransformProperty(elementId: string, key: string, value: number): void {
    if (key === 'translateX') {
      this.svgEditorService.updateElementPropertiesFromPanel(elementId, { 'x': value });
    } else if (key === 'translateY') {
      this.svgEditorService.updateElementPropertiesFromPanel(elementId, { 'y': value });
    } else if (['scaleX', 'scaleY', 'rotate'].includes(key)) {
      this.updateElementTransform(elementId, key, value);
    }
  }

  private updateAttributeProperty(elementId: string, key: string, value: string | number | boolean): void {
    this.svgEditorService.updateElementPropertiesFromPanel(elementId, {
      [key]: value
    });
  }

  private updateVisibilityProperty(elementId: string, isVisible: boolean): void {
    this.svgEditorService.updateElementPropertiesFromPanel(elementId, {
      'visibility': isVisible ? 'visible' : 'hidden'
    });
  }

  toggleGroup(groupName: string): void {
    this._expandedGroups.update(groups => {
      const newGroups = new Set(groups);
      if (newGroups.has(groupName)) {
        newGroups.delete(groupName);
      } else {
        newGroups.add(groupName);
      }
      return newGroups;
    });
  }

  isGroupExpanded(groupName: string): boolean {
    return this.expandedGroups().has(groupName);
  }

  onAddAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    const animationProps = this.animationProperties();
    if (!animationProps['enabled']) {
      return;
    }

    if (!this.previewModeService.isPreviewMode()) {
      this.previewModeService.enablePreviewMode();
    }

    elements.forEach(element => {
      const animationConfig: AnimationConfig = {
        elementId: element.id,
        enabled: true,
        type: animationProps['type'] || 'color-change',
        duration: animationProps['duration'] || 1000,
        interval: animationProps['interval'] || 5000,
        color: animationProps['color'] || '#ff0000'
      };

      this.previewModeService.addAnimation(animationConfig);
      this.previewModeService.startAnimation(element.id);
    });

  }

  private startColorChangeAnimation(elements: SvgElement[], animationProps: Record<string, string | number | boolean>): void {
    const interval = animationProps['interval'] || 5000;
    const duration = animationProps['duration'] || 1000;
    const animationColor = animationProps['color'] || '#ff0000';

    elements.forEach(element => {
      const originalColor = element.attributes['fill'] || element.attributes['stroke'] || '#000000';

      const animationInterval = setInterval(() => {
        this.updateAttributeProperty(element.id, 'fill', animationColor);

        setTimeout(() => {
          this.updateAttributeProperty(element.id, 'fill', originalColor);
        }, duration as number);
      }, interval as number);

      (element as SvgElement & { animationInterval?: any }).animationInterval = animationInterval;
    });

  }

  onRemoveAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    elements.forEach(element => {
      this.previewModeService.stopAnimation(element.id);
      this.previewModeService.removeAnimation(element.id);
    });

  }

  onPauseAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    elements.forEach(element => {
      this.previewModeService.pauseAnimation(element.id);
    });
  }

  onResumeAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    elements.forEach(element => {
      this.previewModeService.resumeAnimation(element.id);
    });
  }

  onStopAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    elements.forEach(element => {
      this.previewModeService.stopAnimation(element.id);
    });
  }

  private stopColorChangeAnimation(elements: SvgElement[]): void {
    elements.forEach(element => {
      const animationInterval = (element as SvgElement & { animationInterval?: number }).animationInterval;
      if (animationInterval) {
        clearInterval(animationInterval);
        (element as SvgElement & { animationInterval?: number }).animationInterval = undefined;
      }
    });

  }

  onPreviewAnimation(): void {
    const elements = this.selectedElements();
    if (elements.length === 0) return;

    const animationProps = this.animationProperties();

    this.previewColorChangeAnimation(elements, animationProps);
  }

  private previewColorChangeAnimation(elements: SvgElement[], animationProps: Record<string, string | number | boolean>): void {
    const duration = animationProps['duration'] || 1000;
    const animationColor = animationProps['color'] || '#ff0000';

    elements.forEach(element => {
      const originalColor = element.attributes['fill'] || element.attributes['stroke'] || '#000000';

      this.updateAttributeProperty(element.id, 'fill', animationColor);

      setTimeout(() => {
        this.updateAttributeProperty(element.id, 'fill', originalColor);
      }, duration as number);
    });

  }

  getElementTypeLabel(element: SvgElement): string {
    return PropertyUtils.getElementTypeLabel(element);
  }

  getElementSummary(element: SvgElement): string {
    return PropertyUtils.getElementSummary(element);
  }

  getGroupTitle(groupName: string): string {
    return PropertyUtils.getGroupTitle(groupName);
  }

  private hasRunningAnimations(): boolean {
    const elements = this.selectedElements();
    return elements.some(element => this.previewModeService.isAnimationRunning(element.id));
  }

  private restartRunningAnimations(): void {
    const elements = this.selectedElements();
    const animationProps = this.animationProperties();

    elements.forEach(element => {
      if (this.previewModeService.isAnimationRunning(element.id)) {
        this.previewModeService.stopAnimation(element.id);

        this.previewModeService.updateAnimationConfig(element.id, {
          interval: animationProps['interval'] || 5000,
          duration: animationProps['duration'] || 1000
        });

        this.previewModeService.startAnimation(element.id);
      }
    });

  }

  hasAnimationForSelectedElement(): boolean {
    const elements = this.selectedElements();
    if (elements.length === 0) return false;

    return elements.some(element => {
      const config = this.previewModeService.getAnimationConfig(element.id);
      return config && config.enabled;
    });
  }

  isAnimationRunningForSelectedElement(): boolean {
    const elements = this.selectedElements();
    if (elements.length === 0) return false;

    return elements.some(element => this.previewModeService.isAnimationRunning(element.id));
  }

  private updateElementTransform(elementId: string, key: string, value: number): void {
    const currentProperties = this.svgEditorService.getElementProperties(elementId);
    const currentTransform = PropertyUtils.parseTransformString(currentProperties['transform'] || '');

    let newTransform: { scaleX: number; scaleY: number; rotate: number };
    switch (key) {
      case 'scaleX':
        newTransform = { ...currentTransform, scaleX: value };
        break;
      case 'scaleY':
        newTransform = { ...currentTransform, scaleY: value };
        break;
      case 'rotate':
        newTransform = { ...currentTransform, rotate: value };
        break;
      default:
        return;
    }

    const newTransformString = PropertyUtils.buildTransformString(newTransform);

    this.svgEditorService.updateElementPropertiesFromPanel(elementId, {
      'transform': newTransformString || undefined
    });
  }
}

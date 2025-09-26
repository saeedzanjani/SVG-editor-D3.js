import { SvgElement, SvgElementType } from '../models/svg-element.model';
import { Property, TransformValues } from '../models/component.models';
import { PROPERTY_CONSTANTS } from '../constants/property.constants';

export class PropertyUtils {
  static getBasicProperties(properties: Record<string, any>): Property[] {
    return [
      {
        key: 'id',
        label: 'ID',
        type: 'text',
        value: properties['id'] || ''
      },
      {
        key: 'visible',
        label: 'Visible',
        type: 'boolean',
        value: properties['visibility'] !== 'hidden'
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'range',
        value: parseFloat(properties['opacity'] || '1'),
        ...PROPERTY_CONSTANTS.RANGES.OPACITY
      }
    ];
  }

  static getAppearanceProperties(properties: Record<string, any>): Property[] {
    return [
      {
        key: 'fill',
        label: 'Fill',
        type: 'color',
        value: this.convertToHex(properties['fill']) || PROPERTY_CONSTANTS.DEFAULTS.FILL_COLOR
      },
      {
        key: 'stroke',
        label: 'Stroke',
        type: 'color',
        value: this.convertToHex(properties['stroke']) || PROPERTY_CONSTANTS.DEFAULTS.STROKE_COLOR
      },
      {
        key: 'stroke-width',
        label: 'Stroke Width',
        type: 'number',
        value: parseFloat(properties['stroke-width'] || '1'),
        ...PROPERTY_CONSTANTS.RANGES.STROKE_WIDTH
      },
      {
        key: 'stroke-opacity',
        label: 'Stroke Opacity',
        type: 'range',
        value: parseFloat(properties['stroke-opacity'] || '1'),
        ...PROPERTY_CONSTANTS.RANGES.OPACITY
      },
      {
        key: 'fill-opacity',
        label: 'Fill Opacity',
        type: 'range',
        value: parseFloat(properties['fill-opacity'] || '1'),
        ...PROPERTY_CONSTANTS.RANGES.OPACITY
      }
    ];
  }

  static getTransformProperties(properties: Record<string, any>): Property[] {
    const x = parseFloat(properties['x'] || properties['cx'] || '0');
    const y = parseFloat(properties['y'] || properties['cy'] || '0');
    const transformStr = properties['transform'] || '';
    const transform = this.parseTransformString(transformStr);

    return [
      {
        key: 'translateX',
        label: 'X Position',
        type: 'number',
        value: x,
        step: 1
      },
      {
        key: 'translateY',
        label: 'Y Position',
        type: 'number',
        value: y,
        step: 1
      },
      {
        key: 'scaleX',
        label: 'Scale X',
        type: 'number',
        value: transform.scaleX,
        ...PROPERTY_CONSTANTS.RANGES.SCALE
      },
      {
        key: 'scaleY',
        label: 'Scale Y',
        type: 'number',
        value: transform.scaleY,
        ...PROPERTY_CONSTANTS.RANGES.SCALE
      },
      {
        key: 'rotate',
        label: 'Rotation',
        type: 'number',
        value: transform.rotate,
        ...PROPERTY_CONSTANTS.RANGES.ROTATION
      }
    ];
  }

  static getTypeSpecificProperties(properties: Record<string, any>): Property[] {
    const result: Property[] = [];
    const tagName = properties['tagName'] || '';

    switch (tagName.toLowerCase()) {
      case 'rect':
        result.push(
          {
            key: 'x',
            label: 'X',
            type: 'number',
            value: parseFloat(properties['x'] || '0'),
            step: 1
          },
          {
            key: 'y',
            label: 'Y',
            type: 'number',
            value: parseFloat(properties['y'] || '0'),
            step: 1
          },
          {
            key: 'width',
            label: 'Width',
            type: 'number',
            value: parseFloat(properties['width'] || '100'),
            min: 1,
            step: 1
          },
          {
            key: 'height',
            label: 'Height',
            type: 'number',
            value: parseFloat(properties['height'] || '100'),
            min: 1,
            step: 1
          },
          {
            key: 'rx',
            label: 'Corner Radius X',
            type: 'number',
            value: parseFloat(properties['rx'] || '0'),
            min: 0,
            step: 1
          },
          {
            key: 'ry',
            label: 'Corner Radius Y',
            type: 'number',
            value: parseFloat(properties['ry'] || '0'),
            min: 0,
            step: 1
          }
        );
        break;

      case SvgElementType.CIRCLE:
        result.push(
          {
            key: 'cx',
            label: 'Center X',
            type: 'number',
            value: parseFloat(properties['cx'] || '0'),
            step: 1
          },
          {
            key: 'cy',
            label: 'Center Y',
            type: 'number',
            value: parseFloat(properties['cy'] || '0'),
            step: 1
          },
          {
            key: 'r',
            label: 'Radius',
            type: 'number',
            value: parseFloat(properties['r'] || '50'),
            min: 1,
            step: 1
          }
        );
        break;

      case SvgElementType.ELLIPSE:
        result.push(
          {
            key: 'cx',
            label: 'Center X',
            type: 'number',
            value: parseFloat(properties['cx'] || '0'),
            step: 1
          },
          {
            key: 'cy',
            label: 'Center Y',
            type: 'number',
            value: parseFloat(properties['cy'] || '0'),
            step: 1
          },
          {
            key: 'rx',
            label: 'Radius X',
            type: 'number',
            value: parseFloat(properties['rx'] || '50'),
            min: 1,
            step: 1
          },
          {
            key: 'ry',
            label: 'Radius Y',
            type: 'number',
            value: parseFloat(properties['ry'] || '30'),
            min: 1,
            step: 1
          }
        );
        break;

      case SvgElementType.LINE:
        result.push(
          {
            key: 'x1',
            label: 'Start X',
            type: 'number',
            value: parseFloat(properties['x1'] || '0'),
            step: 1
          },
          {
            key: 'y1',
            label: 'Start Y',
            type: 'number',
            value: parseFloat(properties['y1'] || '0'),
            step: 1
          },
          {
            key: 'x2',
            label: 'End X',
            type: 'number',
            value: parseFloat(properties['x2'] || '100'),
            step: 1
          },
          {
            key: 'y2',
            label: 'End Y',
            type: 'number',
            value: parseFloat(properties['y2'] || '100'),
            step: 1
          }
        );
        break;

      case SvgElementType.TEXT:
        result.push(
          {
            key: 'x',
            label: 'X',
            type: 'number',
            value: parseFloat(properties['x'] || '0'),
            step: 1
          },
          {
            key: 'y',
            label: 'Y',
            type: 'number',
            value: parseFloat(properties['y'] || '0'),
            step: 1
          },
          {
            key: 'font-size',
            label: 'Font Size',
            type: 'number',
            value: parseFloat(properties['font-size'] || '16'),
            ...PROPERTY_CONSTANTS.RANGES.FONT_SIZE
          },
          {
            key: 'font-family',
            label: 'Font Family',
            type: 'select',
            value: properties['font-family'] || 'Arial',
            options: [...PROPERTY_CONSTANTS.FONT_FAMILIES]
          },
          {
            key: 'text-anchor',
            label: 'Text Anchor',
            type: 'select',
            value: properties['text-anchor'] || 'start',
            options: [...PROPERTY_CONSTANTS.TEXT_ANCHORS]
          }
        );
        break;
    }

    return result;
  }

  static getAnimationProperties(animationProps: Record<string, any>): Property[] {
    return [
      {
        key: 'animation-enabled',
        label: 'Enable Animation',
        type: 'boolean',
        value: animationProps['enabled'] || false
      },
      {
        key: 'animation-type',
        label: 'Animation Type',
        type: 'select',
        value: animationProps['type'] || 'color-change',
        options: [...PROPERTY_CONSTANTS.ANIMATION_TYPES]
      },
      {
        key: 'animation-duration',
        label: 'Duration (ms)',
        type: 'number',
        value: animationProps['duration'] || PROPERTY_CONSTANTS.DEFAULTS.ANIMATION_DURATION,
        ...PROPERTY_CONSTANTS.RANGES.ANIMATION_DURATION
      },
      {
        key: 'animation-interval',
        label: 'Interval (ms)',
        type: 'number',
        value: animationProps['interval'] || PROPERTY_CONSTANTS.DEFAULTS.ANIMATION_INTERVAL,
        ...PROPERTY_CONSTANTS.RANGES.ANIMATION_INTERVAL
      },
      {
        key: 'animation-color',
        label: 'Animation Color',
        type: 'color',
        value: animationProps['color'] || PROPERTY_CONSTANTS.DEFAULTS.ANIMATION_COLOR
      }
    ];
  }

  static getElementTypeLabel(element: SvgElement): string {
    if (!element || !element.type) {
      return 'Unknown';
    }
    return element.type.charAt(0).toUpperCase() + element.type.slice(1);
  }

  static getElementSummary(element: SvgElement): string {
    if (!element || !element.type) {
      return 'Unknown element';
    }
    const attrs = element.attributes;
    switch (element.type) {
      case SvgElementType.RECT:
        return `${attrs['width'] || 0} × ${attrs['height'] || 0}`;
      case SvgElementType.CIRCLE:
        return `r: ${attrs['r'] || 0}`;
      case SvgElementType.ELLIPSE:
        return `${attrs['rx'] || 0} × ${attrs['ry'] || 0}`;
      case SvgElementType.TEXT:
        return attrs['textContent'] || 'Text';
      default:
        return element.type;
    }
  }

  static getGroupTitle(groupName: string): string {
    return PROPERTY_CONSTANTS.GROUP_TITLES[groupName as keyof typeof PROPERTY_CONSTANTS.GROUP_TITLES] || groupName;
  }

  static convertToHex(color: string): string {
    if (!color || color === 'none' || color === 'transparent') {
      return PROPERTY_CONSTANTS.DEFAULTS.FILL_COLOR;
    }

    if (color.startsWith('#')) {
      return color;
    }

    if (color.startsWith('rgb(')) {
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }

    if (color.startsWith('rgba(')) {
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1], 10);
        const g = parseInt(rgbaMatch[2], 10);
        const b = parseInt(rgbaMatch[3], 10);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }

    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.color = color;
      document.body.appendChild(tempDiv);
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);

      if (computedColor && computedColor.startsWith('rgb(')) {
        return this.convertToHex(computedColor);
      }
    } catch (e) {
    }

    return PROPERTY_CONSTANTS.DEFAULTS.FILL_COLOR;
  }

  static parseTransformString(transformStr: string): TransformValues {
    const result: TransformValues = { scaleX: 1, scaleY: 1, rotate: 0 };

    if (!transformStr) return result;

    const scaleMatch = transformStr.match(/scale\(([^,)]+)(?:,\s*([^)]+))?\)/);
    if (scaleMatch) {
      result.scaleX = parseFloat(scaleMatch[1]) || 1;
      result.scaleY = parseFloat(scaleMatch[2]) || result.scaleX;
    }

    const scaleXMatch = transformStr.match(/scaleX\(([^)]+)\)/);
    if (scaleXMatch) {
      result.scaleX = parseFloat(scaleXMatch[1]) || 1;
    }

    const scaleYMatch = transformStr.match(/scaleY\(([^)]+)\)/);
    if (scaleYMatch) {
      result.scaleY = parseFloat(scaleYMatch[1]) || 1;
    }

    const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
      result.rotate = parseFloat(rotateMatch[1]) || 0;
    }

    return result;
  }

  static buildTransformString(transform: TransformValues): string {
    const transformParts: string[] = [];

    if (transform.scaleX !== 1 || transform.scaleY !== 1) {
      if (transform.scaleX === transform.scaleY) {
        transformParts.push(`scale(${transform.scaleX})`);
      } else {
        transformParts.push(`scale(${transform.scaleX}, ${transform.scaleY})`);
      }
    }

    if (transform.rotate !== 0) {
      transformParts.push(`rotate(${transform.rotate})`);
    }

    return transformParts.join(' ');
  }
}

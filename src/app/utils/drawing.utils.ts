import { SvgElement, SvgElementType } from '../models/svg-element.model';
import { CANVAS_CONSTANTS } from '../constants';
import { DrawingElement } from '../models/component.models';

export class DrawingUtils {
  static createTextLabel(x: number, y: number): SvgElement {
    return {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: SvgElementType.TEXT,
      attributes: {
        x: x,
        y: y,
        fill: CANVAS_CONSTANTS.DEFAULT_TEXT_FILL,
        'font-size': CANVAS_CONSTANTS.DEFAULT_FONT_SIZE,
        'font-family': CANVAS_CONSTANTS.DEFAULT_FONT_FAMILY,
        'text-anchor': CANVAS_CONSTANTS.DEFAULT_TEXT_ANCHOR,
        textContent: 'New Label'
      },
      layerId: 'default',
      visible: true,
      locked: false,
      selected: false
    };
  }

  static createImageLabel(x: number, y: number): SvgElement {
    return {
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: SvgElementType.IMAGE,
      attributes: {
        x: x,
        y: y,
        width: 50,
        height: 50,
        href: ''
      },
      layerId: 'default',
      visible: true,
      locked: false,
      selected: false
    };
  }

  static createUploadedImage(x: number, y: number, imageUrl: string): SvgElement {
    return {
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: SvgElementType.IMAGE,
      attributes: {
        x: x,
        y: y,
        width: 50,
        height: 50,
        href: imageUrl
      },
      layerId: 'default',
      visible: true,
      locked: false,
      selected: false
    };
  }
}

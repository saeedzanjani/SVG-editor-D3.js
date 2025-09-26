import * as d3 from 'd3';
import { SvgElement, SvgElementType } from '../models/svg-element.model';

export class ElementUtils {

  static getElementCenter(element: SvgElement, domElement?: Element): { x: number; y: number } | null {
    if (domElement) {
      try {
        const bbox = (domElement as SVGGraphicsElement).getBBox();
        if (bbox) {
          return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
          };
        }
      } catch (e) {
      }
    }

    const attrs = element.attributes;
    const tagName = element.type;

    switch (tagName) {
      case SvgElementType.CIRCLE:
        return {
          x: parseFloat(attrs['cx'] || '0'),
          y: parseFloat(attrs['cy'] || '0')
        };
      case SvgElementType.ELLIPSE:
        return {
          x: parseFloat(attrs['cx'] || '0'),
          y: parseFloat(attrs['cy'] || '0')
        };
      case SvgElementType.RECT:
        return {
          x: parseFloat(attrs['x'] || '0') + parseFloat(attrs['width'] || '0') / 2,
          y: parseFloat(attrs['y'] || '0') + parseFloat(attrs['height'] || '0') / 2
        };
      case SvgElementType.TEXT:
        return {
          x: parseFloat(attrs['x'] || '0'),
          y: parseFloat(attrs['y'] || '0')
        };
      case SvgElementType.IMAGE:
        return {
          x: parseFloat(attrs['x'] || '0') + parseFloat(attrs['width'] || '0') / 2,
          y: parseFloat(attrs['y'] || '0') + parseFloat(attrs['height'] || '0') / 2
        };
      case SvgElementType.LINE:
        return {
          x: (parseFloat(attrs['x1'] || '0') + parseFloat(attrs['x2'] || '0')) / 2,
          y: (parseFloat(attrs['y1'] || '0') + parseFloat(attrs['y2'] || '0')) / 2
        };
      default:
        return null;
    }
  }

  static getElementTypeLabel(element: SvgElement): string {
    if (!element || !element.type) {
      return 'Unknown';
    }

    switch (element.type) {
      case SvgElementType.RECT:
        return 'Rectangle';
      case SvgElementType.CIRCLE:
        return 'Circle';
      case SvgElementType.ELLIPSE:
        return 'Ellipse';
      case SvgElementType.LINE:
        return 'Line';
      case SvgElementType.POLYLINE:
        return 'Polyline';
      case SvgElementType.POLYGON:
        return 'Polygon';
      case SvgElementType.PATH:
        return 'Path';
      case SvgElementType.TEXT:
        return 'Text';
      case SvgElementType.IMAGE:
        return 'Image';
      case SvgElementType.GROUP:
        return 'Group';
      default:
        return element.type.charAt(0).toUpperCase() + element.type.slice(1);
    }
  }

  static getElementSummary(element: SvgElement): string {
    if (!element || !element.type) {
      return 'No details available';
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
        return attrs['textContent'] || 'No text';
      case SvgElementType.IMAGE:
        return `${attrs['width'] || 0} × ${attrs['height'] || 0}`;
      case SvgElementType.LINE:
        return `${attrs['x1'] || 0},${attrs['y1'] || 0} → ${attrs['x2'] || 0},${attrs['y2'] || 0}`;
      default:
        return 'Element details';
    }
  }

  static isElementVisible(element: SvgElement): boolean {
    return element.visible && element.attributes['display'] !== 'none' && element.attributes['visibility'] !== 'hidden';
  }

  static getElementBounds(element: SvgElement): { x: number; y: number; width: number; height: number } | null {
    const attrs = element.attributes;

    switch (element.type) {
      case SvgElementType.RECT:
        return {
          x: parseFloat(attrs['x'] || '0'),
          y: parseFloat(attrs['y'] || '0'),
          width: parseFloat(attrs['width'] || '0'),
          height: parseFloat(attrs['height'] || '0')
        };
      case SvgElementType.CIRCLE:
        const cx = parseFloat(attrs['cx'] || '0');
        const cy = parseFloat(attrs['cy'] || '0');
        const r = parseFloat(attrs['r'] || '0');
        return {
          x: cx - r,
          y: cy - r,
          width: r * 2,
          height: r * 2
        };
      case SvgElementType.ELLIPSE:
        const ecx = parseFloat(attrs['cx'] || '0');
        const ecy = parseFloat(attrs['cy'] || '0');
        const rx = parseFloat(attrs['rx'] || '0');
        const ry = parseFloat(attrs['ry'] || '0');
        return {
          x: ecx - rx,
          y: ecy - ry,
          width: rx * 2,
          height: ry * 2
        };
      case SvgElementType.TEXT:
        const fontSize = parseFloat(attrs['font-size'] || '18');
        const textContent = attrs['textContent'] || '';
        const estimatedWidth = textContent.length * fontSize * 0.6;
        return {
          x: parseFloat(attrs['x'] || '0'),
          y: parseFloat(attrs['y'] || '0') - fontSize,
          width: estimatedWidth,
          height: fontSize
        };
      default:
        return null;
    }
  }

  static getElementProperties(svg: d3.Selection<any, any, any, any>, elementId: string): Record<string, any> {
    const element = svg.select(`#${elementId}`);
    if (element.empty()) return {};

    const properties: Record<string, any> = {};
    const node = element.node();

    if (node && node instanceof Element) {
      properties['tagName'] = node.tagName.toLowerCase();

      Array.from(node.attributes).forEach(attr => {
        properties[attr.name] = attr.value;
      });

      const computedStyle = window.getComputedStyle(node);
      properties['fill'] = computedStyle.fill || element.attr('fill') || 'none';
      properties['stroke'] = computedStyle.stroke || element.attr('stroke') || 'none';
      properties['stroke-width'] = computedStyle.strokeWidth || element.attr('stroke-width') || '1';
      properties['opacity'] = computedStyle.opacity || element.attr('opacity') || '1';
    }

    return properties;
  }

  static getElementCenterFromDOM(svg: d3.Selection<any, any, any, any>, elementId: string): { x: number; y: number } | null {
    const element = svg.select(`#${elementId}`);
    if (element.empty()) return null;

    const node = element.node();
    if (!node) return null;

    try {
      const bbox = (node as SVGGraphicsElement).getBBox();
      if (bbox) {
        return {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2
        };
      }
    } catch (e) {
    }

    const tagName = (node as Element).tagName.toLowerCase();
    const attrs = this.getElementProperties(svg, elementId);

    switch (tagName) {
      case 'circle':
        return {
          x: parseFloat(attrs['cx'] || '0'),
          y: parseFloat(attrs['cy'] || '0')
        };
      case 'ellipse':
        return {
          x: parseFloat(attrs['cx'] || '0'),
          y: parseFloat(attrs['cy'] || '0')
        };
      case 'rect':
        return {
          x: parseFloat(attrs['x'] || '0') + parseFloat(attrs['width'] || '0') / 2,
          y: parseFloat(attrs['y'] || '0') + parseFloat(attrs['height'] || '0') / 2
        };
      case 'text':
        return {
          x: parseFloat(attrs['x'] || '0'),
          y: parseFloat(attrs['y'] || '0')
        };
      case 'image':
        return {
          x: parseFloat(attrs['x'] || '0') + parseFloat(attrs['width'] || '0') / 2,
          y: parseFloat(attrs['y'] || '0') + parseFloat(attrs['height'] || '0') / 2
        };
      case 'line':
        return {
          x: (parseFloat(attrs['x1'] || '0') + parseFloat(attrs['x2'] || '0')) / 2,
          y: (parseFloat(attrs['y1'] || '0') + parseFloat(attrs['y2'] || '0')) / 2
        };
      case 'path':
        try {
          const bbox = (node as SVGGraphicsElement).getBBox();
          if (bbox) {
            return {
              x: bbox.x + bbox.width / 2,
              y: bbox.y + bbox.height / 2
            };
          }
        } catch (e) {
        }
        return null;
      default:
        return null;
    }
  }

  static renderElementToCanvas(
    svg: d3.Selection<any, any, any, any>,
    element: SvgElement,
    onElementClick: (event: MouseEvent) => void,
    onElementMouseDown: (event: MouseEvent, d3Element: d3.Selection<any, any, any, any>) => void
  ): void {
    const zoomGroup = svg.select('.zoom-group');
    if (zoomGroup.empty()) return;

    let d3Element: d3.Selection<any, any, any, any>;

    switch (element.type) {
      case 'text':
        d3Element = zoomGroup.append('text')
          .attr('id', element.id)
          .attr('x', element.attributes['x'] || 0)
          .attr('y', element.attributes['y'] || 0)
          .attr('fill', element.attributes['fill'] || '#000000')
          .attr('font-size', element.attributes['font-size'] || '18')
          .attr('font-family', element.attributes['font-family'] || 'Arial, sans-serif')
          .attr('font-weight', element.attributes['font-weight'] || 'normal')
          .attr('text-anchor', element.attributes['text-anchor'] || 'start')
          .attr('stroke', element.attributes['stroke'] || 'none')
          .attr('stroke-width', element.attributes['stroke-width'] || '0')
          .text(element.attributes['textContent'] || '');
        break;

      case 'rect':
        d3Element = zoomGroup.append('rect')
          .attr('id', element.id)
          .attr('x', element.attributes['x'] || 0)
          .attr('y', element.attributes['y'] || 0)
          .attr('width', element.attributes['width'] || 100)
          .attr('height', element.attributes['height'] || 100)
          .attr('fill', element.attributes['fill'] || 'none')
          .attr('stroke', element.attributes['stroke'] || 'none')
          .attr('stroke-width', element.attributes['stroke-width'] || '1');
        break;

      case 'circle':
        d3Element = zoomGroup.append('circle')
          .attr('id', element.id)
          .attr('cx', element.attributes['cx'] || 0)
          .attr('cy', element.attributes['cy'] || 0)
          .attr('r', element.attributes['r'] || 50)
          .attr('fill', element.attributes['fill'] || 'none')
          .attr('stroke', element.attributes['stroke'] || 'none')
          .attr('stroke-width', element.attributes['stroke-width'] || '1');
        break;

      case 'ellipse':
        d3Element = zoomGroup.append('ellipse')
          .attr('id', element.id)
          .attr('cx', element.attributes['cx'] || 0)
          .attr('cy', element.attributes['cy'] || 0)
          .attr('rx', element.attributes['rx'] || 50)
          .attr('ry', element.attributes['ry'] || 30)
          .attr('fill', element.attributes['fill'] || 'none')
          .attr('stroke', element.attributes['stroke'] || 'none')
          .attr('stroke-width', element.attributes['stroke-width'] || '1');
        break;

      case 'line':
        d3Element = zoomGroup.append('line')
          .attr('id', element.id)
          .attr('x1', element.attributes['x1'] || 0)
          .attr('y1', element.attributes['y1'] || 0)
          .attr('x2', element.attributes['x2'] || 100)
          .attr('y2', element.attributes['y2'] || 100)
          .attr('stroke', element.attributes['stroke'] || '#000000')
          .attr('stroke-width', element.attributes['stroke-width'] || '1');
        break;

      case 'image':
        d3Element = zoomGroup.append('image')
          .attr('id', element.id)
          .attr('x', element.attributes['x'] || 0)
          .attr('y', element.attributes['y'] || 0)
          .attr('width', element.attributes['width'] || 50)
          .attr('height', element.attributes['height'] || 50)
          .attr('href', element.attributes['href'] || '');
        break;

      default:
        return;
    }

    if (element.attributes['opacity']) {
      d3Element.attr('opacity', element.attributes['opacity']);
    }
    if (element.attributes['transform']) {
      d3Element.attr('transform', element.attributes['transform']);
    }
    if (element.attributes['visibility']) {
      d3Element.attr('visibility', element.attributes['visibility']);
    }

    d3Element
      .style('cursor', 'pointer')
      .on('mousedown', (event) => {
        event.stopPropagation();
        onElementMouseDown(event, d3Element);
      });
  }

  static updateElementProperties(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    elementId: string,
    properties: Record<string, any>
  ): void {
    const element = svg.select(`#${elementId}`);
    if (element.empty()) return;

    Object.keys(properties).forEach(key => {
      if (properties[key] !== null && properties[key] !== undefined) {
        if (key === 'textContent') {
          element.text(properties[key]);
        } else {
          element.attr(key, properties[key]);
        }
      }
    });
  }

  /**
   * Find the nearest non-text element to a given text element
   */
  static findNearestElementToText(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    textElementId: string
  ): { x: number; y: number } | null {
    const textElement = svg.select(`#${textElementId}`);
    if (textElement.empty()) return null;

    const textNode = textElement.node();
    if (!textNode) return null;

    const textX = parseFloat(textElement.attr('x') || '0');
    const textY = parseFloat(textElement.attr('y') || '0');

    let nearestElement: { id: string; distance: number; center: { x: number; y: number } } | null = null;

    const allElements = svg.selectAll('*').filter(function() {
      const node = d3.select(this).node();
      return !!(node && node instanceof Element && node.tagName && node.tagName.toLowerCase() !== 'text' && node.id !== textElementId);
    });

    allElements.each(function() {
      const element = d3.select(this);
      const elementId = element.attr('id');
      if (!elementId) return;

      const center = ElementUtils.getElementCenterFromDOM(svg, elementId);
      if (center) {
        const distance = Math.sqrt(
          Math.pow(center.x - textX, 2) + Math.pow(center.y - textY, 2)
        );

        if (!nearestElement || distance < nearestElement.distance) {
          nearestElement = {
            id: elementId,
            distance: distance,
            center: center
          };
        }
      }
    });

    if (nearestElement) {
      return (nearestElement as { id: string; distance: number; center: { x: number; y: number } }).center;
    }
    return null;
  }

  static createSvgElementFromDom(domElement: Element, elementId: string): SvgElement | null {
    const tagName = domElement.tagName.toLowerCase();

    let elementType: SvgElementType;
    switch (tagName) {
      case 'rect':
        elementType = SvgElementType.RECT;
        break;
      case 'circle':
        elementType = SvgElementType.CIRCLE;
        break;
      case 'ellipse':
        elementType = SvgElementType.ELLIPSE;
        break;
      case 'line':
        elementType = SvgElementType.LINE;
        break;
      case 'text':
        elementType = SvgElementType.TEXT;
        break;
      case 'image':
        elementType = SvgElementType.IMAGE;
        break;
      case 'path':
        elementType = SvgElementType.PATH;
        break;
      case 'polygon':
        elementType = SvgElementType.POLYGON;
        break;
      case 'polyline':
        elementType = SvgElementType.POLYLINE;
        break;
      case 'g':
        elementType = SvgElementType.GROUP;
        break;
      default:
        return null;
    }

    const attributes: Record<string, any> = {};
    for (let i = 0; i < domElement.attributes.length; i++) {
      const attr = domElement.attributes[i];
      attributes[attr.name] = attr.value;
    }

    if (elementType === SvgElementType.TEXT) {
      attributes['textContent'] = domElement.textContent || '';
    }

    const svgElement: SvgElement = {
      id: elementId,
      type: elementType,
      attributes,
      layerId: 'default',
      visible: true,
      locked: false,
      selected: false
    };

    const bounds = this.getElementBounds(svgElement);
    if (bounds) {
      svgElement.bounds = bounds;
    }

    return svgElement;
  }
}

import * as d3 from 'd3';
export class D3Utils {

  static generateId(): string {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static initializeSvg(svgElement: SVGSVGElement, width: number, height: number): d3.ZoomBehavior<SVGSVGElement, any> {
    const svg = d3.select(svgElement);
    svg.attr('width', width).attr('height', height);

    const zoom = d3.zoom<SVGSVGElement, any>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        svg.select('.zoom-group').attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    svg.selectAll('.zoom-group').remove();
    svg.append('g').attr('class', 'zoom-group');

    return zoom;
  }

  static loadSvgContent(svg: d3.Selection<any, any, any, any>, svgContent: string): void {
    const zoomGroup = svg.select('.zoom-group');

    zoomGroup.selectAll('*').remove();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const rootSvg = svgDoc.documentElement;

    if (rootSvg.tagName.toLowerCase() === 'svg') {
      const innerContent = Array.from(rootSvg.children).map(child =>
        new XMLSerializer().serializeToString(child)
      ).join('');

      zoomGroup.html(innerContent);
    } else {
      zoomGroup.html(svgContent);
    }

  }

  static fitSvgToCanvas(svg: d3.Selection<any, any, any, any>): void {
    const zoomGroup = svg.select('.zoom-group');
    const svgNode = svg.node() as SVGSVGElement;

    if (!svgNode || zoomGroup.empty()) {
      return;
    }

    const canvasWidth = svgNode.clientWidth || svgNode.getBoundingClientRect().width || 1200;
    const canvasHeight = svgNode.clientHeight || svgNode.getBoundingClientRect().height || 800;

    const zoomGroupNode = zoomGroup.node() as SVGGraphicsElement;
    if (!zoomGroupNode || !zoomGroupNode.getBBox) {
      return;
    }

    let bbox;
    try {
      bbox = zoomGroupNode.getBBox();
    } catch (error) {
      const firstChild = zoomGroupNode.firstElementChild as SVGGraphicsElement;
      if (firstChild && firstChild.getBBox) {
        bbox = firstChild.getBBox();
      } else {
        return;
      }
    }

    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      return;
    }

    const padding = 20;
    const scaleX = (canvasWidth - padding * 2) / bbox.width;
    const scaleY = (canvasHeight - padding * 2) / bbox.height;
    const scale = Math.min(scaleX, scaleY);

    const minScale = 0.1;
    const finalScale = Math.max(scale, minScale);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const contentCenterX = bbox.x + bbox.width / 2;
    const contentCenterY = bbox.y + bbox.height / 2;

    const transform = d3.zoomIdentity
      .translate(centerX - contentCenterX * finalScale, centerY - contentCenterY * finalScale)
      .scale(finalScale);

    zoomGroup.attr('transform', transform.toString());

    const zoomBehavior = d3.zoom<SVGSVGElement, any>();
    svg.call(zoomBehavior.transform, transform);
  }

  static createDragBehavior(
    onDragStart: (event: d3.D3DragEvent<any, any, any>) => void,
    onDrag: (event: d3.D3DragEvent<any, any, any>) => void,
    onDragEnd: (event: d3.D3DragEvent<any, any, any>) => void
  ): d3.DragBehavior<any, any, any> {
    return d3.drag<any, any, any>()
      .on('start', onDragStart)
      .on('drag', onDrag)
      .on('end', onDragEnd);
  }

  static applyDragBehavior(
    zoomGroup: d3.Selection<any, any, any, any>,
    dragBehavior: d3.DragBehavior<any, any, any>
  ): void {
    zoomGroup.selectAll('rect, circle, ellipse, line, text, image, polyline, polygon, path, g, use, symbol, defs, clipPath, mask, pattern, linearGradient, radialGradient, stop, foreignObject, switch, marker, marker-start, marker-mid, marker-end')
      .style('cursor', 'pointer')
      .call(dragBehavior);
  }

  static applyClickHandlers(
    zoomGroup: d3.Selection<any, any, any, any>,
    onClick: (event: MouseEvent) => void
  ): void {
    const elements = zoomGroup.selectAll('rect, circle, ellipse, line, text, image, polyline, polygon, path, g, use, symbol, foreignObject, switch, marker');

    elements.on('click', onClick);

    const allElements = zoomGroup.selectAll('*').filter(function() {
      const element = this as Element;
      const tagName = element.tagName.toLowerCase();
      return !['defs', 'clipPath', 'mask', 'pattern', 'linearGradient', 'radialGradient', 'stop', 'style', 'script', 'title', 'desc', 'metadata'].includes(tagName);
    });

    allElements.on('click', onClick);
  }

  static updateElementPosition(
    element: d3.Selection<any, any, any, any>,
    dx: number,
    dy: number
  ): boolean {
    const tagName = element.node()?.tagName.toLowerCase();
    let updated = false;

    switch (tagName) {
      case 'rect':
      case 'text':
      case 'image':
        const currentX = parseFloat(element.attr('x') || '0');
        const currentY = parseFloat(element.attr('y') || '0');
        element.attr('x', currentX + dx).attr('y', currentY + dy);
        updated = true;
        break;
      case 'circle':
      case 'ellipse':
        const currentCx = parseFloat(element.attr('cx') || '0');
        const currentCy = parseFloat(element.attr('cy') || '0');
        element.attr('cx', currentCx + dx).attr('cy', currentCy + dy);
        updated = true;
        break;
      case 'line':
        const x1 = parseFloat(element.attr('x1') || '0');
        const y1 = parseFloat(element.attr('y1') || '0');
        const x2 = parseFloat(element.attr('x2') || '0');
        const y2 = parseFloat(element.attr('y2') || '0');
        element.attr('x1', x1 + dx).attr('y1', y1 + dy)
               .attr('x2', x2 + dx).attr('y2', y2 + dy);
        updated = true;
        break;
      case 'polyline':
      case 'polygon':
        const points = element.attr('points') || '';
        if (points) {
          const transformedPoints = points.split(' ').map((point: string) => {
            const [x, y] = point.split(',').map(Number);
            return `${x + dx},${y + dy}`;
          }).join(' ');
          element.attr('points', transformedPoints);
          updated = true;
        }
        break;
      case 'path':
      case 'g':
        const currentTransform = element.attr('transform') || '';
        const newTransform = currentTransform ?
          `${currentTransform} translate(${dx},${dy})` :
          `translate(${dx},${dy})`;
        element.attr('transform', newTransform);
        updated = true;
        break;
    }

    return updated;
  }

  static setZoom(
    svg: d3.Selection<any, any, any, any>,
    zoomBehavior: d3.ZoomBehavior<SVGSVGElement, any>,
    zoom: number
  ): void {
    svg.transition().duration(300).call(
      zoomBehavior.transform,
      d3.zoomIdentity.scale(zoom)
    );
  }

  static getZoom(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): number {
    const transform = d3.zoomTransform(svg.node()!);
    return transform.k;
  }

  static exportSvg(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): string {
    const svgNode = svg.node();
    if (!svgNode) return '';
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgNode);
  }

  static clearSvg(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    svg.selectAll('*').remove();
  }
}

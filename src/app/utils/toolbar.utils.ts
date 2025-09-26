import { SvgElement } from '../models/svg-element.model';
import { SaveResult, ToolConfig, StatusItem } from '../models/component.models';

export class ToolbarUtils {
  static hasSvgContent(elements: SvgElement[]): boolean {
    if (elements.length > 0) {
      return true;
    }

    const svgElement = document.querySelector('svg.svg-canvas');
    if (svgElement) {
      const children = svgElement.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const tagName = child.tagName.toLowerCase();

        if (tagName === 'defs' ||
            tagName === 'pattern' ||
            child.classList.contains('grid-background') ||
            child.classList.contains('selection-handles') ||
            child.classList.contains('element-handles') ||
            child.classList.contains('temp') ||
            child.classList.contains('preview') ||
            child.classList.contains('selection-rectangle')) {
          continue;
        }

        return true;
      }
    }

    const allSvgElements = document.querySelectorAll('svg *');
    if (allSvgElements.length > 0) {
      return true;
    }

    return false;
  }

  static getActiveToolName(activeTool: string, tools: ToolConfig[]): string {
    const tool = tools.find(t => t.id === activeTool);
    return tool ? tool.name : 'Unknown';
  }

  static createMutationObserver(callback: () => void): MutationObserver | null {
    const svgElement = document.querySelector('svg.svg-canvas');
    if (!svgElement) return null;

    const observer = new MutationObserver(callback);
    observer.observe(svgElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['transform', 'style', 'class', 'x', 'y', 'width', 'height', 'fill', 'stroke']
    });

    return observer;
  }

  static findSimilarSvg(svgContent: string, storedSvgs: any[]): any {
    return null;
  }

  static refreshFilePanelTemplates(): void {
    const event = new CustomEvent('svg:saved', { detail: {} });
    window.dispatchEvent(event);
  }

  static createSaveResult(success: boolean, message: string): SaveResult {
    return { success, message };
  }

  static getStatusItems(activeToolName: string, selectedCount: number, isPreviewMode: boolean): StatusItem[] {
    const items: StatusItem[] = [
      { label: 'Tool:', value: activeToolName }
    ];

    if (selectedCount > 0) {
      items.push({ label: 'Selected:', value: `${selectedCount} element(s)` });
    }

    if (isPreviewMode) {
      items.push({ label: '', value: 'Preview Mode', type: 'preview' });
    }

    return items;
  }
}

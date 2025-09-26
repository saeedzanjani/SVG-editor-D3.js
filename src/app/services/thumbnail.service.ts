import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailService {
  generateThumbnailFromSvg(svgContent: string, width: number = 100, height: number = 100): string {
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      svgElement.setAttribute('width', width.toString());
      svgElement.setAttribute('height', height.toString());
      if (!svgElement.getAttribute('viewBox')) {
        const originalWidth = svgElement.getAttribute('width') || '100';
        const originalHeight = svgElement.getAttribute('height') || '100';
        svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
      }

      return new XMLSerializer().serializeToString(svgElement);
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return '';
    }
  }

  generateThumbnailFromFile(file: File, width: number = 100, height: number = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const svgContent = e.target?.result as string;
          if (!svgContent) {
            reject(new Error('Failed to read file content'));
            return;
          }

          const thumbnail = this.generateThumbnailFromSvg(svgContent, width, height);
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  createDataUrl(svgContent: string): string {
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
}

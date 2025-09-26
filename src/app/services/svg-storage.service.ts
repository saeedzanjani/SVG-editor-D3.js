import { Injectable, signal } from '@angular/core';
import { SvgEditorService } from './svg-editor.service';
import { StoredSvgData } from '../models/component.models';

@Injectable({
  providedIn: 'root'
})
export class SvgStorageService {
  private readonly STORAGE_KEY = 'svg-editor-data';
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

  private readonly _hasStoredData = signal(false);
  private readonly _storedSvgs = signal<StoredSvgData[]>([]);

  readonly hasStoredData = this._hasStoredData.asReadonly();
  readonly storedSvgs = this._storedSvgs.asReadonly();

  constructor() {
    this.loadStoredData();
  }

  saveSvg(svgContent: string, name: string = 'Untitled SVG'): boolean {
    try {
      const svgData: StoredSvgData = {
        id: this.generateId(),
        name: name,
        svgContent: svgContent,
        timestamp: Date.now(),
        thumbnail: this.generateThumbnail(svgContent)
      };

      if (!this.checkStorageSize(svgData)) {
        return false;
      }

      const existingData = this.getStoredData();
      existingData.push(svgData);

      if (existingData.length > 10) {
        existingData.sort((a, b) => b.timestamp - a.timestamp);
        existingData.splice(10);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
      this.loadStoredData();
      return true;
    } catch (error) {
      return false;
    }
  }

  loadSvg(id: string): StoredSvgData | null {
    const storedData = this.getStoredData();
    return storedData.find(svg => svg.id === id) || null;
  }

  updateSvg(id: string, svgContent: string, name?: string): boolean {
    try {
      const storedData = this.getStoredData();
      const svgIndex = storedData.findIndex(svg => svg.id === id);

      if (svgIndex === -1) {
        return false; // SVG not found
      }

      storedData[svgIndex] = {
        ...storedData[svgIndex],
        svgContent: svgContent,
        name: name || storedData[svgIndex].name,
        timestamp: Date.now(),
        thumbnail: this.generateThumbnail(svgContent)
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedData));
      this.loadStoredData();
      return true;
    } catch (error) {
      return false;
    }
  }

  loadLatestSvg(): StoredSvgData | null {
    const storedData = this.getStoredData();
    if (storedData.length === 0) return null;

    return storedData.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  findSvgByContent(svgContent: string): StoredSvgData | null {
    const storedData = this.getStoredData();

    for (const svg of storedData) {
      if (svg.svgContent === svgContent) {
        return svg;
      }
    }

    return null;
  }

  /**
   * Find SVG by name (for detecting if current SVG name already exists)
   */
  findSvgByName(name: string): StoredSvgData | null {
    const storedData = this.getStoredData();
    return storedData.find(svg => svg.name === name) || null;
  }

  /**
   * Delete SVG from localStorage
   */
  deleteSvg(id: string): boolean {
    try {
      const storedData = this.getStoredData();
      const filteredData = storedData.filter(svg => svg.id !== id);

      if (filteredData.length === storedData.length) {
        return false; // SVG not found
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredData));
      this.loadStoredData();
      return true;
    } catch (error) {
      return false;
    }
  }

  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.loadStoredData();
      return true;
    } catch (error) {
      return false;
    }
  }

  getStorageInfo(): { used: number; limit: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const used = data ? new Blob([data]).size : 0;
      const percentage = (used / this.MAX_STORAGE_SIZE) * 100;

      return {
        used,
        limit: this.MAX_STORAGE_SIZE,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      return { used: 0, limit: this.MAX_STORAGE_SIZE, percentage: 0 };
    }
  }

  /**
   * Export stored SVG data as JSON
   */
  exportStoredData(): string {
    const storedData = this.getStoredData();
    return JSON.stringify(storedData, null, 2);
  }

  /**
   * Import SVG data from JSON
   */
  importStoredData(jsonData: string): boolean {
    try {
      const importedData: StoredSvgData[] = JSON.parse(jsonData);

      if (!Array.isArray(importedData)) {
        throw new Error('Invalid data format');
      }

      for (const item of importedData) {
        if (!item.id || !item.name || !item.svgContent || !item.timestamp) {
          throw new Error('Invalid SVG data structure');
        }
      }

      const existingData = this.getStoredData();
      const mergedData = [...existingData, ...importedData];

      const uniqueData = mergedData.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueData));
      this.loadStoredData();
      return true;
    } catch (error) {
      return false;
    }
  }

  private getStoredData(): StoredSvgData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  private loadStoredData(): void {
    const storedData = this.getStoredData();
    this._storedSvgs.set(storedData);
    this._hasStoredData.set(storedData.length > 0);
  }

  private generateId(): string {
    return `svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThumbnail(svgContent: string): string {
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      svgElement.setAttribute('width', '100');
      svgElement.setAttribute('height', '100');

      return new XMLSerializer().serializeToString(svgElement);
    } catch (error) {
      return '';
    }
  }

  private checkStorageSize(newData: StoredSvgData): boolean {
    const currentData = this.getStoredData();
    const testData = [...currentData, newData];
    const testSize = new Blob([JSON.stringify(testData)]).size;

    return testSize <= this.MAX_STORAGE_SIZE;
  }
}

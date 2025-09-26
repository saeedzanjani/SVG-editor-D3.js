import { Injectable } from '@angular/core';
import { SvgEditorService } from './svg-editor.service';
import { FileUtils } from '../utils/file.utils';
import { SvgTemplate } from '../constants';
import { FileUploadResult } from '../models/component.models';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private svgEditorService: SvgEditorService) {}

  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      const validation = FileUtils.validateSvgFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid file'
        };
      }

      await FileUtils.handleFileUpload(file, this.svgEditorService);
      const template: SvgTemplate = {
        id: `uploaded-${Date.now()}`,
        name: file.name.replace('.svg', ''),
        description: `Uploaded SVG file: ${file.name}`,
        thumbnail: URL.createObjectURL(file),
        filePath: URL.createObjectURL(file),
        category: 'uploaded'
      };

      return {
        success: true,
        template
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    return FileUtils.validateSvgFile(file);
  }
}

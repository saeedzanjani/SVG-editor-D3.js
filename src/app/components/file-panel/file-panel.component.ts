import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgEditorService } from '../../services/svg-editor.service';
import { SvgStorageService } from '../../services/svg-storage.service';
import { CurrentSvgService } from '../../services/current-svg.service';
import { FileUploadService } from '../../services/file-upload.service';
import { ThumbnailService } from '../../services/thumbnail.service';
import { FILE_PANEL_CONSTANTS, SvgTemplate } from '../../constants';
import { FileUtils } from '../../utils';
import {
  SearchInputComponent,
  UploadAreaComponent,
  CategoryFilterComponent,
  TemplateGridComponent
} from '../shared';
import { FileUploadEvent, CategoryOption } from '../../models/component.models';

@Component({
  selector: 'app-file-panel',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    UploadAreaComponent,
    CategoryFilterComponent,
    TemplateGridComponent
  ],
  templateUrl: './file-panel.component.html',
  styleUrls: ['./file-panel.component.scss']
})
export class FilePanelComponent implements OnInit, OnDestroy {
  private svgEditorService = inject(SvgEditorService);
  private svgStorageService = inject(SvgStorageService);
  private currentSvgService = inject(CurrentSvgService);
  private fileUploadService = inject(FileUploadService);
  private thumbnailService = inject(ThumbnailService);

  private readonly _searchQuery = signal('');
  private readonly _selectedCategory = signal<'all' | 'uploaded'>(FILE_PANEL_CONSTANTS.DEFAULT_CATEGORY);
  private readonly _selectedTemplate = signal<string | null>(null);
  private readonly _uploadedTemplates = signal<SvgTemplate[]>([]);

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly selectedTemplate = this._selectedTemplate.asReadonly();
  readonly uploadedTemplates = this._uploadedTemplates.asReadonly();

  readonly templates = FILE_PANEL_CONSTANTS.TEMPLATES;
  readonly categories: CategoryOption[] = FILE_PANEL_CONSTANTS.CATEGORIES;

  readonly filteredTemplates = computed(() => {
    return FileUtils.filterTemplates(
      this.uploadedTemplates(),
      this.selectedCategory(),
      this.searchQuery()
    );
  });

  private svgSavedListener?: () => void;

  ngOnInit(): void {
    this.loadSavedSvgsAsTemplates();

    this.svgSavedListener = () => {
      this.loadSavedSvgsAsTemplates();
    };
    window.addEventListener('svg:saved', this.svgSavedListener);
  }

  ngOnDestroy(): void {
    if (this.svgSavedListener) {
      window.removeEventListener('svg:saved', this.svgSavedListener);
    }
  }

  private loadSavedSvgsAsTemplates(): void {
    try {
      const storedSvgs = this.svgStorageService.storedSvgs();
      if (storedSvgs.length > 0) {
        const savedTemplates: SvgTemplate[] = storedSvgs.map(storedSvg => ({
          id: storedSvg.id,
          name: storedSvg.name,
          description: `Saved SVG: ${storedSvg.name}`,
          thumbnail: storedSvg.thumbnail || this.generateThumbnailFromSvg(storedSvg.svgContent),
          filePath: storedSvg.svgContent,
          category: 'uploaded'
        }));

        this._uploadedTemplates.set(savedTemplates);
      }
    } catch (error) {
      console.error('Error loading saved SVGs as templates:', error);
    }
  }

  private generateThumbnailFromSvg(svgContent: string): string {
    return this.thumbnailService.generateThumbnailFromSvg(svgContent);
  }

  onSearchChange(searchValue: string): void {
    this._searchQuery.set(searchValue);
  }

  onCategoryChange(category: string): void {
    this._selectedCategory.set(category as 'all' | 'uploaded');
  }

  onTemplateSelect(template: SvgTemplate): void {
    this._selectedTemplate.set(template.id);
    this.loadTemplate(template);

    this.currentSvgService.setCurrentSvgId(template.id);
  }

  onTemplateDelete(template: SvgTemplate): void {
    if (template.category !== 'uploaded') {
      return;
    }

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      const success = this.svgStorageService.deleteSvg(template.id);

      if (success) {
        this._uploadedTemplates.update(templates =>
          templates.filter(t => t.id !== template.id)
        );

        if (this.selectedTemplate() === template.id) {
          this._selectedTemplate.set(null);
          this.currentSvgService.clearCurrentSvgId();
        }
      } else {
        alert('Failed to delete template. Please try again.');
      }
    }
  }

  private async loadTemplate(template: SvgTemplate): Promise<void> {
    try {
      await FileUtils.loadTemplate(template, this.svgEditorService);
    } catch (error) {
      FileUtils.showError(error instanceof Error ? error.message : 'Failed to load template');
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.onFileUpload({ file });
      target.value = '';
    }
  }

  onFileUpload(event: FileUploadEvent): void {
    this.fileUploadService.uploadFile(event.file)
      .then((result) => {
        if (result.success && result.template) {
          this._uploadedTemplates.update(templates => [...templates, result.template!]);
          this._selectedTemplate.set(result.template.id);
          this.currentSvgService.clearCurrentSvgId();
        } else {
          FileUtils.showError(result.error || 'Failed to upload file');
        }
      })
      .catch((error) => {
        console.error(error);
        FileUtils.showError(error instanceof Error ? error.message : 'Failed to upload file');
      });
  }

  isTemplateSelected(templateId: string): boolean {
    return this.selectedTemplate() === templateId;
  }
}

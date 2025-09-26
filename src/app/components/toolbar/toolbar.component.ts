import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SvgEditorService } from '../../services/svg-editor.service';
import { PreviewModeService } from '../../services/preview-mode.service';
import { SvgStorageService } from '../../services/svg-storage.service';
import { CurrentSvgService } from '../../services/current-svg.service';
import { EditorTool } from '../../models/svg-element.model';
import { ToolConfig, StatusItem } from '../../models/component.models';
import { TOOLBAR_CONSTANTS } from '../../constants/toolbar.constants';
import { FileUtils, D3Utils, ToolbarUtils } from '../../utils';
import { ToolButtonComponent, SaveControlsComponent, PreviewControlsComponent, StatusBarComponent } from '../shared';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, ToolButtonComponent, SaveControlsComponent, PreviewControlsComponent, StatusBarComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  private svgEditorService = inject(SvgEditorService);
  private previewModeService = inject(PreviewModeService);
  private svgStorageService = inject(SvgStorageService);
  private currentSvgService = inject(CurrentSvgService);

  readonly activeTool = this.svgEditorService.activeTool;
  readonly selectedElementIds = this.svgEditorService.selectedElementIds;
  readonly isPreviewMode = this.previewModeService.isPreviewMode;

  readonly tools = TOOLBAR_CONSTANTS.TOOLS;

  private readonly _svgContentChanged = signal(0);


  readonly hasSvgContent = computed(() => {
    this._svgContentChanged();
    const elements = this.svgEditorService.elements();
    return ToolbarUtils.hasSvgContent(elements);
  });

  readonly statusItems = computed((): StatusItem[] => {
    const activeToolName = this.getActiveToolName();
    const selectedCount = this.selectedElementIds().length;
    const isPreview = this.isPreviewMode();
    return ToolbarUtils.getStatusItems(activeToolName, selectedCount, isPreview);
  });

  constructor() {
    effect(() => {
      const observer = ToolbarUtils.createMutationObserver(() => {
        this._svgContentChanged.update(val => val + 1);
      });

      return () => observer?.disconnect();
    });
  }


  onDelete(): void {
    const selectedIds = this.selectedElementIds();
    if (selectedIds.length > 0) {
      if (FileUtils.confirm(`Are you sure you want to delete ${selectedIds.length} element(s)?`)) {
        selectedIds.forEach(id => {
          this.svgEditorService.removeElement(id);
        });
      }
    }
  }

  onSaveSvg(): void {
    try {
      const svgContent = this.svgEditorService.exportSvg();
      if (!svgContent) {
        alert('No SVG content to save');
        return;
      }

      const currentSvgId = this.currentSvgService.currentSvgId();
      let success = false;
      let message = '';

      if (currentSvgId) {
        const existingSvg = this.svgStorageService.loadSvg(currentSvgId);
        if (existingSvg) {
          success = this.svgStorageService.updateSvg(currentSvgId, svgContent, existingSvg.name);
          message = success ? `"${existingSvg.name}" updated successfully!` : 'Failed to update SVG.';
        } else {
        }
      } else {
        const existingSvg = this.findSimilarSvg(svgContent);
        if (existingSvg) {
          success = this.svgStorageService.updateSvg(existingSvg.id, svgContent, existingSvg.name);
          this.currentSvgService.setCurrentSvgId(existingSvg.id);
          message = success ? `"${existingSvg.name}" updated successfully!` : 'Failed to update SVG.';
        } else {
          const name = prompt('Enter a name for your new SVG:', 'My SVG') || 'Untitled SVG';
          success = this.svgStorageService.saveSvg(svgContent, name);
          if (success) {
            const newSvg = this.svgStorageService.findSvgByName(name);
            if (newSvg) {
              this.currentSvgService.setCurrentSvgId(newSvg.id);
            }
          }
          message = success ? `"${name}" saved successfully!` : 'Failed to save SVG.';
        }
      }

      if (success) {
        this.refreshFilePanelTemplates();
      }

      alert(message);
    } catch (error) {
      alert('Error saving SVG: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private findSimilarSvg(svgContent: string): any {
    const exactMatch = this.svgStorageService.findSvgByContent(svgContent);
    if (exactMatch) {
      return exactMatch;
    }

    const storedSvgs = this.svgStorageService.storedSvgs();
    return ToolbarUtils.findSimilarSvg(svgContent, storedSvgs);
  }

  private refreshFilePanelTemplates(): void {
    ToolbarUtils.refreshFilePanelTemplates();
  }



  selectTool(tool: EditorTool | string): void {
    this.svgEditorService.setActiveTool(tool as EditorTool);
  }

  isToolActive(tool: EditorTool | string): boolean {
    return this.activeTool() === tool;
  }



  onPlayAnimation(): void {
    if (this.isPreviewMode()) {
      const selectedElements = this.svgEditorService.selectedElements();
      if (selectedElements.length === 0) {
        return;
      }

      selectedElements.forEach(element => {
        this.previewModeService.resumeAnimation(element.id);
      });
    }
  }

  onPauseAnimation(): void {
    if (this.isPreviewMode()) {
      const selectedElements = this.svgEditorService.selectedElements();
      if (selectedElements.length === 0) {
        return;
      }

      selectedElements.forEach(element => {
        this.previewModeService.pauseAnimation(element.id);
      });
    }
  }

  onStopAnimation(): void {
    if (this.isPreviewMode()) {
      const selectedElements = this.svgEditorService.selectedElements();
      if (selectedElements.length === 0) {
        return;
      }

      selectedElements.forEach(element => {
        this.previewModeService.stopAnimation(element.id);
      });
    }
  }

  getActiveToolName(): string {
    return ToolbarUtils.getActiveToolName(this.activeTool(), this.tools);
  }


  onToolClick(tool: ToolConfig): void {
    if (tool.id === 'FIT_TO_SCREEN') {
      this.onFitToScreen();
    } else {
      this.selectTool(tool.id);
    }
  }

  onFitToScreen(): void {
    const svgElement = document.querySelector('svg.svg-canvas') as SVGSVGElement;
    if (svgElement) {
      const svg = d3.select(svgElement);
      D3Utils.fitSvgToCanvas(svg);
    }
  }
}

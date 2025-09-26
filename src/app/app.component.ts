import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SvgCanvasComponent } from './components/svg-canvas/svg-canvas.component';
import { PropertyPanelComponent } from './components/property-panel/property-panel.component';
import { FilePanelComponent } from './components/file-panel/file-panel.component';
import { SvgStorageService } from './services/svg-storage.service';
import { SvgEditorService } from './services/svg-editor.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToolbarComponent,
    SvgCanvasComponent,
    PropertyPanelComponent,
    FilePanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'SVG Editor (HMI)';

  private svgStorageService = inject(SvgStorageService);
  private svgEditorService = inject(SvgEditorService);

  ngOnInit(): void {
    console.log('App initialized - saved SVGs will appear in templates list');
  }
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusItem } from '../../../models/component.models';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent {
  statusItems = input.required<StatusItem[]>();
}

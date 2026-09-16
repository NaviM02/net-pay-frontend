import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-material-icon',
  imports: [],
  templateUrl: './material-icon.component.html',
  styleUrl: './material-icon.component.scss'
})
export class MaterialIconComponent {

  @Input () size: number = 24;
}

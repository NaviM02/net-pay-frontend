import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-page-header',
  templateUrl: './list-page-header.component.html',
  styleUrls: ['./list-page-header.component.scss'],
})
export class ListPageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() saveText: string = '';

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}

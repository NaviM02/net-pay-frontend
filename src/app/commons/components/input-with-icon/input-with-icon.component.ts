import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-with-icon',
  imports: [NgClass, FormsModule],
  templateUrl: './input-with-icon.component.html',
  styleUrl: './input-with-icon.component.scss',
})
export class InputWithIconComponent {

  @Input() variant: 'default' | 'dark' = 'default';

  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() inputType: 'text' | 'number' | 'password' = 'text';
  @Input() model: string | undefined;
  @Output() modelChange: EventEmitter<string | undefined> = new EventEmitter();

  onInputChange(username: string) {
    this.modelChange.emit(username);
  }
}

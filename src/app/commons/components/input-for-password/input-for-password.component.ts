import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PasswordService } from '../../../services/other/password.service';

@Component({
  selector: 'app-input-for-password',
  templateUrl: './input-for-password.component.html',
  styleUrls: ['./input-for-password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputForPasswordComponent),
      multi: true,
    },
  ],
  imports: [],
})
export class InputForPasswordComponent implements ControlValueAccessor {
  @Input() variant: 'default' | 'dark' = 'default';

  @Input() placeholder: string = '';
  @Input() icon: string = 'lock';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() validatePassword: boolean = false;
  inputType: 'text' | 'password' = 'password';

  value: string = '';

  constructor(private passwordService: PasswordService) {}

  onChange = (_: any) => {};
  onTouched = () => {};

  // ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {}

  onInputChange(event: any) {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }

  toggleInputType() {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
    this.icon = this.inputType === 'password' ? 'lock' : 'lock_open';
  }

  get passwordError(): string | null {
    if (!this.validatePassword || !this.value) return null;
    if (!this.passwordService.isValid(this.value)) return 'txt_password_invalid';
    return null;
  }
}

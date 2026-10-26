import { Injectable } from '@angular/core';

class Toast {
  readonly icon!: string
  readonly header!: string;
  readonly className!: string;
  readonly message!: string;
  readonly delay!: number;

  private constructor(icon: string, header: string, className: string, message: string, delay: number = 5000) {
    this.icon = icon;
    this.header = header;
    this.className = className;
    this.message = message;
    this.delay = delay;
  }

  public static Success(message: string, delay: number = 5000) {
    return new Toast('check_circle', 'Éxito', 'toast success-toast', message, delay);
  }

  public static Error(message: string, delay: number = 5000) {
    return new Toast('error', 'Error', 'toast error-toast', message, delay);
  }

  public static Info(message: string, delay: number = 5000) {
    return new Toast('info', 'Información', 'toast info-toast', message, delay);
  }

  public static Warning(message: string, delay: number = 5000) {
    return new Toast('warning', 'Advertencia', 'toast warning-toast', message, delay);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private _toasts: Toast[] = [];

  constructor() {
  }

  success(message: string, delay: number = 5000) {
    this._toasts.push(Toast.Success(message, delay));
  }

  error(message: string, delay: number = 5000) {
    this._toasts.push(Toast.Error(message, delay));
  }

  info(message: string, delay: number = 5000) {
    this._toasts.push(Toast.Info(message, delay));
  }

  warning(message: string, delay: number = 5000) {
    this._toasts.push(Toast.Warning(message, delay));
  }

  get toasts(): Toast[] {
    return this._toasts;
  }
}

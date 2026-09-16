import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingUiService {

  loading = signal(false);

  constructor() {
  }

  showLoadingIndicator() {
    this.loading.set(true);
  }

  hideLoadingIndicator() {
    this.loading.set(false);
  }
}

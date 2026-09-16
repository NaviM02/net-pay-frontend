import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './commons/components/loading-indicator/loading-indicator.component';
import { ToastComponent } from './commons/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
}

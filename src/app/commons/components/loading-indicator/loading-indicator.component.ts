import { Component } from '@angular/core';
import { LoadingUiService } from '../../../services/other/loading-ui.service';

@Component({
  selector: 'app-loading-indicator',
  imports: [],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss'
})
export class LoadingIndicatorComponent {

  constructor(public loadingService: LoadingUiService) {
  }
}

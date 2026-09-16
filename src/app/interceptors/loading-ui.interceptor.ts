import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingUiService } from '../services/other/loading-ui.service';
import { inject } from '@angular/core';
import { SKIP_GLOBAL_LOADING } from './loading-ui-context';

let countRequest = 0;

export const loadingUiInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingUiService);
  const skipGlobalLoading = req.context.get(SKIP_GLOBAL_LOADING);

  if (!skipGlobalLoading) {
    countRequest++;
    loadingService.showLoadingIndicator();
  }

  return next(req)
    .pipe(
      finalize(() => {
        if (!skipGlobalLoading) {
          countRequest--;
          if (!countRequest) {
            loadingService.hideLoadingIndicator();
          }
        }
      })
    );
};

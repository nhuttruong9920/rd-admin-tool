import { Injectable, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService, NavigationService } from '@core/services';

export const ReturnGuard: CanActivateFn = () => inject(ReturnFn).canActivate();

@Injectable({
  providedIn: 'root',
})
class ReturnFn {
  #authService = inject(AuthService);
  #navigationService = inject(NavigationService);

  canActivate(): boolean {
    if (this.#authService.isLoggedIn()) {
      this.#navigationService.toHome();
      return false;
    }

    return true;
  }
}

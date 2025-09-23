import { Injectable, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService, NavigationService } from '@core/services';

export const AuthGuard: CanActivateFn = () => inject(AuthFn).canActivate();

export
@Injectable({
  providedIn: 'root',
})
class AuthFn {
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.navigationService.toLogin();
      return false;
    }

    return true;
  }
}

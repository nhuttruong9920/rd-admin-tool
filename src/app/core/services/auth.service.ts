import { inject, Injectable } from '@angular/core';

import { LSKeys } from '@shared/constants';
import { NavigationService } from './navigation.service';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

export type LoginReq = {
  username: string;
  password: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #storageService = inject(StorageService);
  #toastService = inject(ToastService);
  #navigationService = inject(NavigationService);

  login(request: LoginReq): void {
    const username = request.username.toLowerCase().trim();
    const password = request.password.trim();
    if (username === 'admin' && password === 'Avema@123456') {
      this.#storageService.setLocal(LSKeys.USER_NAME, username);
      this.#storageService.setLocal(LSKeys.PASSWORD, password);
      this.#navigationService.toHome();
    } else {
      this.#toastService.showError(
        'Tên đăng nhập hoặc mật khẩu không chính xác!',
      );
    }
  }

  logout(): void {
    this.#storageService.removeLocal(LSKeys.USER_NAME);
    this.#storageService.removeLocal(LSKeys.PASSWORD);
    this.#navigationService.toLogin();
  }

  isLoggedIn(): boolean {
    const userName = this.#storageService.getLocal(LSKeys.USER_NAME);
    const password = this.#storageService.getLocal(LSKeys.PASSWORD);
    return userName === 'admin' && password === 'Avema@123456';
  }
}

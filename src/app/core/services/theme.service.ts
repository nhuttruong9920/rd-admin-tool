import { effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { LSKeys } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  #storageService = inject(StorageService);

  isDarkMode = signal<boolean>(this.getLocalIsDarkMode());

  constructor() {
    effect(() => {
      this.#storageService.setLocal(LSKeys.IS_DARK_MODE, this.isDarkMode());
      document.documentElement.classList.toggle('dark', this.isDarkMode());
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  private getLocalIsDarkMode(): boolean {
    return this.#storageService.getLocal(LSKeys.IS_DARK_MODE, true) ?? false;
  }
}

import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from '@core/services';

import { fromEvent, map, startWith } from 'rxjs';
import { LSKeys } from '@shared/constants';
import { NavStyle, WidthBreakpoint } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  #storageService = inject(StorageService);
  navStyle = signal<NavStyle>(this.getLocalNavStyle());
  isOverlayNavOpened = signal<boolean>(false);

  protected windowRelativeWidth = toSignal(
    fromEvent(window, 'resize').pipe(
      startWith(window.innerWidth),
      map(() => {
        if (window.innerWidth < WidthBreakpoint.Sm) {
          return 'sm';
        } else if (window.innerWidth < WidthBreakpoint.Md) {
          return 'md';
        } else if (window.innerWidth < WidthBreakpoint.Lg) {
          return 'lg';
        } else if (window.innerWidth < WidthBreakpoint.Xl) {
          return 'xl';
        } else {
          return '2xl';
        }
      }),
    ),
  );

  isSmallScreen = computed(() => this.windowRelativeWidth() === 'sm');

  constructor() {
    effect(() => {
      this.#storageService.setLocal(LSKeys.NAV_STYLE, this.navStyle());
    });
  }

  private getLocalNavStyle(): NavStyle {
    return (
      (this.#storageService.getLocal(LSKeys.NAV_STYLE) as NavStyle) ?? 'default'
    );
  }
}

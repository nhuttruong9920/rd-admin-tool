import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LayoutService } from '@core/services';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <!-- nav -->
    <nav
      class="h-dvh fixed top-0 left-0 bg-surface transition-[width] duration-300 shadow-[0_0_4px_rgba(0,0,0,0.3)] hidden sm:block"
      [style.width.px]="navWidthPx()"
    >
      <app-sidebar />
    </nav>

    <!-- overlay nav - mobile nav -->
    <nav
      class="h-dvh fixed z-2000 top-0 left-0 bg-surface transition-transform duration-300 block sm:hidden"
      [style.width.px]="NAV_WIDTH_DEFAULT"
      [class.-translate-x-full]="!isOverlayNavOpened()"
    >
      <app-sidebar [collapseButton]="false" />
    </nav>

    <section
      class="h-10 fixed top-0 left-0 w-full bg-blue-500 block sm:hidden"
      [style.height.px]="topBarHeightPx()"
    >
      <app-topbar />
    </section>

    <main
      class="transition-[margin] duration-300"
      [style.margin-left.px]="navWidthPx()"
      [style.margin-top.px]="isSmallScreen() ? topBarHeightPx() : 0"
    >
      <router-outlet />
    </main>
  `,
})
export class LayoutComponent {
  NAV_WIDTH_DEFAULT = 250;
  NAV_WIDTH_COMPACT = 80;
  #layoutService = inject(LayoutService);
  topBarHeightPx = signal<number>(52);

  isSmallScreen = computed(() => this.#layoutService.isSmallScreen());
  isOverlayNavOpened = computed(() => this.#layoutService.isOverlayNavOpened());

  protected navWidthPx = computed(() => {
    if (this.isSmallScreen()) return 0;
    return this.#layoutService.navStyle() === 'default'
      ? this.NAV_WIDTH_DEFAULT
      : this.NAV_WIDTH_COMPACT;
  });
}

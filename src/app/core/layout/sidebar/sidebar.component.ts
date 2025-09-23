import { Component, computed, inject, input, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { AuthService, LayoutService, ThemeService } from '@core/services';
import {
  NavigationComponent,
  ScrollContainerComponent,
  LogoComponent,
} from '@shared/components';
import { NavItem } from '@shared/types';

@Component({
  selector: 'app-sidebar',
  imports: [
    NavigationComponent,
    ButtonModule,
    ScrollContainerComponent,
    LogoComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  #layoutService = inject(LayoutService);
  #themeService = inject(ThemeService);
  #authService = inject(AuthService);

  navStyle = computed(() => this.#layoutService.navStyle());
  isDarkMode = computed(() => this.#themeService.isDarkMode());

  navItems = signal<NavItem[]>([
    {
      label: 'Giám sát',
      children: [
        {
          label: 'Tất cả xe',
          icon: 'far fa-cars',
          routerLink: '/monitor/all-vehicles',
          attention: true,
          command: (): void => this.closeOverlayNav(),
        },
        {
          label: 'Xem lại lộ trình',
          icon: 'far fa-history',
          routerLink: '/monitor/history-replay',
          badge: '1',
          command: (): void => this.closeOverlayNav(),
        },
        {
          label: 'Gửi lệnh',
          icon: 'far fa-rectangle-terminal',
          routerLink: '/monitor/command',
          command: (): void => this.closeOverlayNav(),
        },
        // {
        //   label: 'Xem trực tiếp',
        //   icon: 'far fa-camera-movie',
        //   routerLink: '/monitor/livestream',
        //   command: (): void => this.closeOverlayNav(),
        // },
      ],
    },
    {
      label: 'Proxy',
      children: [
        {
          label: 'Reverse Proxy',
          icon: 'far fa-exchange-alt',
          routerLink: '/reverse-proxy/reverse-proxy',
          command: (): void => this.closeOverlayNav(),
        },
        {
          label: 'Traffic',
          icon: 'far fa-chart-line',
          routerLink: '/reverse-proxy/traffic',
          command: (): void => this.closeOverlayNav(),
        },
      ],
    },
    // {
    //   label: 'MDVR',
    //   children: [
    //     {
    //       label: 'Live server',
    //       icon: 'far fa-signal-stream',
    //       routerLink: '/mdvr/live-server',
    //       command: (): void => this.closeOverlayNav(),
    //     },
    //     {
    //       label: 'Phát lại liên tục',
    //       icon: 'far fa-clapperboard-play',
    //       routerLink: '/mdvr/continuous-playback',
    //       command: (): void => this.closeOverlayNav(),
    //     },
    //   ],
    // },
    {
      label: 'Khác',
      children: [
        {
          label: 'Chatbot',
          icon: 'far fa-message-bot',
          routerLink: '/others/chatbot',
          command: (): void => this.closeOverlayNav(),
        },
      ],
    },
  ]);

  collapseButton = input<boolean>(true);

  protected toggleNavStyle(): void {
    this.#layoutService.navStyle.update((style) =>
      style === 'default' ? 'compact' : 'default',
    );
  }

  protected toggleDarkMode(): void {
    this.#themeService.toggleDarkMode();
  }

  protected logout(): void {
    this.#authService.logout();
  }

  private closeOverlayNav(): void {
    this.#layoutService.isOverlayNavOpened.set(false);
  }
}

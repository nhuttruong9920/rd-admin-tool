import { Component, computed, inject, input, signal } from '@angular/core';
import { ThemeService } from '@core/services';
import { NavItem } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '@core/services';
import { NavigationComponent } from '@shared/components';
import { ScrollContainerComponent } from '@shared/components/scroll-container.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

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
        },
        {
          label: 'Xem lại lộ trình',
          icon: 'far fa-history',
          routerLink: '/monitor/history-replay',
          badge: '1',
        },
        {
          label: 'Gửi lệnh',
          icon: 'far fa-rectangle-terminal',
          routerLink: '/monitor/send-command',
        },
      ],
    },
    {
      label: 'Proxy',
      routerLink: '/reverse-proxy/reverse-proxy',
      children: [
        {
          label: 'Reverse Proxy',
          icon: 'far fa-exchange-alt',
          routerLink: '/reverse-proxy/reverse-proxy',
        },
        {
          label: 'Traffic',
          icon: 'far fa-chart-line',
          routerLink: '/reverse-proxy/traffic',
        },
      ],
    },
    {
      label: 'Khác',
      children: [
        {
          label: 'Chatbot',
          icon: 'far fa-message-bot',
          routerLink: '/others/chatbot',
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
}

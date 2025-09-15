import {
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { PanelMenuModule } from 'primeng/panelmenu';
import { TooltipModule } from 'primeng/tooltip';

import { NavItem, NavStyle } from '@shared/types';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [PanelMenuModule, RouterLink, RouterLinkActive, TooltipModule],
  template: `
    @let isCompact = navStyle() === 'compact';
    <div class="relative">
      @for (items of navItems(); track items.label; let last = $last) {
        @if (items.children) {
          <div class="mb-4" [class.!mb-0]="last">
            <h6 class="text-sm font-bold text-surface-500 mb-1 ml-2">
              {{ items.label }}
            </h6>
            <div class="flex flex-col gap-1">
              @for (child of items.children; track child.label) {
                <a
                  #linkEl
                  [routerLink]="child.routerLink"
                  routerLinkActive="active"
                  class=" block relative group"
                  [pTooltip]="isCompact ? child.label : ''"
                >
                  <div
                    class=" px-2 py-2 ml-4 mr-2 rounded text-surface-800 group-[.active]:!bg-primary-500 group-[.active]:text-white hover:bg-primary-500/20 transition-colors duration-300"
                    [class.text-center]="isCompact"
                    [class.mr-4]="isCompact"
                  >
                    <i class="w-8 text-center" [class]="child.icon"></i>
                    <span class="font-medium" [class.hidden]="isCompact">{{
                      child.label
                    }}</span>
                  </div>
                </a>
              }
            </div>
          </div>
        } @else {
          <a
            [routerLink]="items.routerLink"
            routerLinkActive="active"
            class=" block relative group"
            [pTooltip]="isCompact ? items.label : ''"
          >
            <div
              class="px-2 py-2 ml-4 mr-2 rounded text-surface-800 group-[.active]:!bg-primary-500 group-[.active]:text-white hover:bg-primary-500/20 transition-colors duration-300"
            >
              <i class="w-8 text-center" [class]="items.icon"></i>
              <span class="font-medium" [class.hidden]="isCompact">{{
                items.label
              }}</span>
            </div>
          </a>
        }
      }
      <div
        class="absolute left-0 w-1.5 h-10 bg-primary-500 transition-[top] duration-300 ease-in-out"
        [style.top.px]="activeOffsetTop()"
        style="border-radius: 0% 100% 100% 0% / 0% 20% 20% 0%"
      ></div>
    </div>
  `,
})
export class NavigationComponent {
  #router = inject(Router);
  navItems = input.required<NavItem[]>();
  navStyle = input<NavStyle>('default');

  activeOffsetTop = signal<number | null>(null);
  linkEls = viewChildren<ElementRef<HTMLAnchorElement>>('linkEl');

  constructor() {
    // On route change, recompute
    this.#router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.updateOffset(), 0);
      });
  }

  private updateOffset(): void {
    const links = this.linkEls();
    for (const linkRef of links) {
      const el = linkRef.nativeElement;
      if (el.classList.contains('active')) {
        this.activeOffsetTop.set(el.offsetTop);
        return;
      }
    }
    this.activeOffsetTop.set(null);
  }
}

import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChildren,
} from '@angular/core';
import {
  Event,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { PanelMenuModule } from 'primeng/panelmenu';
import { TooltipModule } from 'primeng/tooltip';

import { NavItem, NavStyle } from '@shared/types';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [PanelMenuModule, RouterLink, RouterLinkActive, TooltipModule],
  template: `
    @let isCompact = navStyle() === 'compact';
    <div class="relative">
      @for (items of navItems(); track items.label; let last = $last) {
        @if (items.children) {
          <div class="mb-4" [class.!mb-0]="last">
            <h6
              class="text-sm font-medium text-surface-500 mb-1 ml-4"
              [class.hidden]="isCompact"
            >
              {{ items.label }}
            </h6>
            <div
              class="h-[1px] w-full bg-surface-200 mb-4"
              [class.hidden]="!isCompact"
            ></div>
            <div class="flex flex-col gap-1">
              @for (child of items.children; track child.label) {
                <a
                  #linkEl
                  [routerLink]="child.routerLink"
                  routerLinkActive="active"
                  class=" block relative group"
                  [pTooltip]="isCompact ? child.label : ''"
                  (click)="child.command?.()"
                >
                  <div
                    class=" px-2 py-2 ml-4 mr-2 rounded text-surface-800  group-[.active]:text-white hover:bg-primary-500/15 transition-colors duration-300"
                    [class.text-center]="isCompact"
                    [class.mr-4]="isCompact"
                  >
                    <i
                      class="w-8 text-center"
                      [class]="child.icon"
                      [class.w-0]="isCompact"
                    ></i>
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
            (click)="items.command?.()"
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
        class="absolute left-0  h-10 w-[calc(100%-8px)]  transition-[top] duration-300 ease-in-out flex gap-2.5 -z-1"
        [class.justify-center]="isCompact"
        [class.w-[calc(100%-32px)]]="isCompact"
        [class.left-4]="isCompact"
        [style.top.px]="activeOffsetTop()"
        [class.hidden]="!activeOffsetTop()"
      >
        <div
          class="w-1.5 h-full bg-primary-500"
          style="border-radius: 0% 100% 100% 0% / 0% 20% 20% 0%"
          [class.hidden]="isCompact"
        ></div>

        <div class="flex-1 h-full bg-primary-500 rounded"></div>
      </div>
    </div>
  `,
})
export class NavigationComponent implements OnDestroy {
  #router = inject(Router);
  navItems = input.required<NavItem[]>();
  navStyle = input<NavStyle>('default');

  activeOffsetTop = signal<number | null>(null);
  linkEls = viewChildren<ElementRef<HTMLAnchorElement>>('linkEl');

  private routerSubscription: Subscription | null = null;
  private routeChangeTimeout: ReturnType<typeof setTimeout> | null = null;
  private styleChangeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.routerSubscription = this.#router.events
      .pipe(filter((e: Event) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.routeChangeTimeout) {
          clearTimeout(this.routeChangeTimeout);
        }
        this.routeChangeTimeout = setTimeout(() => this.updateOffset(), 0);
      });

    effect(() => {
      void this.navStyle();
      if (this.styleChangeTimeout) {
        clearTimeout(this.styleChangeTimeout);
      }
      this.styleChangeTimeout = setTimeout(() => this.updateOffset(), 300);
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

  ngOnDestroy(): void {
    if (this.routeChangeTimeout) {
      clearTimeout(this.routeChangeTimeout);
    }
    if (this.styleChangeTimeout) {
      clearTimeout(this.styleChangeTimeout);
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

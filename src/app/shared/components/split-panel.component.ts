import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  inject,
  input,
  linkedSignal,
  TemplateRef,
} from '@angular/core';

import { LayoutService } from '@core/services';

@Component({
  selector: 'app-split-panel',
  imports: [NgTemplateOutlet],
  template: `
    <div class="h-full w-full p-0 sm:p-2 overflow-hidden">
      <div class="h-full w-full relative">
        <div
          class="h-full w-full flex gap-2"
          [class.!gap-0]="!isRightPanelOpened()"
        >
          <section
            class="bg-surface flex-1 overflow-hidden rounded-none sm:rounded shadow-none sm:shadow relative"
          >
            <ng-container *ngTemplateOutlet="leftContent()" />
            <button
              class="btn__leaflet absolute top-2 right-2 z-401"
              (click)="toggleMobileRightPanel()"
            >
              <i
                class="fa-solid fa-chevron-right !transition-transform duration-300"
                [class.rotate-180]="!isRightPanelOpened()"
              ></i>
            </button>
          </section>
          <section
            class="w-100 bg-surface overflow-hidden rounded-none sm:rounded shadow hidden sm:block transition-[width] duration-300"
            [class.!w-0]="!isRightPanelOpened()"
            [class.!overflow-hidden]="!isRightPanelOpened()"
          >
            <ng-container *ngTemplateOutlet="rightContent()" />
          </section>
        </div>

        <section
          id="mobile-right-panel"
          class="h-full w-full sm:hidden bg-surface transition-transform duration-300 absolute top-0 left-0 z-1000"
          [class.translate-x-full]="!isRightPanelOpened()"
        >
          <div class="h-full w-full relative">
            <ng-container *ngTemplateOutlet="rightContent()" />

            <button
              class="bg-surface shadow rounded-r-full flex-center absolute top-1/2 -translate-y-1/2 left-0 z-401 w-6 h-8 cursor-pointer"
              (click)="toggleMobileRightPanel()"
            >
              <i
                class="text-xs fa-solid fa-chevron-right !transition-transform duration-300"
              ></i>
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class SplitPanelComponent {
  #layoutService = inject(LayoutService);

  isRightPanelOpened = linkedSignal<boolean>(() =>
    this.#layoutService.isSmallScreen() ? false : true,
  );

  map = input<L.Map | undefined>(undefined);

  protected rightContent =
    contentChild.required<TemplateRef<void>>('rightContent');
  protected leftContent =
    contentChild.required<TemplateRef<void>>('leftContent');

  toggleMobileRightPanel(): void {
    this.isRightPanelOpened.update((value) => !value);
  }
}

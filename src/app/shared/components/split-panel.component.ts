import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  inject,
  linkedSignal,
  TemplateRef,
} from '@angular/core';

import { LayoutService } from '@core/services';

@Component({
  selector: 'app-split-panel',
  imports: [NgTemplateOutlet],
  template: `
    <div class="h-full w-full p-0 sm:p-2 overflow-hidden">
      <div class="h-full w-full ">
        <div
          class="h-full w-full flex gap-2"
          [class.!gap-0]="!isRightPanelOpened()"
        >
          <section
            class="bg-surface flex-1 overflow-hidden rounded-none sm:rounded shadow-none sm:shadow"
          >
            <ng-container *ngTemplateOutlet="leftContent()" />
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
          class="h-full w-full sm:hidden bg-surface transition-transform duration-300 absolute top-0 left-0"
          [class.translate-x-full]="!isRightPanelOpened()"
        >
          <ng-container *ngTemplateOutlet="rightContent()" />
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

  protected rightContent =
    contentChild.required<TemplateRef<void>>('rightContent');
  protected leftContent =
    contentChild.required<TemplateRef<void>>('leftContent');

  toggleMobileRightPanel(): void {
    this.isRightPanelOpened.update((value) => !value);
  }
}

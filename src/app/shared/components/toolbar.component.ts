import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  contentChild,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';

import { BadgeModule } from 'primeng/badge';

import { WidthBreakpoint } from '@shared/types';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, BadgeModule],
  template: `
    <section
      #toolbarContainer
      class="flex items-center justify-between flex-wrap gap-2"
      [class]="styleClass()"
    >
      <div class="flex items-center gap-2 overflow-hidden">
        @if (icon()) {
          <div
            class="size-8 flex-center bg-primary-500/20 text-primary-500 rounded"
          >
            <i [class]="icon()"></i>
          </div>
        }
        <button
          class="font-bold text-xl text-theme-700 truncate"
          (click)="titleClick.emit()"
        >
          {{ headerTitle() }}
        </button>
        @if (amount()) {
          <p-badge [value]="amount()!" />
        }
        <ng-container *ngTemplateOutlet="leftContent() || null" />
      </div>

      @if (!isToolbarSmall()) {
        <div class="flex items-center gap-2" [class.!hidden]="isToolbarSmall()">
          <ng-container *ngTemplateOutlet="rightContent() || null" />
        </div>
      }

      <div class="hidden items-center gap-0.5" [class.!flex]="isToolbarSmall()">
        <button
          class="size-8 flex-center cursor-pointer hover:bg-surface-100 rounded-full transition-colors duration-300"
          (click)="onToggleCollapseMenu()"
        >
          <i
            class="fas fa-caret-down transition-transform duration-300"
            [class.rotate-90]="!showMobileMenu()"
          ></i>
        </button>
        <ng-container *ngTemplateOutlet="button() || null" />
      </div>
    </section>

    @if (isToolbarSmall()) {
      <section
        #collapseMenu
        [style.maxHeight.px]="collapseMenuHeight()"
        class="hidden ease overflow-hidden"
        [class.!block]="isToolbarSmall()"
        flex
        flex-col
        gap-2
        mt-1
        [class.transition-all]="hasAnimation()"
        [class.duration-300]="hasAnimation()"
      >
        <div class="flex flex-col gap-2 mt-1">
          <ng-container *ngTemplateOutlet="rightContent() || null" />
        </div>
      </section>
    }
  `,
})
export class ToolbarComponent {
  readonly headerTitle = input.required<string>();
  readonly amount = input<number | null | undefined>(null);
  readonly styleClass = input<string>();
  readonly icon = input<string | undefined>(undefined);

  readonly titleClick = output<void>();

  toolbarContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('toolbarContainer');
  isToolbarSmall = computed(() => {
    return (
      this.toolbarContainer().nativeElement.clientWidth < WidthBreakpoint.Sm
    );
  });

  showMobileMenu = signal(true);

  collapseMenu = viewChild<ElementRef>('collapseMenu');
  collapseMenuHeight = linkedSignal(() =>
    this.showMobileMenu() ? this.collapseMenu()?.nativeElement.scrollHeight : 0,
  );

  leftContent = contentChild<TemplateRef<void>>('leftContent');
  rightContent = contentChild<TemplateRef<void>>('rightContent');
  button = contentChild<TemplateRef<void>>('button');

  hasAnimation = signal(false);

  constructor() {
    afterNextRender(() => {
      const height = this.collapseMenu()?.nativeElement.scrollHeight ?? 0;
      this.collapseMenuHeight.set(height + 1);

      requestAnimationFrame(() => {
        this.hasAnimation.set(true);
      });
    });
  }

  protected onToggleCollapseMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
  }
}

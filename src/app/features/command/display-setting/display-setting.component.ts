import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  model,
  output,
  signal,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { FieldsetModule } from 'primeng/fieldset';

import { StorageService } from '@core/services';
import { LSKeys } from '@shared/constants';
import { LabelValue } from '@shared/types';

export type ShowInfoMethod = 'showToast' | 'onCopy';

@Component({
  selector: 'app-display-setting',
  imports: [
    ButtonModule,
    PopoverModule,
    SliderModule,
    FormsModule,
    RadioButtonModule,
    FieldsetModule,
  ],
  template: ` <p-button
      icon="fas fa-gears"
      severity="secondary"
      (click)="fontSizePopover.toggle($event)"
    />
    <p-popover #fontSizePopover>
      <div class="p-4 space-y-4">
        <p-fieldset legend="Hiển thị thông tin gói tin">
          <div class="space-y-2">
            @for (method of showInfoMethods; track method.value) {
              <div>
                <p-radiobutton
                  [inputId]="method.value"
                  [value]="method.value"
                  [(ngModel)]="selectedShowInfoMethod"
                />
                <label [for]="method.value" class="ml-2">{{
                  method.label
                }}</label>
              </div>
            }
          </div>
        </p-fieldset>
        <p-fieldset legend="Kích thước chữ" (wheel)="onScrollFontSize($event)">
          <div class="flex-center gap-4 relative">
            <div class="flex items-center gap-4">
              <p-button
                icon="fas fa-minus"
                size="small"
                rounded
                outlined
                (click)="onChangeFontSize(-1)"
              ></p-button>
              <p-slider
                [(ngModel)]="fontSize"
                [min]="PACKAGE_FONT_SIZE_MIN"
                [max]="PACKAGE_FONT_SIZE_MAX"
                class="w-56 !h-1.5"
              />
              <p-button
                icon="fas fa-plus"
                size="small"
                rounded
                outlined
                (click)="onChangeFontSize(1)"
              ></p-button>
            </div>
            <span
              class="absolute -top-4 left-1/2 -translate-x-1/2 font-semibold text-surface-600"
              >{{ fontSize() }}</span
            >
          </div>
        </p-fieldset>
      </div>
    </p-popover>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplaySettingComponent implements OnDestroy {
  #storageService = inject(StorageService);
  fontSizePopover = viewChild<Popover>('fontSizePopover');
  fontSize = signal<number>(this.getLocalFontSize());
  readonly fontSizeChange = output<number>();
  PACKAGE_FONT_SIZE_MIN = 8;
  PACKAGE_FONT_SIZE_MAX = 32;

  showInfoMethods: LabelValue<ShowInfoMethod>[] = [
    {
      label: 'Thông báo sau khi sao chép',
      value: 'showToast',
    },
    {
      label: 'Mở ngay lập tức sau khi sao chép',
      value: 'onCopy',
    },
  ];
  readonly selectedShowInfoMethod = model<ShowInfoMethod>(
    this.getLocalShowInfoMethod(),
  );
  readonly showInfoMethodChange = output<ShowInfoMethod>();
  constructor() {
    effect(() => {
      this.#storageService.setLocal(LSKeys.DATA_FONT_SIZE, this.fontSize());
      this.fontSizeChange.emit(this.fontSize());
    });

    effect(() => {
      this.#storageService.setLocal(
        LSKeys.SHOW_INFO_METHOD,
        this.selectedShowInfoMethod(),
      );
      this.showInfoMethodChange.emit(this.selectedShowInfoMethod());
    });
  }

  private getLocalFontSize(): number {
    return (
      this.#storageService.getLocal<number>(LSKeys.DATA_FONT_SIZE, true) ?? 14
    );
  }

  private getLocalShowInfoMethod(): ShowInfoMethod {
    return (
      this.#storageService.getLocal<ShowInfoMethod>(LSKeys.SHOW_INFO_METHOD) ??
      'showToast'
    );
  }

  protected onChangeFontSize(value: number): void {
    this.fontSize.update((prev) =>
      Math.max(
        this.PACKAGE_FONT_SIZE_MIN,
        Math.min(this.PACKAGE_FONT_SIZE_MAX, prev + value),
      ),
    );
  }

  protected onScrollFontSize(event: WheelEvent): void {
    event.preventDefault();
    this.fontSize.update(() => {
      const newValue =
        event.deltaY > 0 ? this.fontSize() + 1 : this.fontSize() - 1;
      return Math.max(
        this.PACKAGE_FONT_SIZE_MIN,
        Math.min(this.PACKAGE_FONT_SIZE_MAX, newValue),
      );
    });
  }

  ngOnDestroy(): void {
    this.fontSizePopover()?.el.nativeElement.remove();
  }
}

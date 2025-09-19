import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Popover, PopoverModule } from 'primeng/popover';

import { DateService } from '@core/services';

@Component({
  selector: 'app-date-time-picker',
  imports: [
    DatePickerModule,
    FormsModule,
    InputTextModule,
    PopoverModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    DatePipe,
  ],
  template: `
    @if (size()) {
      <p-iconfield>
        <input
          pInputText
          readonly
          [value]="inputText()"
          (focus)="openPopover($event)"
          [pSize]="size()!"
          class="w-full"
        />
        @if (showIcon()) {
          <p-inputicon class="far fa-calendar" />
        }
      </p-iconfield>
    } @else {
      <p-iconfield>
        <input
          pInputText
          readonly
          [value]="inputText()"
          (focus)="openPopover($event)"
          class="w-full"
        />
        @if (showIcon()) {
          <p-inputicon class="far fa-calendar" />
        }
      </p-iconfield>
    }
    <p-popover #op appendTo="body" (onHide)="closePopover()">
      <div class="flex flex-col md:flex-row">
        <p-datepicker
          class="max-w-full"
          [(ngModel)]="modifiedDate"
          [showTime]="true"
          [inline]="true"
          hourFormat="24"
          panelStyleClass="hidden-time-picker"
        >
          <ng-template #footer> </ng-template>
        </p-datepicker>
        <div
          class="flex flex-col p-3 border-t md:border-t-0 md:border-l border-surface-200"
        >
          <section class="flex gap-2">
            <!-- hour -->
            <div>
              <h3 class="font-medium text-center text-surface-800">Giờ</h3>
              <div class=" grid grid-cols-4">
                @for (option of hourOptions; track option) {
                  <button
                    (click)="setHour(option)"
                    class="size-10 flex-center cursor-pointer"
                  >
                    <span
                      class="size-8 flex-center rounded-full hover:bg-[var(--p-datepicker-day-hover-background)]"
                      [class.!bg-primary-500]="option === hour()"
                      [class.!text-white]="option === hour()"
                    >
                      {{ option }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <div class="flex-1 flex-center">
              <div
                class="border-r w-0.25 h-8/12 border-dashed border-surface-300"
              ></div>
            </div>
            <!-- minute -->
            <div>
              <h3 class="font-medium text-center text-surface-800">Phút</h3>
              <div class=" grid grid-cols-2">
                @for (option of minuteOptions; track option) {
                  <button
                    (click)="setMinute(option)"
                    class="size-10 flex-center cursor-pointer"
                  >
                    <span
                      class="size-8 flex-center rounded-full hover:bg-[var(--p-datepicker-day-hover-background)]"
                      [class.!bg-primary-500]="option === minute()"
                      [class.!text-white]="option === minute()"
                    >
                      {{ option }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </section>

          <section
            class="flex justify-between items-center gap-2 border-t border-surface-200 pt-3 mt-3"
          >
            <div
              class="flex-center bg-surface-200 rounded border border-surface-400 border-dashed h-[35px] px-2"
            >
              <p class="text-xs">
                {{ modifiedDate() | date: 'dd/MM/yyyy HH:mm:ss' }}
              </p>
            </div>
            <div class="flex gap-1">
              <p-button size="small" label="Áp dụng" (click)="pickDateDone()" />
            </div>
          </section>
        </div>
      </div>
    </p-popover>
  `,
})
export class DateTimePickerComponent {
  #dateService = inject(DateService);

  hourOptions: number[] = Array.from({ length: 24 }, (_, i) => i);
  minuteOptions: number[] = Array.from({ length: 12 }, (_, i) => i * 5);

  popover = viewChild<Popover>('op');

  size = input<'small' | 'large'>();
  showIcon = input<boolean>(true);
  placeholder = input<string>();
  inputId = input<string>();
  date = model.required<Date>();

  modifiedDate = linkedSignal<Date>(() => this.date());
  hour = linkedSignal<number>(() => {
    return this.modifiedDate().getHours();
  });
  minute = linkedSignal<number>(() => {
    return this.modifiedDate().getMinutes();
  });
  pickDate = output<Date>();
  inputText = computed(() => this.#dateService.getFormattedDate(this.date()));

  protected openPopover(event: Event): void {
    this.popover()?.toggle(event);
  }

  protected setHour(hour: number): void {
    const newDate = new Date(this.modifiedDate());
    newDate.setHours(hour);
    this.modifiedDate.set(newDate);
  }

  protected setMinute(minute: number): void {
    const newDate = new Date(this.modifiedDate());
    newDate.setMinutes(minute);
    this.modifiedDate.set(newDate);
  }

  protected closePopover(): void {
    this.modifiedDate.set(this.date());
    this.popover()?.hide();
  }

  protected pickDateDone(): void {
    this.date.set(this.modifiedDate());
    this.pickDate.emit(this.date());
    this.closePopover();
  }
}

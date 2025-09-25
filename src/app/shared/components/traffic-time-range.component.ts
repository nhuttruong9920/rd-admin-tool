import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { ToastService } from '@core/services';
import { LabelValue, TrafficTimeRange } from '@shared/types';

@Component({
  selector: 'app-traffic-time-range',
  imports: [
    InputNumberModule,
    SelectModule,
    InputGroupModule,
    FormsModule,
    ButtonModule,
  ],
  template: `
    <div class="flex items-center gap-2">
      <div class="w-70">
        <p-inputgroup>
          <p-inputnumber
            [(ngModel)]="timeValue"
            inputId="timeValue"
            (onInput)="checkMaxTimeRange()"
            [invalid]="!isValidTimeRange()"
          />
          <p-select
            [options]="timeUnit"
            [(ngModel)]="selectedTimeUnit"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn đơn vị"
            class="w-full"
            required
            (onChange)="checkMaxTimeRange()"
            [invalid]="!isValidTimeRange()"
          />
        </p-inputgroup>
      </div>

      <p-button
        label="Tải"
        (click)="submitTime()"
        [disabled]="!isValidTimeRange()"
        icon="fas fa-magnifying-glass"
      />
    </div>
  `,
})
export class TrafficTimeRangeComponent {
  #toastService = inject(ToastService);

  timeValue = signal<number>(1);
  timeUnit: LabelValue<'s' | 'm' | 'h' | 'd' | 'mo' | 'y'>[] = [
    {
      label: 'Giây',
      value: 's',
    },
    {
      label: 'Phút',
      value: 'm',
    },
    {
      label: 'Giờ',
      value: 'h',
    },
    {
      label: 'Ngày',
      value: 'd',
    },
    {
      label: 'Tháng',
      value: 'mo',
    },
    {
      label: 'Năm',
      value: 'y',
    },
  ];

  selectedTimeUnit = signal<'s' | 'm' | 'h' | 'd' | 'mo' | 'y'>('d');

  isValidTimeRange = signal<boolean>(true);

  submitTimeRange = output<TrafficTimeRange>();

  protected checkMaxTimeRange(): void {
    const currentValue = this.timeValue();
    const currentUnit = this.selectedTimeUnit();

    if (!currentValue || currentValue <= 0) {
      return;
    }

    // Convert current selection to days for comparison
    let daysEquivalent = 0;

    switch (currentUnit) {
      case 's':
        daysEquivalent = currentValue / (24 * 60 * 60); // seconds to days
        break;
      case 'm':
        daysEquivalent = currentValue / (24 * 60); // minutes to days
        break;
      case 'h':
        daysEquivalent = currentValue / 24; // hours to days
        break;
      case 'd':
        daysEquivalent = currentValue; // already in days
        break;
      case 'mo':
        daysEquivalent = currentValue * 30; // approximate months to days
        break;
      case 'y':
        daysEquivalent = currentValue * 365; // years to days
        break;
    }

    const maxDays = 365;
    if (daysEquivalent > maxDays) {
      this.#toastService.showError('Thời gian tối đa là 1 năm (365 ngày)');
      this.isValidTimeRange.set(false);
    } else {
      this.isValidTimeRange.set(true);
    }
  }

  protected submitTime(): void {
    const timeRange =
      `${this.timeValue()}${this.selectedTimeUnit()}` as TrafficTimeRange;
    this.submitTimeRange.emit(timeRange);
  }
}

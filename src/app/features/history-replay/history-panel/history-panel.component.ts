import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import {
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateService, ToastService } from '@core/services';
import {
  DateTimePickerComponent,
  ToolbarComponent,
  VehicleIconComponent,
} from '@shared/components';
import { DeviceStatus, GetDeviceHistoryReq } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { HistoryStore } from '@shared/stores';
import { HistoryCardComponent } from './history-card/history-card.component';
import { HistoryControlsComponent } from '@shared/components/history-controls.component';
import { cdkScrollWhileHidden } from '@shared/utils';

@Component({
  selector: 'app-history-panel',
  imports: [
    ToolbarComponent,
    ScrollingModule,
    SelectModule,
    FormsModule,
    VehicleIconComponent,
    DateTimePickerComponent,
    ButtonModule,
    MenuModule,
    HistoryCardComponent,
    HistoryControlsComponent,
  ],
  templateUrl: './history-panel.component.html',
})
export class HistoryPanelComponent {
  #activatedRoute = inject(ActivatedRoute);
  #dateService = inject(DateService);
  #toastService = inject(ToastService);
  historyStore = inject(HistoryStore);

  readonly cdkViewport = viewChild<CdkVirtualScrollViewport>('cdkViewport');

  deviceStatus = input.required<DeviceStatus[]>();
  isHistoryPlaying = model.required<boolean>();
  selectedPlayingSpeed = model.required<number>();
  currentPlayingIndex = model.required<number>();
  selectedDeviceId = signal<string | null>(null);

  historyReq = output<GetDeviceHistoryReq>();

  dateRangeItems: MenuItem[] = this.#dateService.dateRangeOptions.map(
    (item) => ({
      ...item,
      command: (): void => {
        const [startDate, endDate] = this.#dateService.getDateRange(item.value);
        this.historyFromDate.set(startDate);
        this.historyToDate.set(endDate);
      },
    }),
  );

  historyFromDate = signal<Date>(
    this.#activatedRoute.snapshot.queryParams['fromTime']
      ? this.#dateService.getDate(
          this.#activatedRoute.snapshot.queryParams['fromTime'],
          1970,
        )
      : this.#dateService.getToday('start'),
  );
  historyToDate = signal<Date>(
    this.#activatedRoute.snapshot.queryParams['toTime']
      ? this.#dateService.getDate(
          this.#activatedRoute.snapshot.queryParams['toTime'],
          1970,
        )
      : this.#dateService.getToday('end'),
  );

  constructor() {
    effect(() => {
      cdkScrollWhileHidden(this.cdkViewport(), this.currentPlayingIndex());
    });
  }

  protected loadHistory(): void {
    if (!this.selectedDeviceId()) {
      this.#toastService.showError('Vui lòng chọn thiết bị');
      return;
    }
    const request: GetDeviceHistoryReq = {
      id: this.selectedDeviceId() ?? '',
      fromTime: this.#dateService.getFormattedDate(
        this.historyFromDate(),
        'yyyy-MM-dd HH:mm:ss',
      ),
      toTime: this.#dateService.getFormattedDate(
        this.historyToDate(),
        'yyyy-MM-dd HH:mm:ss',
      ),
    };

    this.historyReq.emit({
      id: request.id,
      fromTime: request.fromTime,
      toTime: request.toTime,
    });
  }

  protected selectWaypoint(index: number): void {
    this.isHistoryPlaying.set(false);
    this.currentPlayingIndex.set(index);
  }
}

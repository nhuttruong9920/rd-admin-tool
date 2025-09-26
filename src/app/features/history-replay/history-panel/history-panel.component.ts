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
import { DateService, ExportService, ToastService } from '@core/services';
import {
  DataStateComponent,
  DateTimePickerComponent,
  ToolbarComponent,
  VehicleIconComponent,
} from '@shared/components';
import { HistoryControlsComponent } from '@shared/components/history-controls.component';
import { HistoryStore } from '@shared/stores';
import {
  ConnectionDto,
  DeviceState,
  GetDeviceHistoryReq
} from '@shared/types';
import { cdkScrollWhileHidden } from '@shared/utils';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { HistoryCardComponent } from './history-card/history-card.component';

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
    DataStateComponent,
    SkeletonModule,
    FloatLabelModule,
    InputNumberModule,
  ],
  templateUrl: './history-panel.component.html',
})
export class HistoryPanelComponent {
  #activatedRoute = inject(ActivatedRoute);
  #dateService = inject(DateService);
  #toastService = inject(ToastService);
  #exportService = inject(ExportService);
  historyStore = inject(HistoryStore);

  readonly cdkViewport = viewChild<CdkVirtualScrollViewport>('cdkViewport');

  connection = input.required<ConnectionDto[]>();
  isHistoryPlaying = model.required<boolean>();
  selectedPlayingSpeed = model.required<number>();
  currentPlayingIndex = model.required<number>();
  selectedDeviceId = signal<string | null>(null);

  batteryPercentageInterval = model.required<number>();

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

  protected downloadExcel(): void {
    if (!this.historyStore.data() || !this.historyStore.data()?.length) {
      this.#toastService.showError('Không có dữ liệu để xuất excel');
      return;
    }

    const fileName = `Xem lại lộ trình\n${this.selectedDeviceId()}\n${this.#dateService.getFormattedDate(this.historyFromDate())} - ${this.#dateService.getFormattedDate(this.historyToDate())}`;

    const dataToExport = this.historyStore.data()!.map((item, index) => {
      return {
        ['#']: index + 1,
        ['Thời gian']: item.formatted.gpsTime,
        ['Trạng thái']: this.getLocaleState(item.formatted.state),
        ['Tốc độ (km/h)']: item.formatted.gpsSpeed.value,
        ['Hướng']: item.formatted.heading,
        ['Vệ tinh']: item.satellite,
        ['Động cơ']: item.status === 1 ? 'Bật' : 'Tắt',
        ['Điện áp (V)']: item.voltage / 100,
        ['Địa chỉ']: item.info,
        ['Toạ độ (lat, long)']: `${item.formatted.lat}, ${item.formatted.long}`,
        ['Thời gian odo']: item.formatted.odoTime.value,
        ['Chế độ']: item.formatted.mode?.value,
        ['Pin (%)']: item.formatted.battery.value,
        ['QĐ còn lại (km)']: item.formatted.range.value,
        ['Tốc độ xe (km/h)']: item.formatted.vehicleSpeed.value,
        ['Điện áp pin (V)']: item.formatted.voltage.value,
      };
    });

    this.#exportService.exportDataToExcel(
      [
        {
          sheetName: 'Xem lại lộ trình',
          items: dataToExport,
          sheetTopHeader: fileName,
        },
      ],
      fileName,
    );
  }

  private getLocaleState(state: DeviceState): string {
    switch (state) {
      case 'disconnected':
      case 'offline':
        return 'Mất kết nối';
      case 'stop':
        return 'Đang dừng';
      case 'running':
        return 'Đang chạy';
      case 'overspeed':
        return 'Vượt tốc độ';
      default:
        return 'Không xác định';
    }
  }
}

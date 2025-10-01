import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateService, NavigationService } from '@core/services';
import { ButtonModule } from 'primeng/button';
import { VehicleDetailService } from '../vehicle-detail.service';
import { DetailInformationComponent } from './detail-information/detail-information.component';
import { HistoryDetailStore } from './detail-information/history-detail.store';
import { GetDeviceHistoryReq } from '@shared/types';

@Component({
  selector: 'app-detail-page',
  imports: [ButtonModule, DetailInformationComponent],
  templateUrl: './detail-page.component.html',
  providers: [HistoryDetailStore],
})
export class DetailPageComponent {
  #activatedRoute = inject(ActivatedRoute);
  #navigationService = inject(NavigationService);
  #vehicleDetailService = inject(VehicleDetailService);
  #historyDetailStore = inject(HistoryDetailStore);
  #dateService = inject(DateService);

  selectedConnectionId = this.#vehicleDetailService.selectedConnectionId;
  selectedConnectionStatus =
    this.#vehicleDetailService.selectedConnectionStatus;

  constructor() {
    this.#activatedRoute.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.selectedConnectionId.set(id);
        this.startHistoryAutoRefresh(id);
      }
    });
  }

  back(): void {
    this.#navigationService.toVehicleDetail();
  }

  private startHistoryAutoRefresh(id: string): void {
    const startDate = this.#dateService.getToday('start');
    const endDate = this.#dateService.getToday('end');

    const request: GetDeviceHistoryReq = {
      id: id,
      fromTime: this.#dateService.getFormattedDate(
        startDate,
        'yyyy-MM-dd HH:mm:ss',
      ),
      toTime: this.#dateService.getFormattedDate(
        endDate,
        'yyyy-MM-dd HH:mm:ss',
      ),
    };
    this.#historyDetailStore.fetchHistory(request);

    setInterval(() => {
      this.#historyDetailStore.fetchHistory(request);
    }, 30 * 1000);
  }
}

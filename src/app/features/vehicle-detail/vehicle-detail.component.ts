import { Component, inject } from '@angular/core';
import { NavigationService } from '@core/services';

import { DataStateComponent } from '@shared/components';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { VehicleDetailService } from './vehicle-detail.service';

@Component({
  selector: 'app-vehicle-detail',
  imports: [DetailCardComponent, DataStateComponent],
  templateUrl: './vehicle-detail.component.html',
})
export class VehicleDetailComponent {
  #vehicleDetailService = inject(VehicleDetailService);
  #navigationService = inject(NavigationService);

  connectionStatus = this.#vehicleDetailService.connectionStatus;


  toVehicleDetail(id: string): void {
    this.#navigationService.toVehicleDetail(id);
  }
}

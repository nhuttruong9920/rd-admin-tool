import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '@core/services';
import { ButtonModule } from 'primeng/button';
import { VehicleDetailService } from '../vehicle-detail.service';
import { DetailInformationComponent } from './detail-information/detail-information.component';
import { DetailCommandComponent } from './detail-command/detail-command.component';
import { DetailHistoryComponent } from './detail-history/detail-history.component';

@Component({
  selector: 'app-detail-page',
  imports: [
    ButtonModule,
    DetailInformationComponent,
    DetailHistoryComponent,
    DetailCommandComponent,
  ],
  templateUrl: './detail-page.component.html',
})
export class DetailPageComponent {
  #activatedRoute = inject(ActivatedRoute);
  #navigationService = inject(NavigationService);
  #vehicleDetailService = inject(VehicleDetailService);

  selectedConnectionId = this.#vehicleDetailService.selectedConnectionId;
  selectedConnectionStatus =
    this.#vehicleDetailService.selectedConnectionStatus;

  constructor() {
    this.#activatedRoute.params.subscribe((params) => {
      this.selectedConnectionId.set(params['id']);
    });
  }

  back(): void {
    this.#navigationService.toVehicleDetail();
  }
}

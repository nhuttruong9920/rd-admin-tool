import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GatewayAdminRestService } from '@core/services';
import { TrafficDto } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class TrafficApiService {
  #restService = inject(GatewayAdminRestService);

  getTraffic(): Observable<TrafficDto> {
    return this.#restService.get<TrafficDto>('/traffic/overview');
  }
}

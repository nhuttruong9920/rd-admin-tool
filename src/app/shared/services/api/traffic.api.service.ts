import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GatewayAdminRestService } from '@core/services';
import { TrafficDto, TrafficReq } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class TrafficApiService {
  #restService = inject(GatewayAdminRestService);

  getTraffic(request: TrafficReq): Observable<TrafficDto> {
    return this.#restService.get<TrafficDto>('/traffic/overview', request);
  }
}

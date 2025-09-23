import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { RestService } from '@core/services';
import { TrafficDto } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class TrafficApiService {
  #restService = inject(RestService);

  #baseUrl = 'https://vietmap.nangphanvan.software';

  getTraffic(): Observable<TrafficDto> {
    return this.#restService.getCustom<TrafficDto>(
      this.#baseUrl,
      '/api/traffic/overview',
    );
  }
}

import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { RestService } from '@core/services';
import {
  AllGatewayServerHealthDto,
  CreateGatewayServerReq,
  CreateGatewayServerRes,
  CtaSuccessDto,
  GatewayServerDto,
  GatewayServerHealthDto,
  UpdateGatewayServerReq,
  UpdateGatewayServerRes,
} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class GatewayServerApiService {
  #restService = inject(RestService);

  #baseUrl = 'https://vietmap.nangphanvan.software';

  getAll(): Observable<GatewayServerDto[]> {
    return this.#restService.getCustom<GatewayServerDto[]>(
      this.#baseUrl,
      '/api/gateway-servers/get-all',
    );
  }

  getById(id: string): Observable<GatewayServerDto> {
    return this.#restService.getCustom<GatewayServerDto>(
      this.#baseUrl,
      `/api/gateway-servers/${id}`,
    );
  }

  create(request: CreateGatewayServerReq): Observable<CreateGatewayServerRes> {
    return this.#restService.postCustom<
      CreateGatewayServerReq,
      CreateGatewayServerRes
    >(this.#baseUrl, '/api/gateway-servers', request);
  }

  update(
    request: UpdateGatewayServerReq & { id: string },
  ): Observable<UpdateGatewayServerRes> {
    return this.#restService.putCustom<
      UpdateGatewayServerReq,
      UpdateGatewayServerRes
    >(this.#baseUrl, `/api/gateway-servers/${request.id}`, request);
  }

  delete(id: string): Observable<CtaSuccessDto> {
    return this.#restService.deleteCustom<CtaSuccessDto>(
      this.#baseUrl,
      `/api/gateway-servers/${id}`,
    );
  }

  getHealth(
    id?: string,
  ): Observable<GatewayServerHealthDto | AllGatewayServerHealthDto> {
    if (id) {
      return this.#restService.getCustom<GatewayServerHealthDto>(
        this.#baseUrl,
        `/api/gateway-servers/${id}/health`,
      );
    }

    return this.#restService.getCustom<AllGatewayServerHealthDto>(
      this.#baseUrl,
      `/api/gateway-servers/health`,
    );
  }
}

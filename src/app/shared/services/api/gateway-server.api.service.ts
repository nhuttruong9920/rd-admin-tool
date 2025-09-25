import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GatewayAdminRestService } from '@core/services';
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
  #restService = inject(GatewayAdminRestService);

  getAll(): Observable<GatewayServerDto[]> {
    return this.#restService.get<GatewayServerDto[]>(
      '/gateway-servers/get-all',
    );
  }

  getById(id: string): Observable<GatewayServerDto> {
    return this.#restService.get<GatewayServerDto>(`/gateway-servers/${id}`);
  }

  create(request: CreateGatewayServerReq): Observable<CreateGatewayServerRes> {
    return this.#restService.post<
      CreateGatewayServerReq,
      CreateGatewayServerRes
    >('/gateway-servers', request);
  }

  update(
    request: UpdateGatewayServerReq & { id: string },
  ): Observable<UpdateGatewayServerRes> {
    return this.#restService.put<
      UpdateGatewayServerReq,
      UpdateGatewayServerRes
    >(`/gateway-servers/${request.id}`, request);
  }

  delete(id: string): Observable<CtaSuccessDto> {
    return this.#restService.delete<CtaSuccessDto>(`/gateway-servers/${id}`);
  }

  getHealth(
    id?: string,
  ): Observable<GatewayServerHealthDto | AllGatewayServerHealthDto> {
    if (id) {
      return this.#restService.get<GatewayServerHealthDto>(
        `/gateway-servers/${id}/health`,
      );
    }

    return this.#restService.get<AllGatewayServerHealthDto>(
      `/gateway-servers/health`,
    );
  }
}

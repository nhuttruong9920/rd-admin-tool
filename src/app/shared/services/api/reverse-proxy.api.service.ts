import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { RestService } from '@core/services';
import {
  CreateUpdateReverseProxyReq,
  ReverseProxyAppliedDto,
  ReverseProxyApplyConfigReq,
  ReverseProxyCtaDto,
  ReverseProxyDto,
  ReverseProxyOptionDto,
} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ReverseProxyApiService {
  #restService = inject(RestService);

  #baseUrl = 'https://vietmap.nangphanvan.software';

  getAllReverseProxies(): Observable<ReverseProxyDto[]> {
    return this.#restService.getCustom<ReverseProxyDto[]>(
      this.#baseUrl,
      '/api/reverse-proxy/get-all',
    );
  }

  getReverseProxyById(id: string): Observable<ReverseProxyDto> {
    return this.#restService.getCustom<ReverseProxyDto>(
      this.#baseUrl,
      `/api/reverse-proxy/${id}`,
    );
  }

  createReverseProxy(
    request: CreateUpdateReverseProxyReq,
  ): Observable<ReverseProxyCtaDto> {
    return this.#restService.postCustom<
      CreateUpdateReverseProxyReq,
      ReverseProxyCtaDto
    >(this.#baseUrl, '/api/reverse-proxy/create', request);
  }

  updateReverseProxy(
    request: CreateUpdateReverseProxyReq,
  ): Observable<ReverseProxyCtaDto> {
    return this.#restService.putCustom<
      CreateUpdateReverseProxyReq,
      ReverseProxyCtaDto
    >(this.#baseUrl, `/api/reverse-proxy/edit`, request);
  }

  deleteReverseProxy(id: string): Observable<ReverseProxyCtaDto> {
    return this.#restService.deleteCustom<ReverseProxyCtaDto>(
      this.#baseUrl,
      `/api/reverse-proxy/${id}`,
    );
  }

  getConfigYarp(environment: string): Observable<any> {
    return this.#restService.getCustom<string>(
      this.#baseUrl,
      `/api/reverse-proxy/config-yarp`,
      { environment },
    );
  }

  applyConfigYarp(
    environment: string,
    type: 'update' | 'delete',
    req: ReverseProxyApplyConfigReq,
  ): Observable<ReverseProxyAppliedDto> {
    const requestEndpoint = `/api/reverse-proxy/apply-config?environment=${environment}&type=${type}`;
    return this.#restService.postCustom<
      ReverseProxyApplyConfigReq,
      ReverseProxyAppliedDto
    >(this.#baseUrl, requestEndpoint, req);
  }

  getProxyEnvironments(): Observable<ReverseProxyOptionDto[]> {
    return this.#restService.getCustom<ReverseProxyOptionDto[]>(
      this.#baseUrl,
      `/api/reverse-proxy/environments`,
    );
  }

  getProxyLoadBalancingPolicies(): Observable<ReverseProxyOptionDto[]> {
    return this.#restService.getCustom<ReverseProxyOptionDto[]>(
      this.#baseUrl,
      `/api/reverse-proxy/load-balancing-policies`,
    );
  }
}

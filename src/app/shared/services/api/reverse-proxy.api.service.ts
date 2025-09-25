import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { GatewayAdminRestService } from '@core/services';
import {
  CreateUpdateReverseProxyReq,
  GatewayServerDto,
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
  #restService = inject(GatewayAdminRestService);

  getAllReverseProxies(): Observable<ReverseProxyDto[]> {
    return this.#restService.get<ReverseProxyDto[]>('/reverse-proxy/get-all');
  }

  getReverseProxyById(id: string): Observable<ReverseProxyDto> {
    return this.#restService.get<ReverseProxyDto>(`/reverse-proxy/${id}`);
  }

  createReverseProxy(
    request: CreateUpdateReverseProxyReq,
  ): Observable<ReverseProxyCtaDto> {
    return this.#restService.post<
      CreateUpdateReverseProxyReq,
      ReverseProxyCtaDto
    >('/reverse-proxy/create', request);
  }

  updateReverseProxy(
    request: CreateUpdateReverseProxyReq,
  ): Observable<ReverseProxyCtaDto> {
    return this.#restService.put<
      CreateUpdateReverseProxyReq,
      ReverseProxyCtaDto
    >('/reverse-proxy/edit', request);
  }

  deleteReverseProxy(id: string): Observable<ReverseProxyCtaDto> {
    return this.#restService.delete<ReverseProxyCtaDto>(`/reverse-proxy/${id}`);
  }

  getConfigYarp(gatewayServerId: string): Observable<any> {
    return this.#restService.get<string>(`/reverse-proxy/config-yarp`, {
      gatewayServerId,
    });
  }

  applyConfigYarp(
    gatewayServerId: string,
    type: 'update' | 'delete' | 'unapply',
    req: ReverseProxyApplyConfigReq,
  ): Observable<ReverseProxyAppliedDto> {
    const requestEndpoint = `/reverse-proxy/apply-config?gatewayServerId=${gatewayServerId}&type=${type}`;
    return this.#restService.post<
      ReverseProxyApplyConfigReq,
      ReverseProxyAppliedDto
    >(requestEndpoint, req);
  }

  getPreviewConfigYarp(
    gatewayServerId: string,
    type: 'update' | 'delete' | 'unapply',
    req: ReverseProxyApplyConfigReq,
  ): Observable<ReverseProxyAppliedDto> {
    const requestEndpoint = `/reverse-proxy/preview-config?gatewayServerId=${gatewayServerId}&type=${type}`;
    return this.#restService.post<
      ReverseProxyApplyConfigReq,
      ReverseProxyAppliedDto
    >(requestEndpoint, req);
  }

  getProxyLoadBalancingPolicies(): Observable<ReverseProxyOptionDto[]> {
    return this.#restService.get<ReverseProxyOptionDto[]>(
      `/reverse-proxy/load-balancing-policies`,
    );
  }

  getProxyGatewayServers(): Observable<GatewayServerDto[]> {
    return this.#restService.get<GatewayServerDto[]>(
      `/reverse-proxy/gateway-servers`,
    );
  }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import {
  GATEWAY_ADMIN_API_URL,
  RD_DEV_API_URL,
  SUBSCRIPTION_API_URL,
} from '@core/tokens';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  #httpClient = inject(HttpClient);

  protected baseUrl = '';

  post<T, R>(
    endpoint: string,
    body?: T | Record<string, never>,
    contentType: string = 'application/json',
  ): Observable<R> {
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.post<R>(this.baseUrl + endpoint, body, {
      headers,
    });
  }

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    contentType: string = 'application/json',
  ): Observable<T> {
    let httpParams = new HttpParams();

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        if (params[key] === undefined || params[key] === null) {
          continue;
        }
        httpParams = httpParams.append(key, params[key].toString());
      }
    }

    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.get<T>(this.baseUrl + endpoint, {
      params: httpParams,
      headers,
    });
  }

  delete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    contentType: string = 'application/json',
  ): Observable<T> {
    let httpParams = new HttpParams();

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        httpParams = httpParams.append(key, params[key].toString());
      }
    }

    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.delete<T>(this.baseUrl + endpoint, {
      params: httpParams,
      headers,
    });
  }

  put<T, R>(
    endpoint: string,
    body?: T | Record<string, never>,
    contentType: string = 'application/json',
  ): Observable<R> {
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.put<R>(this.baseUrl + endpoint, body, { headers });
  }

  getStatic<T>(url: string): Observable<T> {
    return this.#httpClient.get<T>(url);
  }
}

@Injectable({
  providedIn: 'root',
})
export class RdDevRestService extends RestService {
  protected override readonly baseUrl = inject(RD_DEV_API_URL);
}

@Injectable({
  providedIn: 'root',
})
export class GatewayAdminRestService extends RestService {
  protected override readonly baseUrl = inject(GATEWAY_ADMIN_API_URL);
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionRestService extends RestService {
  protected override readonly baseUrl = inject(SUBSCRIPTION_API_URL);
}

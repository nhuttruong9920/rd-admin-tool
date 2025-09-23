import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  #httpClient = inject(HttpClient);

  readonly baseUrl = environment.mainApiUrl;

  post<T, R>(
    endpoint: string,
    body?: T | Record<string, never>,
    contentType: string = 'application/json',
  ): Observable<R> {
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.post<R>(this.baseUrl + endpoint, body, { headers });
  }

  get<T>(
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

  postCustom<T, R>(
    baseUrl: string,
    endpoint: string,
    body?: T | Record<string, never>,
    contentType: string = 'application/json',
  ): Observable<R> {
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.post<R>(baseUrl + endpoint, body, { headers });
  }

  getCustom<T>(
    baseUrl: string,
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

    return this.#httpClient.get<T>(baseUrl + endpoint, {
      params: httpParams,
      headers,
    });
  }

  deleteCustom<T>(
    baseUrl: string,
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

    return this.#httpClient.delete<T>(baseUrl + endpoint, {
      params: httpParams,
      headers,
    });
  }

  putCustom<T, R>(
    baseUrl: string,
    endpoint: string,
    body?: T | Record<string, never>,
    contentType: string = 'application/json',
  ): Observable<R> {
    const headers = new HttpHeaders({ 'Content-Type': contentType });

    return this.#httpClient.put<R>(baseUrl + endpoint, body, { headers });
  }
}

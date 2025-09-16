import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';

import { finalize, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

type QueryResult<T> = {
  data: Signal<T | null>;
  error: Signal<any>;
  isLoading: Signal<boolean>;
  isRefetching: Signal<boolean>;
  refetch: () => void;
};

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

  useQuery<T>(
    endpoint: string,
    method: 'post' | 'get' = 'get',
    body?: Record<string, unknown>,
    contentType: string = 'application/json',
  ): QueryResult<T> {
    const data = signal<T | null>(null);
    const error = signal<any>(null);
    const isLoading = signal<boolean>(false);
    const isRefetching = signal<boolean>(false);

    const fetch = (isRefetch = false): void => {
      if (isRefetch) {
        isRefetching.set(true);
      } else {
        isLoading.set(true);
      }

      let request$;

      switch (method) {
        case 'get':
          request$ = this.get(
            endpoint,
            body as Record<string, string | number | boolean>,
            contentType,
          );
          break;
        case 'post':
          request$ = this.post(endpoint, body, contentType);
          break;
      }

      request$
        .pipe(
          finalize(() => {
            isLoading.set(false);
            isRefetching.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            data.set(res as T);
            error.set(null);
          },
          error: (err) => error.set(err),
        });
    };

    fetch();

    return {
      data,
      error,
      isLoading,
      isRefetching,
      refetch: () => fetch(true),
    };
  }
}

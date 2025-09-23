import { computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { ConnectionApiService } from '@shared/services';
import {
  CommonStoreInitialState,
  GetSTDCommandReq,
  PackageDto,
} from '@shared/types';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  interval,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

const initialState: CommonStoreInitialState<PackageDto[]> & {
  refreshInterval: number;
  request: GetSTDCommandReq | null;
} = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
  refreshInterval: 10000,
  request: null,
};

export const SendCommandStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading, error }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
    isError: computed(() => !_loading() && !data() && error()),
    firstTimeHasData: computed(() => data() !== null),
  })),
  withMethods((store) => {
    const connectionApiService = inject(ConnectionApiService);
    const refresh$ = new BehaviorSubject<void>(undefined);

    const request$ = toObservable(store.request);
    const requestWithValue$ = request$.pipe(
      filter((request) => request !== null),
    );
    const refreshInterval$ = toObservable(store.refreshInterval);

    const sendCommandInterval$ = combineLatest([
      refresh$.asObservable(),
      requestWithValue$,
      refreshInterval$,
    ]).pipe(
      switchMap(([, request, refreshInterval]) => {
        if (!request) {
          return of(null);
        }

        return interval(refreshInterval).pipe(
          startWith(0),
          switchMap(() => {
            patchState(store, { _loading: true });

            return connectionApiService.getSTDCommandByImei(request).pipe(
              map((res) => {
                if (!res.data) return null;

                return res.data;
              }),
              tap((processedData) => {
                patchState(store, {
                  data: processedData,
                  _loading: false,
                  error: null,
                });
              }),
              catchError(() => {
                patchState(store, {
                  _loading: false,
                  error: 'Lỗi khi tải dữ liệu thiết bị',
                });
                return of(null);
              }),
            );
          }),
        );
      }),
    );

    const methods = {
      load: rxMethod<void>(switchMap(() => sendCommandInterval$)),

      refresh: (): void => {
        refresh$.next();
      },

      startAutoRefresh: (): void => {
        methods.load();
      },

      setRefreshInterval: (interval: number): void => {
        patchState(store, { refreshInterval: interval });
      },

      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },

      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },

      setRequest: (request: GetSTDCommandReq): void => {
        patchState(store, { request });
      },
    };

    return methods;
  }),
);

import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  interval,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { TrafficApiService } from '@shared/services';
import {
  CommonStoreInitialState,
  TrafficDto
} from '@shared/types';

const initialState: Omit<CommonStoreInitialState<TrafficDto>, 'searchTerm'> & {
  refreshInterval: number;
} = {
  data: null,
  _loading: false,
  error: null,
  refreshInterval: 10000,
};

export const TrafficStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading }) => ({
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
  })),
  withMethods((store) => {
    const trafficApiService = inject(TrafficApiService);

    const refreshStatus$ = new BehaviorSubject<void>(undefined);

    const deviceStatusInterval$ = combineLatest([
      refreshStatus$.asObservable(),
      interval(store.refreshInterval()).pipe(startWith(0)),
    ]).pipe(
      tap(() => patchState(store, { _loading: true, error: null })),
      switchMap(() => {
        return trafficApiService.getTraffic().pipe(
          map((res) => {
            if (!res) return null;

            return res;
          }),
          tap((processedData) => {
            patchState(store, {
              data: processedData,
              _loading: false,
              error: null,
            });
          }),
          catchError((error) => {
            console.log('error', error);
            patchState(store, {
              _loading: false,
              error: error.message || 'Lỗi khi tải dữ liệu traffic',
            });
            return of(null);
          }),
        );
      }),
    );

    const methods = {
      ensureData: (): void => {
        if (!store.data()) {
          methods.startAutoRefresh();
        }
      },

      load: rxMethod<void>(switchMap(() => deviceStatusInterval$)),

      refresh: (): void => {
        refreshStatus$.next();
      },

      startAutoRefresh: (): void => {
        methods.load();
      },

      setRefreshInterval: (interval: number): void => {
        patchState(store, { refreshInterval: interval });
      },
    };

    return methods;
  }),
);

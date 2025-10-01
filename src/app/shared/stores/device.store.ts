import { computed, inject } from '@angular/core';
import { DateService } from '@core/services';
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
  DeviceStatus,
  DeviceStatusDto
} from '@shared/types';
import { getFormattedDevice } from '@shared/utils';
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
import { ConnectionStore } from './connection.store';

const initialState: CommonStoreInitialState<DeviceStatus[]> & {
  refreshInterval: number;
} = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
  refreshInterval: 10000,
};

export const DeviceStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading, searchTerm, error }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
    isError: computed(() => !_loading() && !data() && error()),
    firstTimeHasData: computed(() => data() !== null),
    filteredData: computed(() => {
      const allDevices = data();
      const search = searchTerm().toLowerCase().trim();

      if (!allDevices || !search) {
        return allDevices;
      }

      return allDevices.filter((device) =>
        device.last.imei.toLowerCase().includes(search),
      );
    }),
  })),
  withMethods((store) => {
    const connectionApiService = inject(ConnectionApiService);
    const connectionStore = inject(ConnectionStore);
    const dateService = inject(DateService);

    const refreshStatus$ = new BehaviorSubject<void>(undefined);

    const allConnections$ = connectionApiService.getAllConnectionByGroup().pipe(
      catchError(() => {
        patchState(store, {
          _loading: false,
          error: 'Lỗi khi tải dữ liệu',
        });
        return of(null);
      }),
    );

    const deviceStatusInterval$ = combineLatest([
      allConnections$,
      refreshStatus$.asObservable(),
      interval(store.refreshInterval()).pipe(startWith(0)),
    ]).pipe(
      tap(() => patchState(store, { _loading: true, error: null })),
      switchMap(([allConnections]) => {
        if (!allConnections) {
          patchState(store, {
            _loading: false,
            error: 'Lỗi khi tải dữ liệu',
          });
          return of(null);
        }

        connectionStore.patchData(allConnections.data ?? []);

        const imeis = allConnections.data?.map((c) => c.imei).join(',') ?? '';

        return connectionApiService.fetchDeviceStatus({ imeis, time: 0 }).pipe(
          map((res) => {
            if (!res.data) return null;

            return res.data.map((item: DeviceStatusDto) => ({
              ...item,
              formatted: getFormattedDevice(item, dateService),
            }));
          }),
          tap((processedData) => {
            patchState(store, {
              data: processedData,
              _loading: false,
              error: null,
            });
          }),
          catchError((error) => {
            patchState(store, {
              _loading: false,
              error: error.message || 'Lỗi khi tải dữ liệu thiết bị',
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

      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },

      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },
    };

    return methods;
  }),
);

import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';

import { ConnectionApiService } from '@shared/services';
import {
  CommonStoreInitialState,
  FormattedPackage,
  GetRawPackageReq,
  Package,
  PackageDto,
  PackageType,
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

const initialState: CommonStoreInitialState<Package[]> & {
  refreshInterval: number;
  request: GetRawPackageReq | null;
} = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
  refreshInterval: 10000,
  request: null,
};

export const PackageStore = signalStore(
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

    const packageInterval$ = combineLatest([
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

            return connectionApiService.getRawPackageByImei(request).pipe(
              map((res) => {
                if (!res.data) return null;

                return res.data.map((item: PackageDto) => ({
                  ...item,
                  formatted: getFormattedPackage(item),
                }));
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
      load: rxMethod<void>(switchMap(() => packageInterval$)),

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

      setRequest: (request: GetRawPackageReq): void => {
        patchState(store, { request });
      },
    };

    return methods;
  }),
);

function getFormattedPackage(packageDto: PackageDto): FormattedPackage {
  return {
    type: getPackageType(packageDto.p),
  };
}

function getPackageType(packageType: number): {
  label: string;
  value: number;
  color: string;
} {
  return PackageType[packageType as keyof typeof PackageType];
}

import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

import { ServiceKeyApiService } from '@shared/services';
import {
  CommonStoreInitialState,
  ServiceKeyDto,
  ServiceKeyReq,
} from '@shared/types';

const initialState: CommonStoreInitialState<ServiceKeyDto[]> & {
  request: ServiceKeyReq | undefined;
} = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
  request: undefined,
};

export const ServiceKeyStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading, searchTerm, error }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
    isError: computed(() => !_loading() && !data() && error()),
    filteredData: computed(() => {
      const allData = data();
      const search = searchTerm().toLowerCase().trim();

      if (!allData) {
        return [];
      }

      if (!search) {
        return allData;
      }

      return allData.filter((data) =>
        data.keyCode.toLowerCase().includes(search),
      );
    }),
  })),
  withMethods((store) => {
    const serviceKeyApiService = inject(ServiceKeyApiService);

    const methods = {
      ensureData: (): void => {
        if (!store.data()) {
          methods.load(store.request());
        }
      },
      load: rxMethod<ServiceKeyReq | undefined>(
        pipe(
          tap((request) => {
            patchState(store, {
              _loading: true,
              error: null,
              request: request,
            });
          }),
          switchMap((request) =>
            serviceKeyApiService.getServiceKeys(request).pipe(
              tap((response) => {
                patchState(store, {
                  data: response.data ?? [],
                  _loading: false,
                  error: null,
                });
              }),
              catchError(() => {
                patchState(store, {
                  _loading: false,
                  error: 'Lỗi khi tải dữ liệu',
                });
                return of(null);
              }),
            ),
          ),
        ),
      ),
      refresh: (): void => {
        methods.load(store.request());
      },
      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },
      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },
      patchData: (data: ServiceKeyDto[]): void => {
        patchState(store, { data });
      },
      setRequest: (request: ServiceKeyReq): void => {
        patchState(store, { request });
      },
    };

    return methods;
  }),
  withHooks({
    onInit: (store) => {
      store.ensureData();
    },
  }),
);

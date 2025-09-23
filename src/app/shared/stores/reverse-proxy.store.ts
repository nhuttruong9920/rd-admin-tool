import { computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

import { ReverseProxyApiService } from '@shared/services';
import { CommonStoreInitialState, ReverseProxyDto } from '@shared/types';

const initialState: CommonStoreInitialState<ReverseProxyDto[]> = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
};

export const ReverseProxyStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading, searchTerm }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
    firstTimeHasData: computed(() => data() !== null),
    filteredData: computed(() => {
      const allProxies = data();
      const search = searchTerm().toLowerCase().trim();

      if (!allProxies) {
        return [];
      }

      if (!search) {
        return allProxies;
      }

      return allProxies.filter((proxy) =>
        proxy.id.toLowerCase().includes(search),
      );
    }),
  })),
  withMethods((store) => {
    const reverseProxyApiService = inject(ReverseProxyApiService);

    const methods = {
      ensureData: (): void => {
        if (!store.data()) {
          methods.load();
        }
      },
      load: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { _loading: true, error: null })),
          switchMap(() =>
            reverseProxyApiService.getAllReverseProxies().pipe(
              tap((response) => {
                patchState(store, {
                  data: response ?? [],
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
        methods.load();
      },
      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },
      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },
      patchData: (data: ReverseProxyDto[]): void => {
        patchState(store, { data });
      },
    };

    return methods;
  }),
);

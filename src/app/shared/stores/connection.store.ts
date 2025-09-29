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

import { ConnectionApiService } from '@shared/services';
import { CommonStoreInitialState, ConnectionDto } from '@shared/types';

const initialState: CommonStoreInitialState<ConnectionDto[]> = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
};

export const ConnectionStore = signalStore(
  withState(initialState),
  withComputed(({ data, _loading, searchTerm, error }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
    isError: computed(() => !_loading() && !data() && error()),
    filteredData: computed(() => {
      const allConnections = data();
      const search = searchTerm().toLowerCase().trim();

      if (!allConnections || !search) {
        return allConnections;
      }

      return allConnections.filter((connection) =>
        connection.imei.toLowerCase().includes(search),
      );
    }),
  })),
  withMethods((store) => {
    const connectionApiService = inject(ConnectionApiService);

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
            connectionApiService.getAllConnectionByGroup().pipe(
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
        methods.load();
      },
      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },
      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },
      patchData: (data: ConnectionDto[]): void => {
        patchState(store, { data });
      },
    };

    return methods;
  }),
);

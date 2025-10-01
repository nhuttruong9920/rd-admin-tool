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
import { CommonStoreInitialState, KeyApplicationDto } from '@shared/types';

const initialState: CommonStoreInitialState<KeyApplicationDto[]> = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
};

export const KeyApplicationStore = signalStore(
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
        data.appName.toLowerCase().includes(search),
      );
    }),
  })),
  withMethods((store) => {
    const serviceKeyApiService = inject(ServiceKeyApiService);

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
            serviceKeyApiService.getKeyApplications().pipe(
              tap((response) => {
                patchState(store, {
                  data: response.data,
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
      patchData: (data: KeyApplicationDto[]): void => {
        patchState(store, { data });
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

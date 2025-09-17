import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DogApiResponse, DogState } from '../types';

const initialState: DogState = {
  breeds: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalRecords: 0,
  searchTerm: '',
  allBreeds: [], // Store all loaded breeds for filtering
  autoRefresh: false,
  refreshInterval: null,
};

export const DogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({ breeds, loading, error, searchTerm, allBreeds, autoRefresh }) => ({
      breedsCount: computed(() => breeds().length),
      hasBreeds: computed(() => breeds().length > 0),
      hasError: computed(() => !!error()),
      errorMessage: computed(() => error()),
      isSearching: computed(() => searchTerm().trim().length > 0),
      totalLoadedBreeds: computed(() => allBreeds().length),
      // isFetching: loading state when no data exists yet (initial load)
      isFetching: computed(() => loading() && !breeds().length),
      // isLoading: loading state when data already exists (refetch/load more)
      isLoading: computed(() => loading() && breeds().length > 0),
      filteredBreeds: computed(() => {
        const search = searchTerm().toLowerCase().trim();
        if (!search) return breeds();

        return breeds().filter(
          (breed) =>
            breed.attributes.name.toLowerCase().includes(search) ||
            breed.attributes.description.toLowerCase().includes(search),
        );
      }),
      isAutoRefreshEnabled: computed(() => autoRefresh()),
    }),
  ),
  withMethods((store, http = inject(HttpClient)) => {
    const methods = {
      // Auto-load breeds if not already loaded
      ensureBreeds: (): void => {
        if (!store.hasBreeds() && !store.isFetching()) {
          methods.loadBreeds({ page: 1 });
        }
      },
      loadBreeds: rxMethod<{ page?: number }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ page = 1 }) =>
            http
              .get<DogApiResponse>(
                `https://dogapi.dog/api/v2/breeds?page[number]=${page}`,
              )
              .pipe(
                tap({
                  next: (response: DogApiResponse) => {
                    patchState(store, {
                      breeds: response.data,
                      allBreeds: response.data, // Reset allBreeds when loading first page
                      loading: false,
                      error: null,
                      currentPage: response.meta.pagination.current,
                      totalPages: response.meta.pagination.last,
                      totalRecords: response.meta.pagination.records,
                    });
                  },
                  error: (error: unknown) => {
                    console.error('Error loading dog breeds:', error);
                    patchState(store, {
                      loading: false,
                      error: 'Failed to load dog breeds. Please try again.',
                    });
                  },
                }),
              ),
          ),
        ),
      ),
      loadMoreBreeds: rxMethod<{ page: number }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ page }) =>
            http
              .get<DogApiResponse>(
                `https://dogapi.dog/api/v2/breeds?page[number]=${page}`,
              )
              .pipe(
                tap({
                  next: (response: DogApiResponse) => {
                    const newAllBreeds = [
                      ...store.allBreeds(),
                      ...response.data,
                    ];
                    patchState(store, {
                      breeds: newAllBreeds,
                      allBreeds: newAllBreeds,
                      loading: false,
                      error: null,
                      currentPage: response.meta.pagination.current,
                      totalPages: response.meta.pagination.last,
                      totalRecords: response.meta.pagination.records,
                    });
                  },
                  error: (error: unknown) => {
                    console.error('Error loading more dog breeds:', error);
                    patchState(store, {
                      loading: false,
                      error:
                        'Failed to load more dog breeds. Please try again.',
                    });
                  },
                }),
              ),
          ),
        ),
      ),
      clearError: (): void => patchState(store, { error: null }),
      reset: (): void => patchState(store, initialState),
      // Search functionality
      setSearchTerm: (term: string): void => {
        patchState(store, { searchTerm: term });
      },
      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },
      // Auto-refresh functionality
      startAutoRefresh: (): void => {
        if (store.refreshInterval()) {
          clearInterval(store.refreshInterval()!);
        }

        const intervalId = setInterval(() => {
          if (!store.loading()) {
            methods.loadBreeds({ page: 1 });
          }
        }, 1000); // 10 seconds

        patchState(store, {
          autoRefresh: true,
          refreshInterval: intervalId as number,
        });
      },
      stopAutoRefresh: (): void => {
        if (store.refreshInterval()) {
          clearInterval(store.refreshInterval()!);
        }
        patchState(store, {
          autoRefresh: false,
          refreshInterval: null,
        });
      },
      toggleAutoRefresh: (): void => {
        if (store.autoRefresh()) {
          methods.stopAutoRefresh();
        } else {
          methods.startAutoRefresh();
        }
      },
    };
    return methods;
  }),
);

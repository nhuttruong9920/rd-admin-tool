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
  GetDeviceHistoryReq,
  HistoryWaypoint,
  HistoryWaypointDto,
} from '@shared/types';
import {
  getFormattedWaypoint,
  getHistoryChargeRanges,
  getHistoryStopRanges,
} from '@shared/utils';
import { catchError, map, of, switchMap, tap } from 'rxjs';

type HistoryDetailState = {
  data: HistoryWaypoint[] | null;
  _loading: boolean;
  error: string | null;
};

const initialState: HistoryDetailState = {
  data: null,
  _loading: false,
  error: null,
};

export const HistoryDetailStore = signalStore(
  withState(initialState),

  withComputed(({ data, _loading, error }) => {
    const dateService = inject(DateService);
    return {
      waypointCount: computed(() => data()?.length ?? 0),
      isFetching: computed(() => _loading() && !data()),
      isLoading: computed(() => _loading() && data() !== null),
      isError: computed(() => !_loading() && !data() && error()),
      stopRanges: computed(() => getHistoryStopRanges(data(), dateService)),
      chargeRanges: computed(() => getHistoryChargeRanges(data(), dateService)),
    };
  }),
  withMethods((store) => {
    const connectionApiService = inject(ConnectionApiService);
    const dateService = inject(DateService);

    const methods = {
      fetchHistory: rxMethod<GetDeviceHistoryReq>(
        switchMap((request) => {
          patchState(store, {
            _loading: true,
            error: null,
          });

          return connectionApiService.fetchDeviceHistory(request).pipe(
            map((response) => {
              if (!response) return null;
              return response.map((item: HistoryWaypointDto) => ({
                ...item,
                formatted: getFormattedWaypoint(item, dateService),
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
                error: 'Lỗi khi tải dữ liệu lịch sử',
                data: null,
              });
              return of(null);
            }),
          );
        }),
      ),
    };

    return methods;
  }),
);

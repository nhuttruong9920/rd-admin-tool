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
  DeviceState,
  DeviceStatus,
  DeviceStatusDto,
  HistoryWaypointDto,
  OdoMeter,
  OdoMeterData,
  OdoMeterMode,
  StatusDto,
} from '@shared/types';
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
  withComputed(({ data, _loading, searchTerm }) => ({
    count: computed(() => data()?.length ?? 0),
    isFetching: computed(() => _loading() && !data()),
    isLoading: computed(() => _loading() && data() !== null),
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

            return res.data.map((item: DeviceStatusDto) => {
              const selectedTime = Math.max(item.gpsTime, item.pingTime);
              return {
                ...item,
                currentState: getDeviceState(
                  item.last.status,
                  selectedTime,
                  item.last.speed,
                  item.last.maxSpeed,
                  dateService,
                ),
                iconClass: getDeviceIconClass(
                  item.last.status,
                  selectedTime,
                  item.last.speed,
                  item.last.maxSpeed,
                  dateService,
                ),
                parsedParams: JSON.parse(item.last.params),
                parsedOdoMeter: parseOdoMeter(item.last),
              };
            });
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
      ensureDevices: (): void => {
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

// Helper functions for device processing
function getDeviceState(
  status: number,
  gpsTime: number,
  speed: number,
  maxSpeed: number,
  dateService: DateService,
): DeviceState {
  if (status === 0) {
    const gpsDate = dateService.getDate(gpsTime);
    const isMoreThan30mins = Date.now() - gpsDate.getTime() > 30 * 60 * 1000;
    if (isMoreThan30mins) {
      return 'disconnected';
    }
    return 'offline';
  }
  if (status === 1) {
    const vehicleMaxSpeed = maxSpeed ?? 8000;
    if (speed > vehicleMaxSpeed) {
      return 'overspeed';
    }
    if (speed > 0) {
      return 'running';
    }
    return 'stop';
  }
  return 'disconnected';
}

function getDeviceIconClass(
  status: number,
  gpsTime: number,
  speed: number,
  maxSpeed: number,
  dateService: DateService,
): string {
  const state = getDeviceState(status, gpsTime, speed, maxSpeed, dateService);
  return `bg-car_${state}`;
}

function getBatteryIcon(batteryNumber: number, isCharging: boolean): string {
  if (isCharging) return 'fa-battery-bolt';
  if (batteryNumber === 100) return 'fa-battery-full';
  if (batteryNumber >= 75) return 'fa-battery-three-quarters';
  if (batteryNumber >= 50) return 'fa-battery-half';
  if (batteryNumber >= 25) return 'fa-battery-quarter';
  if (batteryNumber >= 5) return 'fa-battery-low';
  if (batteryNumber >= 0) return 'fa-battery-empty';
  return 'fa-battery-exclamation';
}

function getBatteryColorClass(batteryNumber: number): {
  containerBgClass: string;
  textClass: string;
  iconBgClass: string;
  progressBarClass: string;
} {
  const classes = {
    containerBgClass: '',
    textClass: '',
    iconBgClass: '',
    progressBarClass: '',
  };
  if (batteryNumber > 50) {
    classes.containerBgClass =
      'from-green-500/10 to-green-500/30 border-green-500/30';
    classes.textClass = 'text-green-800 dark:text-green-200';
    classes.iconBgClass = 'bg-green-500';
    classes.progressBarClass = 'bg-green-500';
  } else if (batteryNumber > 25) {
    classes.containerBgClass =
      'from-yellow-500/10 to-yellow-500/30 border-yellow-500/30';
    classes.textClass = 'text-yellow-800 dark:text-yellow-200';
    classes.iconBgClass = 'bg-yellow-500';
    classes.progressBarClass = 'bg-yellow-500';
  } else {
    classes.containerBgClass =
      'from-red-500/10 to-red-500/30 border-red-500/30';
    classes.textClass = 'text-red-800 dark:text-red-200';
    classes.iconBgClass = 'bg-red-500';
    classes.progressBarClass = 'bg-red-500';
  }
  return classes;
}

function getOdoMeterMode(modeId: string): OdoMeterMode {
  const modes = [
    {
      id: '0',
      icon: 'fa-steering-wheel',
      name: 'Normal',
      classes: 'bg-gray-500 border-gray-500 text-white',
    },
    {
      id: '1',
      icon: 'fa-seedling',
      name: 'Eco',
      classes: 'bg-green-500 border-green-500 text-white',
    },
  ];

  const mode = modes.find((m) => m.id === modeId);
  return mode || modes[0];
}

function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map((d) => parseInt(d, 16).toString(2).padStart(4, '0'))
    .join('');
}

function getOdoMeterTime(
  time1: string,
  time2: string,
  time3: string,
  time4: string,
): string {
  const hex1 = parseInt(time1).toString(16).padStart(2, '0');
  const hex2 = parseInt(time2).toString(16).padStart(2, '0');
  const hex3 = parseInt(time3).toString(16).padStart(2, '0');
  const hex4 = parseInt(time4).toString(16).padStart(2, '0');

  const binary = hexToBinary(`${hex1}${hex2}${hex3}${hex4}`);

  const padTwo = (num: number): string => num.toString().padStart(2, '0');

  const year = parseInt(binary.slice(0, 6), 2);
  const month = padTwo(parseInt(binary.slice(6, 10), 2));
  const day = padTwo(parseInt(binary.slice(10, 15), 2));
  const hour = padTwo(parseInt(binary.slice(15, 20), 2));
  const minute = padTwo(parseInt(binary.slice(20, 26), 2));
  const second = padTwo(parseInt(binary.slice(26, 32), 2));

  return `${day}/${month}/20${year} ${hour}:${minute}:${second}`;
}

function getOdoMeterVoltage(voltage1: string, voltage2: string): number {
  const hex1 = parseInt(voltage1).toString(16).padStart(2, '0');
  const hex2 = parseInt(voltage2).toString(16).padStart(2, '0');
  const decimal = parseInt(`${hex1}${hex2}`, 16);
  return Number.isNaN(decimal) ? 0 : decimal / 10;
}

function getOdoMeterOdometer(
  odometer1: string,
  odometer2: string,
  odometer3: string,
): number {
  const hex1 = parseInt(odometer1).toString(16).padStart(2, '0');
  const hex2 = parseInt(odometer2).toString(16).padStart(2, '0');
  const hex3 = parseInt(odometer3).toString(16).padStart(2, '0');
  const decimal = parseInt(`${hex1}${hex2}${hex3}`, 16);
  return Number.isNaN(decimal) ? 0 : decimal / 16;
}

function parseOdoMeter(
  waypoint: StatusDto | HistoryWaypointDto,
): OdoMeterData | null {
  const parsedParams = JSON.parse(waypoint.params);
  if (!parsedParams?.OdoMeter) {
    return null;
  }
  const odoMeter = JSON.parse(parsedParams.OdoMeter) as OdoMeter;

  if (!odoMeter) {
    return null;
  }

  const batteryNumber = parseInt(odoMeter[1]);
  const isCharging = odoMeter[3] === '1';
  const mode = getOdoMeterMode(odoMeter[0]);
  const speed = odoMeter[4] ? parseInt(odoMeter[4]) : 0;
  const time = getOdoMeterTime(
    odoMeter[5],
    odoMeter[6],
    odoMeter[7],
    odoMeter[8],
  );
  const voltage = getOdoMeterVoltage(odoMeter[9], odoMeter[10]);
  const odometer = getOdoMeterOdometer(
    odoMeter[11],
    odoMeter[12],
    odoMeter[13],
  );
  return {
    mode,
    battery: batteryNumber,
    batteryIcon: getBatteryIcon(batteryNumber, isCharging),
    batteryColorClass: getBatteryColorClass(batteryNumber),
    range: Number(odoMeter[2]),
    isCharging,
    speed: speed,
    time,
    voltage,
    odometer,
  };
}

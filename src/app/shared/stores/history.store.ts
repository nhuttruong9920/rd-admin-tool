import { computed, inject } from '@angular/core';
import { DateService } from '@core/services';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ConnectionApiService } from '@shared/services';
import {
  CommonStoreInitialState,
  DeviceState,
  FormattedInfo,
  FormattedWaypoint,
  GetDeviceHistoryReq,
  HistoryStopRange,
  HistoryWaypoint,
  HistoryWaypointDto,
  OdoMeter,
} from '@shared/types';
import { catchError, map, of, switchMap, tap } from 'rxjs';

const initialState: CommonStoreInitialState<HistoryWaypoint[]> = {
  data: null,
  _loading: false,
  error: null,
  searchTerm: '',
};

export const HistoryStore = signalStore(
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
            data: null,
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
            catchError((error) => {
              console.error('History fetch error:', error);
              patchState(store, {
                _loading: false,
                error: error.message || 'Lỗi khi tải dữ liệu lịch sử',
                data: null,
              });
              return of(null);
            }),
          );
        }),
      ),

      setSearchTerm: (searchTerm: string): void => {
        patchState(store, { searchTerm });
      },

      clearSearch: (): void => {
        patchState(store, { searchTerm: '' });
      },

      clearData: (): void => {
        patchState(store, {
          data: null,
          error: null,
        });
      },
    };

    return methods;
  }),
  withHooks({
    onInit() {
      console.log('HistoryStore onInit');
    },
    onDestroy() {
      console.log('HistoryStore onDestroy');
    },
  }),
);

// Helper functions for device processing

function getFormattedWaypoint(
  deviceStatusDto: HistoryWaypointDto,
  dateService: DateService,
): FormattedWaypoint {
  const parsedOdoMeter = parseOdoMeter(deviceStatusDto.params);
  return {
    id: deviceStatusDto.unitId,
    address: deviceStatusDto.info?.trim() || 'Không xác định',
    gpsTime: dateService.getFormattedDate(deviceStatusDto.gpsTime),
    state: getDeviceState(
      deviceStatusDto.status,
      deviceStatusDto.gpsTime,
      deviceStatusDto.speed,
      80000,
      dateService,
    ),
    lat: deviceStatusDto.y / 1e6,
    long: deviceStatusDto.x / 1e6,
    heading: deviceStatusDto.heading * 2,
    stateColor: getDeviceStateColor(
      getDeviceState(
        deviceStatusDto.status,
        deviceStatusDto.gpsTime,
        deviceStatusDto.speed,
        80000,
        dateService,
      ),
    ),
    mode: getOdoMeterMode(parsedOdoMeter),
    battery: getBatteryInfo(parsedOdoMeter),
    gpsSpeed: getGpsSpeed(deviceStatusDto.speed),
    range: getRange(parsedOdoMeter),
    vehicleSpeed: getVehicleSpeed(parsedOdoMeter),
    odoTime: getOdoTime(parsedOdoMeter),
    voltage: getVoltage(parsedOdoMeter),
    odometer: getOdometer(parsedOdoMeter),
  };
}

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
    const vehicleMaxSpeed = maxSpeed || 8000;
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

function getOdoMeterMode(
  parsedOdoMeter: OdoMeter | null,
): FormattedInfo | null {
  if (!parsedOdoMeter) {
    return null;
  }
  const modeId = parsedOdoMeter[0];
  const modes = [
    {
      title: 'Normal',
      value: 'Normal',
      icon: 'fas fa-steering-wheel',
      iconClass: 'text-surface-500 dark:text-surface-400',
    },
    {
      title: 'Eco',
      value: 'Eco',
      icon: 'fas fa-seedling',
      iconClass: 'text-green-500 dark:text-green-400',
    },
  ];

  const mode = modes.find((m, index) => index === +modeId);
  return mode || modes[0];
}

function getBatteryInfo(
  parsedOdoMeter: OdoMeter | null,
): FormattedInfo & { isCharging: boolean } {
  if (!parsedOdoMeter) {
    return {
      title: 'Pin',
      value: 'N/A',
      icon: 'fas fa-battery-exclamation',
      iconClass: 'text-surface-500 dark:text-surface-400',
      isCharging: false,
    };
  }
  const batteryValue = +parsedOdoMeter[1];
  const isCharging = parsedOdoMeter[3] === '1';

  let icon = 'fas fa-battery-exclamation';
  if (isCharging) {
    icon = 'fas fa-battery-bolt';
  } else if (batteryValue === 100) {
    icon = 'fas fa-battery-full';
  } else if (batteryValue >= 75) {
    icon = 'fas fa-battery-three-quarters';
  } else if (batteryValue >= 50) {
    icon = 'fas fa-battery-half';
  } else if (batteryValue >= 25) {
    icon = 'fas fa-battery-quarter';
  } else if (batteryValue >= 5) {
    icon = 'fas fa-battery-low';
  } else if (batteryValue >= 0) {
    icon = 'fas fa-battery-empty';
  }

  const iconClass =
    batteryValue > 50
      ? 'text-green-500 dark:text-green-400'
      : batteryValue > 25
        ? 'text-yellow-500 dark:text-yellow-400'
        : 'text-red-500 dark:text-red-400';

  return {
    title: 'Pin',
    value: batteryValue,
    unit: '%',
    icon: icon,
    iconClass: iconClass,
    isCharging,
  };
}

function getRange(parsedOdoMeter: OdoMeter | null): FormattedInfo {
  if (!parsedOdoMeter) {
    return {
      title: 'QĐ còn lại',
      value: 'N/A',
      icon: 'fas fa-road',
      iconClass: 'text-teal-500 dark:text-teal-400',
    };
  }

  const range = parsedOdoMeter[2];
  return {
    title: 'QĐ còn lại',
    value: range,
    unit: 'km',
    icon: 'fas fa-road',
    iconClass: 'text-teal-500 dark:text-teal-400',
  };
}

function getGpsSpeed(speed: number): FormattedInfo {
  return {
    title: 'Vận tốc GSP',
    value: speed / 100,
    unit: 'km/h',
    icon: 'fas fa-microchip',
    iconClass: 'text-violet-500 dark:text-violet-400',
  };
}

function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map((d) => parseInt(d, 16).toString(2).padStart(4, '0'))
    .join('');
}

function getVehicleSpeed(parsedOdoMeter: OdoMeter | null): FormattedInfo {
  if (!parsedOdoMeter) {
    return {
      title: 'Vận tốc xe',
      value: 'N/A',
      icon: 'fas fa-car',
      iconClass: 'text-fuchsia-500 dark:text-fuchsia-400',
    };
  }
  const vehicleSpeed = parsedOdoMeter[4];
  return {
    title: 'Vận tốc xe',
    value: vehicleSpeed,
    unit: 'km/h',
    icon: 'fas fa-car',
    iconClass: 'text-fuchsia-500 dark:text-fuchsia-400',
  };
}

function getOdoTime(parsedOdoMeter: OdoMeter | null): FormattedInfo {
  if (!parsedOdoMeter) {
    return {
      title: 'Thời gian',
      value: 'N/A',
      icon: 'fas fa-clock',
      iconClass: 'text-emerald-500 dark:text-emerald-400',
    };
  }

  // Convert odoMeter time parts into binary
  const [t1, t2, t3, t4] = [
    parsedOdoMeter[5],
    parsedOdoMeter[6],
    parsedOdoMeter[7],
    parsedOdoMeter[8],
  ];
  const hex1 = parseInt(t1).toString(16).padStart(2, '0');
  const hex2 = parseInt(t2).toString(16).padStart(2, '0');
  const hex3 = parseInt(t3).toString(16).padStart(2, '0');
  const hex4 = parseInt(t4).toString(16).padStart(2, '0');

  const binary = hexToBinary(`${hex1}${hex2}${hex3}${hex4}`);

  const padTwo = (num: number): string => num.toString().padStart(2, '0');

  const year = parseInt(binary.slice(0, 6), 2);
  const month = padTwo(parseInt(binary.slice(6, 10), 2));
  const day = padTwo(parseInt(binary.slice(10, 15), 2));
  const hour = padTwo(parseInt(binary.slice(15, 20), 2));
  const minute = padTwo(parseInt(binary.slice(20, 26), 2));
  const second = padTwo(parseInt(binary.slice(26, 32), 2));

  const odoTime = `${day}/${month}/20${year} ${hour}:${minute}:${second}`;

  return {
    title: 'Thời gian',
    value: odoTime,
    icon: 'fas fa-clock',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
  };
}

function getVoltage(parsedOdoMeter: OdoMeter | null): FormattedInfo {
  if (!parsedOdoMeter) {
    return {
      title: 'Điện áp',
      value: 'N/A',
      icon: 'fas fa-bolt',
      iconClass: 'text-orange-500 dark:text-orange-400',
    };
  }

  const [voltage1, voltage2] = [parsedOdoMeter[9], parsedOdoMeter[10]];
  const hex1 = parseInt(voltage1).toString(16).padStart(2, '0');
  const hex2 = parseInt(voltage2).toString(16).padStart(2, '0');
  const decimal = parseInt(`${hex1}${hex2}`, 16);
  const voltage = Number.isNaN(decimal) ? 0 : decimal / 10;

  return {
    title: 'Điện áp',
    value: voltage.toFixed(2),
    unit: 'V',
    icon: 'fas fa-bolt',
    iconClass: 'text-orange-500 dark:text-orange-400',
  };
}

function getOdometer(parsedOdoMeter: OdoMeter | null): FormattedInfo {
  if (!parsedOdoMeter) {
    return {
      title: 'Odo',
      value: 'N/A',
      icon: 'fas fa-meter',
      iconClass: 'text-lime-500 dark:text-lime-400',
    };
  }
  const [odometer1, odometer2, odometer3] = [
    parsedOdoMeter[11],
    parsedOdoMeter[12],
    parsedOdoMeter[13],
  ];

  const hex1 = parseInt(odometer1).toString(16).padStart(2, '0');
  const hex2 = parseInt(odometer2).toString(16).padStart(2, '0');
  const hex3 = parseInt(odometer3).toString(16).padStart(2, '0');
  const decimal = parseInt(`${hex1}${hex2}${hex3}`, 16);
  const odometer = Number.isNaN(decimal) ? 0 : decimal / 16;

  return {
    title: 'Odo',
    value: odometer.toLocaleString(),
    unit: 'km',
    icon: 'fas fa-meter',
    iconClass: 'text-lime-500 dark:text-lime-400',
  };
}

function parseOdoMeter(paramsString: string): OdoMeter | null {
  try {
    const parsedParams = JSON.parse(paramsString);
    if (!parsedParams?.OdoMeter) {
      return null;
    }
    return (JSON.parse(parsedParams.OdoMeter) as OdoMeter) ?? null;
  } catch (error) {
    console.log('error', error);
    return null;
  }
}

function getDeviceStateColor(deviceState: DeviceState): string {
  switch (deviceState) {
    case 'disconnected':
    case 'offline':
      return '#495057';
    case 'stop':
      return '#fcc419';
    case 'running':
      return '#51cf66';
    case 'overspeed':
      return '#ff6b6b';
    default:
      return '#495057';
  }
}

function getHistoryStopRanges(
  historyData: HistoryWaypoint[] | null,
  dateService: DateService,
): HistoryStopRange[] {
  if (!historyData) return [];

  const minDurationSecs = 60;

  const stopRanges = [];
  let currentRange = null;

  for (let i = 0; i < historyData.length; i++) {
    const point = historyData[i];

    if (point.formatted.state !== 'running' && !currentRange) {
      currentRange = {
        startIndex: i,
        fromTime: point.gpsTime,
        x: point.x,
        y: point.y,
        info: point.info,
        endIndex: i,
        duration: 0,
        toTime: point.gpsTime,
      };
    }

    if (point.formatted.state === 'running' && currentRange) {
      currentRange.endIndex = i;
      currentRange.toTime = point.gpsTime;
      currentRange.duration = currentRange.toTime - currentRange.fromTime;
      if (currentRange.duration > minDurationSecs) {
        stopRanges.push(currentRange);
      }
      currentRange = null;
    }
  }

  if (currentRange) {
    currentRange.endIndex = historyData.length - 1;
    currentRange.toTime = historyData[historyData.length - 1].gpsTime;
    currentRange.duration = currentRange.toTime - currentRange.fromTime;
    if (currentRange.duration > minDurationSecs) {
      stopRanges.push(currentRange);
    }
  }

  return stopRanges.map((stopRange) => ({
    startIndex: stopRange.startIndex,
    endIndex: stopRange.endIndex,
    lat: stopRange.y / 1e6,
    long: stopRange.x / 1e6,
    address: stopRange.info?.trim() || 'Không xác định',
    durationSecs: stopRange.duration,
    duration: dateService.formatSecondsToDuration(stopRange.duration),
    fromTime: dateService.getFormattedDate(stopRange.fromTime),
    toTime: dateService.getFormattedDate(stopRange.toTime),
  }));
}

function getHistoryChargeRanges(
  historyData: HistoryWaypoint[] | null,
  dateService: DateService,
): HistoryStopRange[] {
  if (!historyData || !historyData.length) return [];
  if (historyData[0].formatted.battery.isCharging) return [];

  const byPassInterval = 10; // passing uncharged points between charging points

  const chargingRanges = [];
  let currentRange = null;
  let nonChargingCount = 0; // counter for consecutive non-charging points

  for (let i = 0; i < historyData.length; i++) {
    const point = historyData[i];
    const isCharging = point.formatted.battery.isCharging || false;

    if (isCharging) {
      nonChargingCount = 0;

      if (!currentRange) {
        currentRange = {
          startIndex: i,
          fromTime: point.gpsTime,
          x: point.x,
          y: point.y,
          info: point.info,
          endIndex: i,
          duration: 0,
          toTime: point.gpsTime,
        };
      } else {
        currentRange.endIndex = i;
        currentRange.toTime = point.gpsTime;
        currentRange.duration = currentRange.toTime - currentRange.fromTime;
      }
    } else {
      if (currentRange) {
        nonChargingCount++;

        if (nonChargingCount >= byPassInterval) {
          currentRange.duration = currentRange.toTime - currentRange.fromTime;
          chargingRanges.push(currentRange);

          currentRange = null;
          nonChargingCount = 0;
        }
      }
    }
  }

  if (currentRange) {
    currentRange.duration = currentRange.toTime - currentRange.fromTime;
    chargingRanges.push(currentRange);
  }

  return chargingRanges.map((chargingRange) => ({
    startIndex: chargingRange.startIndex,
    endIndex: chargingRange.endIndex,
    lat: chargingRange.y / 1e6,
    long: chargingRange.x / 1e6,
    durationSecs: chargingRange.duration,
    address: chargingRange.info?.trim() || 'Không xác định',
    duration: dateService.formatSecondsToDuration(chargingRange.duration),
    fromTime: dateService.getFormattedDate(chargingRange.fromTime),
    toTime: dateService.getFormattedDate(chargingRange.toTime),
  }));
}

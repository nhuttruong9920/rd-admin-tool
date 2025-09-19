import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { RestService } from '@core/services';
import {
  Api,
  ConnectionDto,
  DeviceStatusDto,
  GetDeviceHistoryReq,
  GetDeviceStatusReq,
  GetInfoReq,
  GetRawPackageReq,
  GetSTDCommandReq,
  HistoryWaypointDto,
  PackageDto,
  SendCommandReq,
} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ConnectionApiService {
  #restService = inject(RestService);

  getAllConnectionByGroup(): Observable<Api<ConnectionDto[]>> {
    return this.#restService.get<Api<ConnectionDto[]>>(
      '/rd-dev/connection/getallbygroup',
    );
  }

  getRawPackageByImei(
    request: GetRawPackageReq,
  ): Observable<Api<PackageDto[]>> {
    return this.#restService.post<GetRawPackageReq, Api<PackageDto[]>>(
      '/rd-dev/connection/GetRawPackage',
      request,
    );
  }

  fetchConnectionInfo(request: GetInfoReq): Observable<Api<string>> {
    return this.#restService.post<GetInfoReq, Api<string>>(
      '/rd-dev/connection/GetInfo',
      request,
    );
  }

  getSTDCommandByImei(
    request: GetSTDCommandReq,
  ): Observable<Api<PackageDto[]>> {
    return this.#restService.post<GetSTDCommandReq, Api<PackageDto[]>>(
      '/rd-dev/connection/GetSTDCommand',
      request,
    );
  }

  sendCommand(request: SendCommandReq): Observable<Api<null>> {
    return this.#restService.post<SendCommandReq, Api<null>>(
      '/rd-dev/connection/SendCommand',
      request,
    );
  }

  fetchDeviceStatus(
    request: GetDeviceStatusReq,
  ): Observable<Api<DeviceStatusDto[]>> {
    return this.#restService.post<GetDeviceStatusReq, Api<DeviceStatusDto[]>>(
      '/rd-dev/connection/GetDeviceStatus',
      request,
    );
  }

  fetchDeviceHistory(
    request: GetDeviceHistoryReq,
  ): Observable<HistoryWaypointDto[]> {
    return this.#restService
      .post<
        GetDeviceHistoryReq,
        Api<string>
      >('/rd-dev/history/GetWaypointRequest', request)
      .pipe(
        map((res) => {
          if (!res.isSucceeded) throw new Error(res.message ?? '');
          try {
            return JSON.parse(res.data!);
          } catch (error) {
            console.error(error);
            throw new Error('Không thể xử lý dữ liệu lịch sử!');
          }
        }),
      );
  }
}

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

@Injectable()
export class ConnectionApiService {
  #restService = inject(RestService);

  getAllConnectionByGroup(): Observable<Api<ConnectionDto[]>> {
    return this.#restService.get<Api<ConnectionDto[]>>(
      '/connection/getallbygroup',
    );
  }

  getRawPackageByImei(
    request: GetRawPackageReq,
  ): Observable<Api<PackageDto[]>> {
    return this.#restService.post<GetRawPackageReq, Api<PackageDto[]>>(
      '/connection/GetRawPackage',
      request,
    );
  }

  fetchConnectionInfo(request: GetInfoReq): Observable<Api<string>> {
    return this.#restService.post<GetInfoReq, Api<string>>(
      '/connection/GetInfo',
      request,
    );
  }

  getSTDCommandByImei(
    request: GetSTDCommandReq,
  ): Observable<Api<PackageDto[]>> {
    return this.#restService.post<GetSTDCommandReq, Api<PackageDto[]>>(
      '/connection/GetSTDCommand',
      request,
    );
  }

  sendCommand(request: SendCommandReq): Observable<Api<null>> {
    return this.#restService.post<SendCommandReq, Api<null>>(
      '/connection/SendCommand',
      request,
    );
  }

  fetchDeviceStatus(
    request: GetDeviceStatusReq,
  ): Observable<Api<DeviceStatusDto[]>> {
    return this.#restService.post<GetDeviceStatusReq, Api<DeviceStatusDto[]>>(
      '/connection/GetDeviceStatus',
      request,
    );
  }

  fetchDeviceHistory(
    request: GetDeviceHistoryReq,
  ): Observable<Api<HistoryWaypointDto[]>> {
    return this.#restService
      .post<
        GetDeviceHistoryReq,
        Api<string>
      >('/History/GetWaypointRequest', request)
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

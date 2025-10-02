import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { SubscriptionRestService } from '@core/services';
import {
  Api2,
  AssignKeyDto,
  AssignKeyReq,
  GeneratedKeyDto,
  GenerateKeyBatchReq,
  KeyPackageReq,
  ServiceKeyDto,
  ServiceKeyReq,
} from '@shared/types';
import { KeyApplicationDto, KeyPackageDto } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ServiceKeyApiService {
  #restService = inject(SubscriptionRestService);

  getKeyApplications(): Observable<Api2<KeyApplicationDto[]>> {
    return this.#restService.get<Api2<KeyApplicationDto[]>>(
      '/admin/applications',
    );
  }

  getKeyPackages(request?: KeyPackageReq): Observable<Api2<KeyPackageDto[]>> {
    return this.#restService.get<Api2<KeyPackageDto[]>>(
      `/admin/packages`,
      request,
    );
  }

  getServiceKeys(
    request: ServiceKeyReq | undefined,
  ): Observable<Api2<ServiceKeyDto[]>> {
    return this.#restService.get<Api2<ServiceKeyDto[]>>(`/admin/keys`, request);
  }

  generateKeyBatch(
    request: GenerateKeyBatchReq,
  ): Observable<Api2<GeneratedKeyDto>> {
    return this.#restService.post<GenerateKeyBatchReq, Api2<GeneratedKeyDto>>(
      `/admin/keys/generate-batch`,
      request,
    );
  }

  assignKey(request: AssignKeyReq): Observable<Api2<AssignKeyDto>> {
    return this.#restService.post<AssignKeyReq, Api2<AssignKeyDto>>(
      `/admin/keys/assign`,
      request,
    );
  }
}

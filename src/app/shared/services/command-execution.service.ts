import { inject, Injectable } from '@angular/core';
import { ConnectionApiService } from './api/connection.api.service';
import { take } from 'rxjs';
import { ToastService } from '@core/services';
import { SendCommandReq } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class CommandExecutionService {
  #connectionApiService = inject(ConnectionApiService);
  #toastService = inject(ToastService);

  executeCommand(request: SendCommandReq): void {
    this.#connectionApiService
      .sendCommand(request)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.#toastService.showSuccess(
            `Lệnh ${request.command} gửi tới ${request.imei}  thành công!`,
          );
        },
        error: () => {
          this.#toastService.showError(
            `Lệnh ${request.command} gửi tới ${request.imei} thất bại!`,
          );
        },
      });
  }
}

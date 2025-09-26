import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { take } from 'rxjs';

import { ToastService } from '@core/services';
import {
  DataStateComponent,
  InputSearchComponent,
  ToolbarComponent,
  VehicleIconComponent,
} from '@shared/components';
import { ConnectionApiService } from '@shared/services';
import { ConnectionStore } from '@shared/stores';
import { LabelValue, SendCommandReq } from '@shared/types';
import { SendCommandInputComponent } from '../send-command-input/send-command-input.component';

@Component({
  selector: 'app-device-panel',
  imports: [
    SelectButtonModule,
    FormsModule,
    ToolbarComponent,
    InputSearchComponent,
    SkeletonModule,
    DataStateComponent,
    VehicleIconComponent,
    ScrollingModule,
    SendCommandInputComponent,
  ],
  templateUrl: './device-panel.component.html',
})
export class DevicePanelComponent {
  #connectionApiService = inject(ConnectionApiService);
  #toastService = inject(ToastService);

  connectionStore = inject(ConnectionStore);
  tabs = signal<LabelValue<number>[]>([
    {
      label: 'Gói tin',
      value: 0,
    },
    {
      label: 'Gửi lệnh',
      value: 1,
    },
  ]);
  selectedTabIdx = model.required<number>();
  selectedDeviceId = model.required<string | null>();

  constructor() {
    this.connectionStore.ensureData();
  }

  onSendingCommand(request: SendCommandReq): void {
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

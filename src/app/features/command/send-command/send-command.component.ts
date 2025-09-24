import { Component, effect, inject, input, model } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { DataStateComponent, ToolbarComponent } from '@shared/components';
import { RelativeTimePipe, SafeHtmlPipe } from '@shared/pipes';
import { SendCommandStore } from '@shared/stores';
import { DisplaySettingComponent } from '../display-setting/display-setting.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-send-command',
  imports: [
    ToolbarComponent,
    DisplaySettingComponent,
    ButtonModule,
    SafeHtmlPipe,
    RelativeTimePipe,
    DataStateComponent,
    SkeletonModule,
  ],
  templateUrl: './send-command.component.html',
  providers: [SendCommandStore],
})
export class SendCommandComponent {
  sendCommandStore = inject(SendCommandStore);
  selectedDeviceId = input.required<string | null>();
  dataFontSizePx = model.required<number>();

  constructor() {
    this.sendCommandStore.startAutoRefresh();

    effect(() => {
      if (this.selectedDeviceId()) {
        this.sendCommandStore.setRequest({
          imei: this.selectedDeviceId()!,
        });
      }
    });
  }

  protected onFontSizeChange(fontSize: number): void {
    this.dataFontSizePx.set(fontSize);
  }
}

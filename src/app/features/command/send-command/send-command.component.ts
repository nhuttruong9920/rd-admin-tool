import { Component, effect, inject, input, model } from '@angular/core';
import { ToolbarComponent } from '@shared/components';
import { ButtonModule } from 'primeng/button';
import { DisplaySettingComponent } from '../display-setting/display-setting.component';
import { SendCommandStore } from '@shared/stores';

@Component({
  selector: 'app-send-command',
  imports: [ToolbarComponent, DisplaySettingComponent, ButtonModule],
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
}

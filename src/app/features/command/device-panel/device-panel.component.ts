import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';

import {
  DataStateComponent,
  InputSearchComponent,
  ToolbarComponent,
} from '@shared/components';
import { ConnectionStore } from '@shared/stores';
import { LabelValue } from '@shared/types';
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
    ScrollingModule,
    SendCommandInputComponent,
  ],
  templateUrl: './device-panel.component.html',
})
export class DevicePanelComponent {
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
}

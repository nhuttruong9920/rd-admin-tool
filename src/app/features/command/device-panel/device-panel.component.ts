import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';

import {
  DataStateComponent,
  InputSearchComponent,
  ToolbarComponent,
  VehicleIconComponent,
} from '@shared/components';
import { DeviceStore } from '@shared/stores';
import { LabelValue } from '@shared/types';

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
  ],
  templateUrl: './device-panel.component.html',
})
export class DevicePanelComponent {
  deviceStore = inject(DeviceStore);
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
    this.deviceStore.ensureData();
  }
}

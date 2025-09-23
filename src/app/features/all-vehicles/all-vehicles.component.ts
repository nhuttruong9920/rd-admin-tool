import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { SplitPanelComponent } from '@shared/components';
import { DeviceStore } from '@shared/stores';
import { AllVehiclesMapComponent } from './all-vehicles-map/all-vehicles-map.component';
import { AllVehiclesPanelComponent } from './all-vehicles-panel/all-vehicles-panel.component';

@Component({
  selector: 'app-all-vehicles',
  imports: [
    SplitPanelComponent,
    AllVehiclesMapComponent,
    AllVehiclesPanelComponent,
  ],
  templateUrl: './all-vehicles.component.html',
})
export class AllVehiclesComponent implements OnInit {
  deviceStore = inject(DeviceStore);
  formattedDevices = computed(
    () =>
      this.deviceStore
        .data()
        ?.map((device) => ({ ...device.formatted, id: device.id })) ?? [],
  );

  selectedDeviceId = signal<string | null>(null);
  selectedDevice = computed(() =>
    this.deviceStore
      .data()
      ?.find((device) => device.id === this.selectedDeviceId()),
  );

  ngOnInit(): void {
    this.deviceStore.ensureData();
  }
}

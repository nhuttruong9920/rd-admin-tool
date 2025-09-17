import { Component, inject, OnInit } from '@angular/core';
import { SplitPanelComponent } from '@shared/components';
import { AllVehiclesMapComponent } from './all-vehicles-map/all-vehicles-map.component';
import { AllVehiclesPanelComponent } from './all-vehicles-panel/all-vehicles-panel.component';
import { DeviceStore } from '@shared/stores';

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
  #deviceStore = inject(DeviceStore);

  ngOnInit(): void {
    this.#deviceStore.ensureDevices();
  }
}

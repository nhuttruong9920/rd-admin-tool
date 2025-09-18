import { Component, inject, model } from '@angular/core';
import { InputSearchComponent, ToolbarComponent } from '@shared/components';
import { DeviceStore } from '@shared/stores';
import { VehicleCardComponent } from './vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-all-vehicles-panel',
  imports: [ToolbarComponent, InputSearchComponent, VehicleCardComponent],
  templateUrl: './all-vehicles-panel.component.html',
})
export class AllVehiclesPanelComponent {
  deviceStore = inject(DeviceStore);

  selectedDeviceId = model.required<string | null>();
  protected searchImeis(event: string): void {
    this.deviceStore.setSearchTerm(event);
  }
}

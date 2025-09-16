import { Component, viewChild } from '@angular/core';
import { SplitPanelComponent } from '@shared/components';
import { AllVehiclesMapComponent } from "./all-vehicles-map/all-vehicles-map.component";

@Component({
  selector: 'app-all-vehicles',
  imports: [SplitPanelComponent, AllVehiclesMapComponent],
  templateUrl: './all-vehicles.component.html',
})
export class AllVehiclesComponent {
  splitPanel = viewChild.required<SplitPanelComponent>(SplitPanelComponent);


}

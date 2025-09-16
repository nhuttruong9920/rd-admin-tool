import { Component, AfterViewInit, inject } from '@angular/core';
import { MapInstanceService } from '@shared/services/scoped/map-instance.service';

@Component({
  selector: 'app-all-vehicles-map',
  imports: [],
  templateUrl: './all-vehicles-map.component.html',
  providers: [MapInstanceService],
})
export class AllVehiclesMapComponent implements AfterViewInit {
  #mapInstanceService = inject(MapInstanceService);

  map!: L.Map;

  ngAfterViewInit(): void {
    this.#mapInstanceService.createMap('all-vehicles-map');
  }
}

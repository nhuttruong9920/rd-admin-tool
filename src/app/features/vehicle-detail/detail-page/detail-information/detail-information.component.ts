import { ScrollingModule } from '@angular/cdk/scrolling';
import { TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { MapService } from '@core/services';
import { ConnectionStatus } from '@features/vehicle-detail/vehicle-detail.service';
import { DataStateComponent } from '@shared/components';
import { MapInstanceService, MapOption } from '@shared/services';
import { HistoryStore } from '@shared/stores';
import * as L from 'leaflet';
import 'leaflet-ant-path';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-detail-information',
  imports: [TitleCasePipe, ScrollingModule, DataStateComponent, SkeletonModule],
  templateUrl: './detail-information.component.html',
  providers: [MapInstanceService, HistoryStore],
})
export class DetailInformationComponent implements AfterViewInit {
  #mapInstanceService = inject(MapInstanceService);
  #mapService = inject(MapService);
  historyStore = inject(HistoryStore);

  selectedConnectionStatus = input.required<ConnectionStatus | undefined>();

  map = signal<L.Map | undefined>(undefined);
  deviceLayer: L.LayerGroup = new L.LayerGroup();
  historyLayer: L.LayerGroup = new L.LayerGroup();

  firstTimeHasData = computed<boolean>(
    () => this.selectedConnectionStatus()?.status !== undefined,
  );

  constructor() {
    effect(() => {
      const device = this.selectedConnectionStatus();
      const currentMap = this.map();

      if (device && currentMap) {
        this.renderDeviceMarker(currentMap, device);
      }
    });

    effect(() => {
      if (this.firstTimeHasData()) {
        this.#mapService.fitBounds(this.map()!);
      }
    });
  }

  ngAfterViewInit(): void {
    const mapOption: MapOption = {
      zoomControl: false,
      fitBoundsButton: false,
      myLocationButton: false,
    };
    this.map.set(
      this.#mapInstanceService.createMap('detail-information-map', mapOption),
    );
    this.map()?.addLayer(this.deviceLayer);
    this.map()?.addLayer(this.historyLayer);
  }

  private renderDeviceMarker(map: L.Map, connection: ConnectionStatus): void {
    if (!map || !connection.status) return;

    // Clear existing marker
    this.deviceLayer.clearLayers();

    const icon = L.divIcon({
      className: `car-marker bg-car_${connection.status.formatted.state}`,
      iconSize: [20, 39],
    });

    const coordinate = new L.LatLng(
      connection.status.formatted.lat,
      connection.status.formatted.long,
    );

    L.marker(coordinate, {
      icon,
      rotationAngle: connection.status.formatted.heading,
      rotationOrigin: 'center center',
    })
      .bindTooltip(connection.imei, {
        permanent: true,
        direction: 'bottom',
        offset: [0, 20],
        opacity: 0.9,
      })
      .addTo(this.deviceLayer);
  }
}

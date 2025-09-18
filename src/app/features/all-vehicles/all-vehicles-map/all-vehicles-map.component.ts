import {
  Component,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  effect,
  createComponent,
  ApplicationRef,
  ComponentRef,
  model,
  signal,
} from '@angular/core';

import * as L from 'leaflet';

import { MapInstanceService } from '@shared/services';
import { FormattedDevice } from '@shared/types';
import { ExtendedMarkerOptions, MapService } from '@core/services';
import { VehicleMarkerPopupComponent } from '@shared/components/vehicle-marker-popup.component';

@Component({
  selector: 'app-all-vehicles-map',
  imports: [],
  templateUrl: './all-vehicles-map.component.html',
  providers: [MapInstanceService],
})
export class AllVehiclesMapComponent implements AfterViewInit, OnDestroy {
  #mapInstanceService = inject(MapInstanceService);
  #mapService = inject(MapService);
  #appRef = inject(ApplicationRef);

  formattedDevices = input.required<(FormattedDevice & { id: string })[]>();
  firstTimeHasData = input<boolean>(false);

  selectedDeviceId = model.required<string | null>();

  map = signal<L.Map | undefined>(undefined);
  deviceLayer: L.LayerGroup = new L.LayerGroup();

  // Store component references for dynamic updates
  private popupComponents = new Map<
    string,
    ComponentRef<VehicleMarkerPopupComponent>
  >();

  constructor() {
    effect(() => {
      this.renderDeviceMarkers(this.map(), this.formattedDevices());
    });

    effect(() => {
      if (this.firstTimeHasData()) {
        this.#mapService.fitBounds(this.map()!);
      }
    });

    effect(() => {
      if (this.selectedDeviceId()) {
        const marker = this.#mapService.getElementById(
          this.deviceLayer,
          this.selectedDeviceId()!,
        ) as L.Marker;
        if (marker) {
          this.#mapService.setMarkerView(this.map()!, marker);
          marker.openPopup();
        }
      } else {
        this.map()?.closePopup();
      }
    });
  }

  ngAfterViewInit(): void {
    this.map.set(this.#mapInstanceService.createMap('all-vehicles-map'));
    this.map()?.addLayer(this.deviceLayer);
  }

  private renderDeviceMarkers(
    map: L.Map | undefined,
    formattedDevices: (FormattedDevice & { id: string })[],
  ): void {
    if (!map || !formattedDevices.length) return;

    formattedDevices.forEach((device) => {
      const marker = this.#mapService.getElementById(
        this.deviceLayer,
        device.id,
      ) as L.Marker;
      const icon = L.divIcon({
        className: `car-marker bg-car_${device.state}`,
        iconSize: [20, 39],
      });

      const coordinate = new L.LatLng(device.lat, device.long);

      if (!marker) {
        // Create new marker and popup component
        this.createMarkerWithPopup(device, coordinate, icon);
      } else {
        // Update existing marker
        this.updateExistingMarker(marker, device, coordinate, icon);
      }
    });

    // Clean up removed devices
    this.cleanupRemovedDevices(formattedDevices);
  }

  private createMarkerWithPopup(
    device: FormattedDevice & { id: string },
    coordinate: L.LatLng,
    icon: L.DivIcon,
  ): void {
    const div = document.createElement('div');

    // Create Angular component for popup
    const compRef = createComponent(VehicleMarkerPopupComponent, {
      environmentInjector: this.#appRef.injector,
      hostElement: div,
    });

    // Set initial device data
    compRef.setInput('deviceId', device.id);
    compRef.setInput('device', device);

    this.#appRef.attachView(compRef.hostView);

    // Store component reference for future updates
    this.popupComponents.set(device.id, compRef);

    // Create marker
    L.marker(coordinate, {
      icon,
      rotationAngle: device.heading,
      rotationOrigin: 'center center',
      riseOnHover: true,
      id: device.id,
    } as ExtendedMarkerOptions)
      .bindTooltip(device.id, {
        permanent: true,
        direction: 'bottom',
        offset: [0, 20],
        opacity: 0.9,
      })
      .bindPopup(div, {
        closeButton: false,
        offset: [0, -10],
        autoPan: false,
      })
      .on('popupopen', () => this.selectedDeviceId.set(device.id))
      .on('popupclose', () => this.selectedDeviceId.set(null))
      .addTo(this.deviceLayer);
  }

  private updateExistingMarker(
    marker: L.Marker,
    device: FormattedDevice & { id: string },
    coordinate: L.LatLng,
    icon: L.DivIcon,
  ): void {
    // Update marker position and appearance
    marker.setLatLng(coordinate);
    marker.setRotationAngle(device.heading);
    marker.setIcon(icon);

    // Update popup component with new device data
    const popupComponent = this.popupComponents.get(device.id);
    if (popupComponent) {
      popupComponent.setInput('device', device);
    }
  }

  private cleanupRemovedDevices(
    currentDevices: (FormattedDevice & { id: string })[],
  ): void {
    const currentDeviceIds = new Set(currentDevices.map((d) => d.id));

    // Clean up components for devices that no longer exist
    for (const [deviceId, compRef] of this.popupComponents.entries()) {
      if (!currentDeviceIds.has(deviceId)) {
        // Destroy component and remove from map
        this.#appRef.detachView(compRef.hostView);
        compRef.destroy();
        this.popupComponents.delete(deviceId);

        // Remove marker from map
        const marker = this.#mapService.getElementById(
          this.deviceLayer,
          deviceId,
        );
        if (marker) {
          this.deviceLayer.removeLayer(marker);
        }
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up all popup components
    for (const [, compRef] of this.popupComponents.entries()) {
      this.#appRef.detachView(compRef.hostView);
      compRef.destroy();
    }
    this.popupComponents.clear();
  }
}

import { Injectable, OnDestroy, effect, inject, signal } from '@angular/core';

import { MapService, StorageService, ToastService } from '@core/services';
import * as L from 'leaflet';

import { LSKeys } from '@shared/constants/storage.constant';

enum LeafletControlPosition {
  TopLeft = 'topleft',
  TopRight = 'topright',
  BottomLeft = 'bottomleft',
  BottomRight = 'bottomright',
}

type MapOverlay = {
  label: string;
  layer: L.Layer | L.LayerGroup;
};

export type MapOption = {
  zoomControl?: boolean;
  layerControl?: boolean;
  mapOverlays?: MapOverlay[];
  fitBoundsButton?: boolean;
  myLocationButton?: boolean;
};

export type Coordinate = {
  lat: number;
  long: number;
};

@Injectable()
export class MapInstanceService implements OnDestroy {
  // ! do not create map instance in the same component
  #storageService = inject(StorageService);
  #toastService = inject(ToastService);
  #mapService = inject(MapService);

  map = signal<L.Map | undefined>(undefined);

  #myLocationMarker: L.Marker | null = null;
  #myLocationCircle: L.Circle | null = null;

  // layers
  protected layers: Record<string, L.TileLayer> =
    this.#mapService.generateTileLayer();
  protected selectedLayerKey = this.#mapService.selectedLayerKey;

  // overlays
  protected mapOverlays = signal<Record<string, L.Layer> | undefined>(
    undefined,
  );
  protected selectedOverlayKey = this.#mapService.selectedOverlayKey;

  constructor() {
    // sync map layer between map instances
    effect(() => {
      if (
        this.selectedLayerKey() &&
        this.layers[this.selectedLayerKey()] &&
        this.map()
      ) {
        this.#mapService.switchMapLayer(
          this.layers[this.selectedLayerKey()],
          this.map(),
        );
      }
    });

    // sync map overlays between map instances
    effect(() => {
      const overlays = this.mapOverlays();
      const selectedOverlays = this.selectedOverlayKey();
      const map = this.map();

      if (!map || !overlays || !selectedOverlays) return;

      // remove unselected overlays
      Object.keys(overlays).forEach((key) => {
        if (!selectedOverlays[key] && map.hasLayer(overlays[key])) {
          map.removeLayer(overlays[key]);
        }
      });

      // add selected overlays
      Object.keys(selectedOverlays).forEach((key) => {
        if (
          selectedOverlays[key] &&
          overlays[key] &&
          !map.hasLayer(overlays[key])
        ) {
          overlays[key].addTo(map);
        }
      });
    });
  }

  createMap(containerId: string, mapOption?: MapOption): L.Map {
    mapOption = {
      zoomControl: true,
      layerControl: true,
      fitBoundsButton: true,
      myLocationButton: true,
      ...mapOption,
    };

    const map = L.map(containerId, {
      attributionControl: false,
      zoomControl: false,
    }).setView([15.6212692260742, 109.178314208984], 7);

    //! zoom control buttons
    if (mapOption.zoomControl) {
      map.addControl(
        L.control.zoom({
          position: LeafletControlPosition.TopRight,
          zoomInTitle: 'Phóng to',
          zoomOutTitle: 'Thu nhỏ',
        }),
      );
    }

    //! fit bounds button
    if (mapOption.fitBoundsButton) {
      this.#mapService.addCustomButtonToMap(map, {
        position: LeafletControlPosition.TopRight,
        states: [
          {
            stateName: 'fitBounds',
            icon: '<span class="fa-stack"><i class="fat fa-square-dashed fa-stack-2x"></i><i class="fas fa-location-dot text-[8px] fa-stack-1x !-left-1 !-top-1"></i><i class="fas fa-motorcycle text-[8px] fa-stack-1x !top-1 !left-0.25"></i><i class="fas fa-car text-[8px] fa-stack-1x !-top-1 !left-1"></i></span>',
            titleKey: 'Xem tất cả',
            onClick: (): void => this.#mapService.fitBounds(map),
          },
        ],
      });
    }

    //! my location button
    if (mapOption.myLocationButton) {
      this.#mapService.addCustomButtonToMap(map, {
        position: LeafletControlPosition.TopRight,
        states: [
          {
            stateName: 'start-updating',
            icon: '<i class="fas fa-location-crosshairs"></i>',
            titleKey: 'Vị trí hiện tại',
            onClick: (btn): void => {
              btn.state('updating');
              this.startUpdatingMyLocation(map, btn);
            },
          },
          {
            stateName: 'updating',
            icon: '<i class="fas fa-location-crosshairs fa-beat" style="color: #4285f4;"></i>',
            titleKey: 'Dừng tìm vị trí',
            onClick: (btn): void => {
              btn.state('start-updating');
              this.stopUpdatingMyLocation(map);
            },
          },
        ],
      });
    }

    //! overlays
    const overlays: Record<string, L.Layer> = {};

    if (mapOption.mapOverlays) {
      mapOption.mapOverlays.forEach((mapOverlay) => {
        overlays[mapOverlay.label] = mapOverlay.layer;
      });
    }

    this.mapOverlays.set(overlays);

    const localOverlays: Record<string, boolean> | null =
      this.#storageService.getLocal(LSKeys.MAP_OVERLAY, true) ?? {};

    Object.keys(this.mapOverlays() ?? {}).forEach((key) => {
      if (localOverlays[key] === true) {
        this.mapOverlays()?.[key].addTo(map);
      }
      if (localOverlays[key] === undefined || localOverlays[key] === null) {
        this.mapOverlays()?.[key]?.addTo(map);
        localOverlays[key] = true;
        this.#storageService.setLocal(LSKeys.MAP_OVERLAY, localOverlays);
      }
    });

    this.selectedOverlayKey.set(localOverlays);

    //! layer control
    if (mapOption.layerControl) {
      L.control
        .layers(this.layers, overlays, {
          position: LeafletControlPosition.TopRight,
        })
        .addTo(map);
    }

    // ! add default layer
    map.addLayer(this.layers[Object.keys(this.layers)[0]]);

    //! listeners
    map.on('baselayerchange', (e) => {
      this.#storageService.setLocal(LSKeys.MAP_LAYER, e.name);
      this.selectedLayerKey.set(e.name);
    });

    map.on('overlayadd', (e) => {
      const localOverlays: Record<string, boolean> =
        this.#storageService.getLocal(LSKeys.MAP_OVERLAY, true) ?? {};

      localOverlays[e.name] = true;
      this.#storageService.setLocal(LSKeys.MAP_OVERLAY, localOverlays);
      this.selectedOverlayKey.set(localOverlays);
    });

    map.on('overlayremove', (e) => {
      const localOverlays: Record<string, boolean> =
        this.#storageService.getLocal(LSKeys.MAP_OVERLAY, true) ?? {};

      localOverlays[e.name] = false;
      this.#storageService.setLocal(LSKeys.MAP_OVERLAY, localOverlays);
      this.selectedOverlayKey.set(localOverlays);
    });

    //! return
    this.map.set(map);
    return map;
  }

  private startUpdatingMyLocation(
    map: L.Map,
    button: { state: (newState: string) => void },
  ): void {
    map.off('locationfound');
    map.off('locationerror');

    map.locate({ enableHighAccuracy: true, watch: true });

    map.on('locationfound', (e: L.LocationEvent) => {
      const isFirstTime = !this.#myLocationMarker && !this.#myLocationCircle;

      if (this.#myLocationMarker) map.removeLayer(this.#myLocationMarker);
      if (this.#myLocationCircle) map.removeLayer(this.#myLocationCircle);

      this.#myLocationMarker = L.marker(e.latlng, {
        icon: L.icon({
          iconUrl: '/images/map/my-location-min.png',
          iconSize: [20, 20],
        }),
      }).addTo(map);

      this.#myLocationCircle = L.circle(e.latlng, {
        radius: e.accuracy,
        fillColor: '#339af0',
        fillOpacity: 0.3,
        stroke: false,
      }).addTo(map);

      if (isFirstTime) {
        const circleBounds = this.#myLocationCircle?.getBounds();
        map.fitBounds(circleBounds);
      }
    });

    map.on('locationerror', () => {
      this.#toastService.showError(
        'Chưa cấp quyền truy cập vị trí hoặc vị trí không được hỗ trợ!',
      );
      button.state('start-updating');
    });
  }

  private stopUpdatingMyLocation(map: L.Map): void {
    map.stopLocate();
    map.off('locationfound');
    map.off('locationerror');

    if (this.#myLocationMarker) {
      map.removeLayer(this.#myLocationMarker);
      this.#myLocationMarker = null;
    }
    if (this.#myLocationCircle) {
      map.removeLayer(this.#myLocationCircle);
      this.#myLocationCircle = null;
    }
  }

  ngOnDestroy(): void {
    this.map()?.remove();
  }
}

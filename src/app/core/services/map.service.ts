import { inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import { environment } from 'src/environments/environment';
import { LSKeys } from '@shared/constants';
import { StorageService } from './storage.service';
import { KeyValue } from '@shared/types';

export type TileLayer = {
  urlTemplate: string;
  options: L.TileLayerOptions;
};

export interface ExtendedMarkerOptions extends L.MarkerOptions {
  id?: string | number;
}
export interface ExtendedCircleMarkerOptions extends L.CircleMarkerOptions {
  id?: string | number;
}
export interface ExtendedPolylineOptions extends L.PolylineOptions {
  id?: string | number;
}

export interface ExtendedLayerOptions extends L.LayerOptions {
  id?: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  #vietmapApiKey = environment.vietmapApiKey;

  #storageService = inject(StorageService);

  //! layers
  #vietmapOptions: L.TileLayerOptions = {
    maxZoom: 24,
    maxNativeZoom: 20,
  };

  #googleOptions: L.TileLayerOptions = {
    maxZoom: 24,
    maxNativeZoom: 22,
  };

  tileLayers: Record<string, TileLayer> = {
    vietmap: {
      urlTemplate: `https://maps.vietmap.vn/maps/tiles/tm/{z}/{x}/{y}@2x.png?apikey=${this.#vietmapApiKey}`,
      options: this.#vietmapOptions,
    },
    vietmapDark: {
      urlTemplate: `https://maps.vietmap.vn/maps/tiles/dm/{z}/{x}/{y}@2x.png?apikey=${this.#vietmapApiKey}`,
      options: this.#vietmapOptions,
    },
    googleRoadMap: {
      urlTemplate: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: this.#googleOptions,
    },
    googleSatellite: {
      urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      options: this.#googleOptions,
    },
  };

  selectedLayerKey = signal<string>(this.getLocalLayer());
  selectedOverlayKey = signal<Record<string, boolean>>(this.getLocalOverlay());

  //! map options
  generateTileLayer(): Record<string, L.TileLayer> {
    const createTileLayer = (tileLayer: TileLayer): L.TileLayer =>
      L.tileLayer(tileLayer.urlTemplate, tileLayer.options);

    const vietmap = createTileLayer(this.tileLayers['vietmap']);
    const vietmapDark = createTileLayer(this.tileLayers['vietmapDark']);
    const googleRoadMap = createTileLayer(this.tileLayers['googleRoadMap']);
    const googleSatellite = createTileLayer(this.tileLayers['googleSatellite']);

    return {
      ['Bản đồ Vietmap']: vietmap,
      ['Bản đồ Vietmap tối']: vietmapDark,
      ['Bản đồ GoogleMap']: googleRoadMap,
      ['Bản đồ Google Vệ tinh']: googleSatellite,
    };
  }

  //! map utils
  getElementById(
    layer: L.LayerGroup,
    elementId: string,
  ): L.Layer | L.Marker | null {
    for (const tempLayer of layer?.getLayers() ?? []) {
      if (
        tempLayer.options &&
        (tempLayer.options as ExtendedPolylineOptions).id === elementId
      ) {
        return tempLayer;
      }
    }

    return null;
  }

  switchMapLayer(layer: L.TileLayer, map: L.Map | undefined): void {
    if (!map) {
      console.error('switchMapLayer: map is not initialized');
      return;
    }

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    map.addLayer(layer);
  }

  addCustomButtonToMap(
    map: L.Map,
    options: {
      position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
      states: {
        stateName: string;
        icon: string;
        titleKey: string;
        onClick: (btn: { state: (newState: string) => void }) => void;
      }[];
    },
  ): void {
    const buttonState = { current: options.states[0].stateName };

    const CustomButton = L.Control.extend({
      options: { position: options.position },

      onAdd: () => {
        const container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control',
        );
        const button = L.DomUtil.create(
          'a',
          'leaflet-control-custom-button',
          container,
        );
        button.href = '#';

        const updateButton = (): void => {
          const currentState = options.states.find(
            (s) => s.stateName === buttonState.current,
          );
          if (currentState) {
            button.innerHTML = currentState.icon;
          }
        };

        updateButton();

        L.DomEvent.on(button, 'click', (e: Event) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);

          const currentState = options.states.find(
            (s) => s.stateName === buttonState.current,
          );
          if (currentState) {
            currentState.onClick({
              state: (newState) => {
                buttonState.current = newState;
                updateButton();
              },
            });
          }
        });

        return container;
      },
    });

    new CustomButton().addTo(map);
  }

  fitBounds(map: L.Map): void {
    if (!map) return;

    map.closePopup();

    const latLngs: L.LatLng[] = [];

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        latLngs.push(layer.getLatLng());
      } else if (layer instanceof L.LayerGroup) {
        layer.eachLayer((sublayer) => {
          if (sublayer instanceof L.Marker) {
            latLngs.push(sublayer.getLatLng());
          }
        });
      }
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.flyToBounds(bounds, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
        maxZoom: 18,
      });
    }
  }

  setMarkerView(map: L.Map, layer: L.Marker, maxZoom: number = 16): void {
    const latLng = layer?.getLatLng();

    const currentZoom = map.getZoom();
    if (latLng) {
      map.setView(latLng, currentZoom > maxZoom ? currentZoom : maxZoom);
    }
  }

  recenterVehicleMarker(
    position: L.LatLngTuple,
    map: L.Map,
    padding?: number,
    top?: number,
    right?: number,
    bottom?: number,
    left?: number,
  ): void {
    const containerPoint = map.latLngToContainerPoint(position);
    const mapSize = map.getSize();

    const padTop = top ?? padding ?? 0;
    const padRight = right ?? padding ?? 0;
    const padBottom = bottom ?? padding ?? 0;
    const padLeft = left ?? padding ?? 0;

    const isTooCloseToEdge =
      containerPoint.x < padLeft ||
      containerPoint.x > mapSize.x - padRight ||
      containerPoint.y < padTop ||
      containerPoint.y > mapSize.y - padBottom;

    if (isTooCloseToEdge) {
      map.setView(position);
    }
  }

  //! utils
  openInMap(lat: number, long: number): void {
    window.open(`https://maps.google.com?q=${lat},${long}`);
  }

  openInStreetView(lat: number, long: number): void {
    window.open(
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${long}`,
    );
  }

  findNearestPoint(point: L.LatLng, points: L.LatLngTuple[]): number {
    let minDistance = Infinity;
    let nearestIndex = -1;

    points.forEach((p, index) => {
      const distance = point.distanceTo(p);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  createTooltipContent(data: KeyValue<unknown>): string {
    const content = Object.entries(data)
      .map(([key, value]) => {
        return `<tr><td class="p-0.5 whitespace-nowrap text-surface-500">${key}</td><td class="p-0.5">${value}</td></tr>`;
      })
      .join('');

    return `<div class="p-2"><table>${content}</table></div>`;
  }

  //! private methods
  private getLocalLayer(): string {
    const localLayerKey = this.#storageService.getLocal<string>(
      LSKeys.MAP_LAYER,
    );
    return localLayerKey ?? Object.keys(this.tileLayers)[0];
  }

  private getLocalOverlay(): Record<string, boolean> {
    const localOverlayKey = this.#storageService.getLocal<
      Record<string, boolean>
    >(LSKeys.MAP_OVERLAY, true);

    return localOverlayKey ?? {};
  }
}

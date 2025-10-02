import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { MapService } from '@core/services';
import { HistoryOdoChartComponent } from '@shared/components/history-odo-chart.component';
import { MapInstanceService } from '@shared/services';
import { FormattedWaypoint, HistoryStopRange } from '@shared/types';
import * as L from 'leaflet';
import 'leaflet-ant-path';

@Component({
  selector: 'app-vehicle-history-map',
  imports: [HistoryOdoChartComponent],
  templateUrl: './vehicle-history-map.component.html',
  providers: [MapInstanceService],
})
export class VehicleHistoryMapComponent implements AfterViewInit {
  #mapInstanceService = inject(MapInstanceService);
  #mapService = inject(MapService);

  // ! data
  formattedHistory = input.required<FormattedWaypoint[]>();
  isHistoryPlaying = model.required<boolean>();
  currentPlayingIndex = model.required<number>();
  historyChargeRanges = input.required<HistoryStopRange[]>();
  historyStopRanges = input.required<HistoryStopRange[]>();
  batteryPercentageInterval = input.required<number>();
  selectedWaypoint = input.required<FormattedWaypoint | undefined>();

  // ! map instance
  map = signal<L.Map | undefined>(undefined);
  historyLayer: L.LayerGroup = new L.LayerGroup();
  historyPointLayer: L.LayerGroup = new L.LayerGroup();
  historyStopLayer: L.LayerGroup = new L.LayerGroup();
  historyChargingLayer: L.LayerGroup = new L.LayerGroup();
  historyBatteryPercentageLayer: L.LayerGroup = new L.LayerGroup();
  historyAntPath = new L.Polyline.AntPath([], {
    pulseColor: '#ffffffaa',
    weight: 8,
    dashArray: [20, 60],
    opacity: 0.9,
    delay: 1500,
  });
  historyPolyline!: L.LayerGroup;
  historyDeviceMarker!: L.Marker;

  // chart
  isOdoChartExpanded = signal<boolean>(true);

  constructor() {
    effect(() => {
      void this.formattedHistory();
      this.clearHistory();
    });

    effect(() => {
      this.renderDeviceMarker(
        this.formattedHistory(),
        this.currentPlayingIndex(),
      );
    });

    effect(() => {
      this.renderHistory(this.formattedHistory());
    });

    effect(() => {
      this.updateHistoryAntPath(
        this.formattedHistory(),
        this.currentPlayingIndex(),
      );
    });

    effect(() => {
      this.renderBatteryPercentageMarker(
        this.formattedHistory(),
        this.batteryPercentageInterval(),
      );
    });

    effect(() => {
      this.renderChargingMarker(this.historyChargeRanges());
    });

    effect(() => {
      this.renderPauseParkMarker(this.historyStopRanges());
    });
  }

  ngAfterViewInit(): void {
    this.map.set(
      this.#mapInstanceService.createMap('vehicle-history-map', {
        mapOverlays: [
          {
            label: 'Điểm dừng',
            layer: this.historyStopLayer,
          },
          {
            label: 'Điểm sạc',
            layer: this.historyChargingLayer,
          },
          {
            label: 'Mức pin',
            layer: this.historyBatteryPercentageLayer,
          },
        ],
      }),
    );
    this.map()?.addLayer(this.historyLayer);
  }

  private clearHistory(): void {
    this.historyLayer?.clearLayers();
    this.historyPointLayer?.clearLayers();
    this.historyStopLayer?.clearLayers();
    this.historyChargingLayer?.clearLayers();
    this.historyBatteryPercentageLayer?.clearLayers();
  }

  private renderHistory(history: FormattedWaypoint[]): void {
    if (!this.map || !history || history.length === 0) return;

    this.renderHistoryPolyline(history);
    this.renderStartFinishMarker(history);

    this.historyDeviceMarker?.openPopup();
  }

  private renderHistoryPolyline(history: FormattedWaypoint[]): void {
    const waypoints = history.map((point) => [
      point.lat,
      point.long,
    ]) as L.LatLngTuple[];
    const colors = history.map((waypoint) => waypoint.stateColor);

    this.map()?.fitBounds(waypoints as L.LatLngTuple[]);

    const directionLine: L.Polyline[] = [];
    let currentColor: string | null = null;
    let currentLine: L.Polyline | null = null;

    for (let i = 0; i < history.length; i++) {
      const latLng = waypoints[i] as L.LatLngTuple;
      const color = colors[i];

      if (color !== currentColor) {
        if (currentLine) {
          currentLine.addLatLng(latLng);
          directionLine.push(currentLine);
        }

        currentColor = color;
        currentLine = new L.Polyline([latLng], {
          color,
          weight: 6,
        });

        currentLine.on('click', (e: L.LeafletMouseEvent) =>
          this.handleHistoryClick(e, history),
        );
      } else if (currentLine) {
        currentLine.addLatLng(latLng);
      }
    }

    if (currentLine) {
      directionLine.push(currentLine);
    }

    this.historyPolyline = L.layerGroup(directionLine);
    if (!this.historyLayer.hasLayer(this.historyPolyline)) {
      this.historyLayer.addLayer(this.historyPolyline);
    }

    this.historyAntPath.on('click', (e: L.LeafletMouseEvent) =>
      this.handleHistoryClick(e, history),
    );
  }

  private renderStartFinishMarker(history: FormattedWaypoint[]): void {
    const addMarker = (
      point: FormattedWaypoint,
      iconUrl: string,
      iconAnchor: [number, number],
      offset: [number, number],
    ): void => {
      const tooltipData = {
        'Thời gian': point.gpsTime,
        'Tốc độ': point.vehicleSpeed.value,
        'Địa chỉ': point.address,
      };
      const tooltipContent = this.#mapService.createTooltipContent(tooltipData);

      L.marker([point.lat, point.long], {
        icon: L.icon({
          iconUrl,
          iconSize: [40, 40],
          iconAnchor,
        }),
      })
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset,
        })
        .addTo(this.historyStopLayer);
    };

    const [firstPoint, lastPoint] = [history[0], history[history.length - 1]];

    addMarker(
      firstPoint,
      'images/map/marker_a_left-min.png',
      [40, 20],
      [-25, -18],
    );
    addMarker(
      lastPoint,
      'images/map/marker_b_right-min.png',
      [0, 20],
      [25, -18],
    );
  }

  private renderDeviceMarker(
    history: FormattedWaypoint[],
    index: number,
  ): void {
    if (!history || history.length === 0) return;

    const firstPoint = history[index];

    const position = [firstPoint.lat, firstPoint.long] as L.LatLngTuple;

    const pointIcon = L.divIcon({
      iconSize: [20, 39],
      className: `car-marker bg-car_${firstPoint.state}`,
    });

    if (!this.historyDeviceMarker) {
      this.historyDeviceMarker = L.marker(position, {
        icon: pointIcon,
        rotationAngle: firstPoint.heading,
        rotationOrigin: 'center center',
      })
        .bindTooltip(firstPoint.id, {
          permanent: true,
          direction: 'bottom',
          offset: [0, 20],
          opacity: 0.9,
        })
        .setZIndexOffset(1000)
        .addTo(this.historyLayer);
    } else {
      this.historyDeviceMarker.setLatLng(position);
      this.historyDeviceMarker.setRotationAngle(firstPoint.heading);
      this.historyDeviceMarker.setIcon(pointIcon);
      this.historyDeviceMarker.setTooltipContent(firstPoint.id);
    }

    if (!this.historyLayer.hasLayer(this.historyDeviceMarker)) {
      this.historyLayer.addLayer(this.historyDeviceMarker);
    }

    this.#mapService.recenterVehicleMarker(
      position,
      this.map()!,
      50,
      undefined,
      undefined,
      undefined,
    );
  }

  private updateHistoryAntPath(
    history: FormattedWaypoint[],
    index: number,
  ): void {
    if (!history || history.length === 0) return;
    const historyToIndex = history.slice(0, index + 1);

    const waypointsToIndex = historyToIndex.map((point) => [
      point.lat,
      point.long,
    ]) as L.LatLngTuple[];

    const uniqueConsecutiveWaypoints = waypointsToIndex.filter(
      (point, index, arr) => {
        if (index === 0) return true;
        const [prevLat, prevLng] = arr[index - 1];
        const [currLat, currLng] = point;
        return prevLat !== currLat || prevLng !== currLng;
      },
    );

    this.historyAntPath.setLatLngs(uniqueConsecutiveWaypoints);

    if (!this.historyLayer.hasLayer(this.historyAntPath)) {
      this.historyLayer.addLayer(this.historyAntPath);
    }
  }

  private handleHistoryClick(
    e: L.LeafletMouseEvent,
    history: FormattedWaypoint[],
  ): void {
    const waypoints = history.map((point) => [
      point.lat,
      point.long,
    ]) as L.LatLngTuple[];

    this.isHistoryPlaying.set(false);

    const nearestIdx = this.#mapService.findNearestPoint(e.latlng, waypoints);
    this.currentPlayingIndex.set(nearestIdx);
    this.historyDeviceMarker.openPopup();
  }

  private renderChargingMarker(chargingRanges: HistoryStopRange[]): void {
    chargingRanges.forEach((range) => {
      const latLng = [range.lat, range.long] as L.LatLngTuple;

      const tooltipData = {
        'Địa điểm': range.address,
        'Thời gian': `${range.fromTime} - ${range.toTime}`,
        'Khoảng TG': range.duration,
      };
      const tooltipContent = this.#mapService.createTooltipContent(tooltipData);

      L.marker(latLng, {
        icon: L.icon({
          iconUrl: `images/map/charging.png`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
      })
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -40],
        })
        .addTo(this.historyChargingLayer);
    });
  }

  private renderPauseParkMarker(stopRanges: HistoryStopRange[]): void {
    stopRanges.forEach((range) => {
      const latLng = [range.lat, range.long] as L.LatLngTuple;
      const isParking = range.durationSecs > 300;

      const tooltipData = {
        'Địa điểm': range.address,
        'Thời gian': `${range.fromTime} - ${range.toTime}`,
        'Khoảng TG': range.duration,
      };
      const tooltipContent = this.#mapService.createTooltipContent(tooltipData);

      L.marker(latLng, {
        icon: L.icon({
          iconUrl: `images/map/${isParking ? 'park' : 'pause'}-min.png`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
      })
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -40],
        })
        .addTo(this.historyStopLayer);
    });
  }

  private renderBatteryPercentageMarker(
    history: FormattedWaypoint[] | undefined,
    batteryPercentageInterval: number,
  ): void {
    if (!history || !history.length) return;
    if (!history[0].battery) return;

    this.historyBatteryPercentageLayer?.clearLayers();

    let previousBattery = Number(history[0].battery.value);
    history.forEach((point, index) => {
      const currentBattery = Number(point.battery.value);
      const shouldRender =
        Math.abs(currentBattery - previousBattery) >=
          batteryPercentageInterval ||
        index === 0 ||
        index === history.length - 1;

      if (shouldRender) {
        const latLng = [point.lat, point.long] as L.LatLngTuple;

        const tooltipData = {
          'Địa điểm': point.address,
          'Thời gian': point.gpsTime,
          Pin: point.battery.value + (point.battery.unit ?? ''),
        };
        const tooltipContent =
          this.#mapService.createTooltipContent(tooltipData);

        L.marker(latLng, {
          icon: L.icon({
            iconUrl: `images/map/orange-dot.svg`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        })
          .bindTooltip(point.battery.value + (point.battery.unit ?? ''), {
            direction: 'bottom',
            offset: [0, 8],
            opacity: 0.9,
            permanent: true,
            className: '!p-1 !leading-none !text-[10px]',
          })
          .bindPopup(tooltipContent, {
            offset: [0, 8],
            closeButton: false,
            className: '!p-1',
          })
          .addTo(this.historyBatteryPercentageLayer);

        previousBattery = currentBattery;
      }
    });
  }
}

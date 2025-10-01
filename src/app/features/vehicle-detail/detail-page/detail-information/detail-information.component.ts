import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DateService, MapService } from '@core/services';
import { HistoryCardComponent } from '@features/history-replay/history-panel/history-card/history-card.component';
import { ConnectionStatus } from '@features/vehicle-detail/vehicle-detail.service';
import {
  DataStateComponent,
  SplitPanelComponent,
  VehicleIconComponent,
} from '@shared/components';
import { MapInstanceService, MapOption } from '@shared/services';
import { HistoryStopRange, HistoryWaypoint, LabelValue } from '@shared/types';
import * as L from 'leaflet';
import 'leaflet-ant-path';
import { SkeletonModule } from 'primeng/skeleton';
import { HistoryDetailStore } from './history-detail.store';

@Component({
  selector: 'app-detail-information',
  imports: [
    ScrollingModule,
    DataStateComponent,
    SkeletonModule,
    SplitPanelComponent,
    ScrollingModule,
    HistoryCardComponent,
    VehicleIconComponent,
  ],
  templateUrl: './detail-information.component.html',
  providers: [MapInstanceService],
})
export class DetailInformationComponent implements AfterViewInit {
  #mapInstanceService = inject(MapInstanceService);
  #mapService = inject(MapService);
  #dateService = inject(DateService);
  historyDetailStore = inject(HistoryDetailStore);

  selectedConnectionStatus = input.required<ConnectionStatus | undefined>();

  gpsInfo = computed(() => {
    const status = this.selectedConnectionStatus()?.status;
    return [
      {
        title: 'Ping',
        value: `${status?.formatted.pingTime} - ${status?.formatted.relativePingTime}`,
        icon: 'fas fa-wifi',
        iconClass: 'text-gray-500',
        colSpan: 'col-span-2',
      },
      {
        title: 'Gps',
        value: `${status?.formatted.gpsTime} - ${status?.formatted.relativeGpsTime}`,
        icon: 'fas fa-wifi',
        iconClass: 'text-gray-500',
        colSpan: 'col-span-2',
      },
      {
        title: 'Vận tốc gps',
        value: `${status?.formatted.gpsSpeed.value} ${status?.formatted.gpsSpeed.unit}`,
        icon: 'fas fa-microchip',
        iconClass: 'text-violet-500',
        colSpan: 'col-span-1',
      },
      {
        title: 'Số lượng vệ tinh',
        value: `${status?.last.satellite}`,
        icon: 'fas fa-satellite',
        iconClass: 'text-sky-500',
        colSpan: 'col-span-1',
      },
    ];
  });

  locationInfo = computed(() => {
    const status = this.selectedConnectionStatus()?.status;
    return [
      {
        title: 'Địa chỉ',
        value: `${status?.formatted.address}`,
        icon: 'fas fa-location-dot',
        iconClass: 'text-blue-500',
        colSpan: 'col-span-1',
      },
      {
        title: 'Hướng',
        value: this.#mapService.convertDegreeToDirection(
          status?.formatted.heading || 0,
        ),
        icon: 'fas fa-compass',
        iconClass: 'text-gray-500',
        colSpan: 'col-span-1',
      },
      {
        title: 'Toạ độ',
        value: this.#mapService.convertLatLonToDMS(
          status?.formatted.lat || 0,
          status?.formatted.long || 0,
        ),
        icon: 'fas fa-crosshairs',
        iconClass: 'text-gray-500',
        colSpan: 'col-span-1',
      },
    ];
  });

  odoInfo = computed(() => {
    const formatted = this.selectedConnectionStatus()?.status?.formatted;
    return [
      { ...formatted?.odoTime, colSpan: 'col-span-3' },
      { ...formatted?.odometer, colSpan: 'col-span-1' },
      { ...formatted?.voltage, colSpan: 'col-span-1' },
      { ...formatted?.range, colSpan: 'col-span-1' },
      { ...formatted?.vehicleSpeed, colSpan: 'col-span-1' },
      { ...formatted?.battery, colSpan: 'col-span-1' },
      { ...formatted?.mode, colSpan: 'col-span-1' },
    ];
  });
  odoTimeRelative = computed(() =>
    this.convertOdoTimeToRelativeTime(
      this.selectedConnectionStatus()?.status?.formatted.odoTime
        .value as string,
    ),
  );

  map = signal<L.Map | undefined>(undefined);
  deviceLayer: L.LayerGroup = new L.LayerGroup();
  historyPolyline: L.LayerGroup = new L.LayerGroup();
  historyLayer: L.LayerGroup = new L.LayerGroup();
  historyStopLayer: L.LayerGroup = new L.LayerGroup();
  historyChargingLayer: L.LayerGroup = new L.LayerGroup();

  firstTimeHasData = true;

  // righpanel
  tabs = signal<LabelValue<number>[]>([
    {
      label: 'Gửi lệnh',
      value: 0,
    },
    {
      label: 'Lịch sử hành trình',
      value: 1,
    },
  ]);
  selectedTabIndex = signal<number>(0);

  constructor() {
    effect(() => {
      const device = this.selectedConnectionStatus();
      const currentMap = this.map();

      if (device && currentMap) {
        this.renderDeviceMarker(currentMap, device);
      }
    });

    effect(() => {
      if (
        this.firstTimeHasData &&
        this.selectedConnectionStatus()?.status &&
        this.map()
      ) {
        this.firstTimeHasData = false;
        const coordinate = [
          this.selectedConnectionStatus()?.status?.formatted.lat || 0,
          this.selectedConnectionStatus()?.status?.formatted.long || 0,
        ] as L.LatLngTuple;
        this.map()!.setView(coordinate, 15);
      }
    });

    effect(() => {
      this.renderChargingMarker(this.historyDetailStore.chargeRanges());
    });

    effect(() => {
      this.renderPauseParkMarker(this.historyDetailStore.stopRanges());
    });

    effect(() => {
      this.renderHistory(this.historyDetailStore.data());
    });
  }

  ngAfterViewInit(): void {
    const mapOption: MapOption = {
      zoomControl: false,
      fitBoundsButton: false,
      myLocationButton: false,
      mapOverlays: [
        {
          label: 'Điểm dừng',
          layer: this.historyStopLayer,
        },
        {
          label: 'Điểm sạc',
          layer: this.historyChargingLayer,
        },
      ],
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

  convertOdoTimeToRelativeTime(str: string): string {
    if (str === 'N/A') return '';
    const [datePart, timePart] = str.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    const odoTime = new Date(year, month - 1, day, hour, minute, second);
    return this.#dateService.getRelativeTime(odoTime);
  }

  private renderHistory(history: HistoryWaypoint[] | null): void {
    if (!this.map || !history || history.length === 0) return;

    this.renderHistoryPolyline(history);
    this.renderStartMarker(history);
  }

  private renderHistoryPolyline(history: HistoryWaypoint[]): void {
    const waypoints = history.map((point) => [
      point.formatted.lat,
      point.formatted.long,
    ]) as L.LatLngTuple[];
    const colors = history.map((waypoint) => waypoint.formatted.stateColor);

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
  }

  private renderStartMarker(history: HistoryWaypoint[]): void {
    const addMarker = (
      point: HistoryWaypoint,
      iconUrl: string,
      iconAnchor: [number, number],
      offset: [number, number],
    ): void => {
      const tooltipData = {
        'Thời gian': point.formatted.gpsTime,
        'Tốc độ': point.formatted.vehicleSpeed.value,
        'Địa chỉ': point.formatted.address,
      };
      const tooltipContent = this.#mapService.createTooltipContent(tooltipData);

      L.marker([point.formatted.lat, point.formatted.long], {
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

    const [firstPoint] = [history[0]];

    addMarker(
      firstPoint,
      'images/map/marker_a_left-min.png',
      [40, 20],
      [-25, -18],
    );
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
}

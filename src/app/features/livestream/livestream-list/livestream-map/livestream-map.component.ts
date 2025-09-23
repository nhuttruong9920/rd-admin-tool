// import {
//   AfterViewInit,
//   Component,
//   effect,
//   inject,
//   model
// } from '@angular/core';
// import { toObservable, toSignal } from '@angular/core/rxjs-interop';

// import * as L from 'leaflet';
// import { combineLatest, interval, of, startWith, switchMap, tap } from 'rxjs';

// import { DateService } from '@core/services';
// import {
//   ConnectionApiService, ExtendedMarkerOptions,
//   MapService
// } from '@shared/services';
// import { DeviceStatus } from '@shared/types';

// @Component({
//   selector: 'app-livestream-map',
//   imports: [],
//   templateUrl: './livestream-map.component.html',
//   providers: [MapService],
// })
// export class LivestreamMapComponent implements AfterViewInit {
//   readonly DEFAULT_REFRESH_INTERVAL = 10000;
//   private readonly mapService = inject(MapService);
//   private readonly connectionService = inject(ConnectionApiService);
//   private readonly dateService = inject(DateService);

//   readonly map = model.required<L.Map>();

//   deviceLayer: L.LayerGroup = new L.LayerGroup();
//   readonly selectedImei = model.required<string | null>();

//   deviceStatusInterval$ = combineLatest([
//     toObservable(this.selectedImei),
//     interval(this.DEFAULT_REFRESH_INTERVAL).pipe(startWith(0)),
//   ]).pipe(
//     switchMap(([imei]) => {
//       if (!imei) {
//         return of(null);
//       }

//       return this.connectionService.fetchDeviceStatus({ imeis: imei, time: 0 });
//     }),
//     tap((status) => {
//       if (status?.data) {
//         this.renderDeviceStatus(status.data);
//       }
//     }),
//   );

//   deviceStatus = toSignal(this.deviceStatusInterval$);

//   constructor() {
//     effect(() => {
//       if (this.selectedImei()) {
//         this.deviceLayer?.clearLayers();
//       }
//     });
//   }

//   ngAfterViewInit(): void {
//     this.map.set(
//       this.mapService.createMap('livestream-map', {
//         myLocationButton: false,
//         fitBoundsButton: false,
//         zoomControl: false,
//       }),
//     );
//     this.map().addLayer(this.deviceLayer);
//   }

//   renderDeviceStatus(deviceStatus: DeviceStatus[]): void {
//     if (!this.map || !deviceStatus) return;

//     deviceStatus.forEach((device) => {
//       let marker = this.mapService.getElementById(
//         this.deviceLayer,
//         device.id,
//       ) as L.Marker;
//       const icon = L.divIcon({
//         className: `car-marker ${device.iconClass}`,
//         iconSize: [20, 39],
//       });

//       const coordinate = new L.LatLng(device.last.y / 1e6, device.last.x / 1e6);

//       const tooltipContent = `${device.last.imei} - ${this.dateService.getFormattedDate(device.gpsTime)} <br> ${device.last.info}`;

//       if (!marker) {
//         marker = L.marker(coordinate, {
//           icon,
//           rotationAngle: device.last.heading * 2,
//           rotationOrigin: 'center center',
//           riseOnHover: true,
//           id: device.id,
//         } as ExtendedMarkerOptions)
//           .bindTooltip(tooltipContent, {
//             permanent: true,
//             direction: 'bottom',
//             offset: [0, 20],
//             opacity: 0.9,
//           })
//           .addTo(this.deviceLayer);

//         marker?.openPopup();
//       } else {
//         const newCoordinate = new L.LatLng(
//           device.last.y / 1e6,
//           device.last.x / 1e6,
//         );
//         marker.setLatLng(newCoordinate);
//         marker.setRotationAngle(device.last.heading * 2);
//         marker.setTooltipContent(tooltipContent);
//         marker.setIcon(icon);
//       }

//       this.mapService.setMarkerView(this.map(), marker, 14);
//     });
//   }
// }

import { Component, computed, input } from '@angular/core';

import { VehicleIconComponent } from '@shared/components';
import { ConnectionStatus } from '../vehicle-detail.service';

@Component({
  selector: 'app-detail-card',
  imports: [VehicleIconComponent],
  templateUrl: './detail-card.component.html',
})
export class DetailCardComponent {
  connection = input.required<ConnectionStatus>();

  waypointInfo = computed(() => [
    { ...this.connection().status?.formatted.voltage, colSpan: 'col-span-1' },
    { ...this.connection().status?.formatted.range, colSpan: 'col-span-1' },
    { ...this.connection().status?.formatted.odometer, colSpan: 'col-span-1' },
    { ...this.connection().status?.formatted.gpsSpeed, colSpan: 'col-span-1' },
    {
      ...this.connection().status?.formatted.vehicleSpeed,
      colSpan: 'col-span-1',
    },
    { ...this.connection().status?.formatted.odoTime, colSpan: 'col-span-2' },
  ]);
}

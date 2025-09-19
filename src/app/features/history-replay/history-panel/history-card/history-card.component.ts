import { Component, computed, input } from '@angular/core';
import { VehicleIconComponent } from '@shared/components';
import { HistoryWaypoint } from '@shared/types';

@Component({
  selector: 'app-history-card',
  imports: [VehicleIconComponent],
  templateUrl: './history-card.component.html',
})
export class HistoryCardComponent {
  waypoint = input.required<HistoryWaypoint>();
  isSelected = input.required<boolean>();

  waypointInfo = computed(() => [
    { ...this.waypoint().formatted.voltage, colSpan: 'col-span-1' },
    { ...this.waypoint().formatted.range, colSpan: 'col-span-1' },
    { ...this.waypoint().formatted.odometer, colSpan: 'col-span-1' },
    { ...this.waypoint().formatted.gpsSpeed, colSpan: 'col-span-1' },
    { ...this.waypoint().formatted.vehicleSpeed, colSpan: 'col-span-1' },
    { ...this.waypoint().formatted.odoTime, colSpan: 'col-span-2' },
  ]);
}

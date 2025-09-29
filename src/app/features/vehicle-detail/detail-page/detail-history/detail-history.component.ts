import { Component, input } from '@angular/core';
import { ConnectionStatus } from '@features/vehicle-detail/vehicle-detail.service';

@Component({
  selector: 'app-detail-history',
  imports: [],
  templateUrl: './detail-history.component.html',
})
export class DetailHistoryComponent {
  selectedConnectionStatus = input.required<ConnectionStatus | undefined>();
}

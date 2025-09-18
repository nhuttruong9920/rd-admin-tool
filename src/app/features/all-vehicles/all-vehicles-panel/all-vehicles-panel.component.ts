import {
  Component,
  computed,
  effect,
  inject,
  model,
  viewChild,
} from '@angular/core';
import { InputSearchComponent, ToolbarComponent } from '@shared/components';
import { DeviceStore } from '@shared/stores';
import { VehicleCardComponent } from './vehicle-card/vehicle-card.component';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { cdkScrollWhileHidden } from '@shared/utils';

@Component({
  selector: 'app-all-vehicles-panel',
  imports: [
    ToolbarComponent,
    InputSearchComponent,
    VehicleCardComponent,
    ScrollingModule,
  ],
  templateUrl: './all-vehicles-panel.component.html',
})
export class AllVehiclesPanelComponent {
  deviceStore = inject(DeviceStore);

  readonly cdkViewport = viewChild<CdkVirtualScrollViewport>('cdkViewport');

  selectedDeviceId = model.required<string | null>();
  selectedDeviceIdx = computed(() =>
    this.deviceStore
      .filteredData()
      ?.findIndex((device) => device.id === this.selectedDeviceId()),
  );

  protected searchImeis(event: string): void {
    this.deviceStore.setSearchTerm(event);
  }

  constructor() {
    effect(() => {
      const selectedDeviceIdx = this.selectedDeviceIdx();
      if (selectedDeviceIdx !== undefined && selectedDeviceIdx >= 0) {
        cdkScrollWhileHidden(this.cdkViewport(), selectedDeviceIdx, true);
      }
    });
  }
}

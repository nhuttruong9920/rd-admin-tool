import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { SplitPanelComponent } from '@shared/components';
import { VehicleHistoryMapComponent } from '@shared/components/vehicle-history-map.component';
import { DeviceStore, HistoryStore } from '@shared/stores';
import { HistoryPanelComponent } from './history-panel/history-panel.component';
import { GetDeviceHistoryReq } from '@shared/types';

@Component({
  selector: 'app-history-replay',
  imports: [
    SplitPanelComponent,
    VehicleHistoryMapComponent,
    HistoryPanelComponent,
  ],
  templateUrl: './history-replay.component.html',
})
export class HistoryReplayComponent implements OnInit {
  deviceStore = inject(DeviceStore);
  historyStore = inject(HistoryStore);

  formattedHistory = computed(
    () => this.historyStore.data()?.map((item) => item.formatted) ?? [],
  );

  historyChargeRanges = computed(() => this.historyStore.chargeRanges() ?? []);

  historyStopRanges = computed(() => this.historyStore.stopRanges() ?? []);

  // playing
  batteryPercentageInterval = signal<number>(5);
  isHistoryPlaying = linkedSignal(() => {
    void this.historyStore.data();
    return false;
  });
  selectedPlayingSpeed = signal<number>(500);
  currentPlayingIndex = linkedSignal(() => {
    void this.historyStore.data();
    return 0;
  });
  selectedWaypoint = computed(
    () => this.historyStore.data()?.[this.currentPlayingIndex()],
  );

  isStepHolding = signal<boolean>(false);
  holdDelayTimeout: ReturnType<typeof setTimeout> | null = null;
  holdInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      console.log('historyStore.data()', this.historyStore.stopRanges());
    });
  }

  ngOnInit(): void {
    this.deviceStore.ensureData();
  }

  fetchHistory(request: GetDeviceHistoryReq): void {
    this.historyStore.fetchHistory(request);
  }
}

import {
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { SplitPanelComponent } from '@shared/components';
import { VehicleHistoryMapComponent } from '@shared/components/vehicle-history-map.component';
import { ConnectionStore, HistoryStore } from '@shared/stores';
import { GetDeviceHistoryReq } from '@shared/types';
import { HistoryPanelComponent } from './history-panel/history-panel.component';

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
  connectionStore = inject(ConnectionStore);
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
    () => this.historyStore.data()?.[this.currentPlayingIndex()]?.formatted,
  );

  isStepHolding = signal<boolean>(false);
  holdDelayTimeout: ReturnType<typeof setTimeout> | null = null;
  holdInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.connectionStore.ensureData();
  }

  fetchHistory(request: GetDeviceHistoryReq): void {
    this.historyStore.fetchHistory(request);
  }
}

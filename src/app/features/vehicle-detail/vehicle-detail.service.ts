import { computed, inject, Injectable, signal } from '@angular/core';

import { ConnectionStore, DeviceStore } from '@shared/stores';
import { ConnectionDto, DeviceStatus } from '@shared/types';

export type ConnectionStatus = ConnectionDto & {
  status: DeviceStatus | undefined;
};

@Injectable()
export class VehicleDetailService {
  #connectionStore = inject(ConnectionStore);
  #deviceStore = inject(DeviceStore);

  connectionStatus = computed(() => this.mapDeviceStatusOptions());
  selectedConnectionId = signal<string | undefined>(undefined);
  selectedConnectionStatus = computed(() =>
    this.connectionStatus().find(
      (connection) => connection.imei === this.selectedConnectionId(),
    ),
  );

  constructor() {
    this.#deviceStore.ensureData();
  }

  private mapDeviceStatusOptions(): ConnectionStatus[] {
    const connections = this.#connectionStore.data();
    if (!connections) return [];

    const statuses = this.#deviceStore.data() ?? [];

    const connectionStatus = connections
      .map((connection) => {
        const status = statuses.find((status) => status.id === connection.imei);
        return {
          ...connection,
          status,
        };
      })
      .sort((a) => (a.status ? -1 : 1));

    return connectionStatus;
  }
}

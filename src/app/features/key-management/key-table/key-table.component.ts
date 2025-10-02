import { Component, computed, inject, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { DataStateComponent, CopyButtonComponent } from '@shared/components';
import { ToDatePipe } from '@shared/pipes';
import { ServiceKeyStore } from '@shared/stores';
import { KeyStatus, ServiceKey } from '@shared/types';

@Component({
  selector: 'app-key-table',
  imports: [
    TableModule,
    ButtonModule,
    DataStateComponent,
    ToDatePipe,
    CopyButtonComponent,
    TooltipModule,
  ],
  templateUrl: './key-table.component.html',
})
export class KeyTableComponent {
  serviceKeyStore = inject(ServiceKeyStore);

  keyStatues = input<KeyStatus[]>();

  detail = output<ServiceKey>();
  assign = output<ServiceKey>();
  update = output<ServiceKey>();

  filteredDataWithStatus = computed(() =>
    this.serviceKeyStore.filteredData().map((data) => ({
      ...data,
      formattedStatus: this.keyStatues()?.[data.status] ?? {
        id: 0,
        name: 'Available',
        textColor: 'text-blue-500',
        backgroundColor: 'bg-blue-500/50',
      },
    })),
  );

}

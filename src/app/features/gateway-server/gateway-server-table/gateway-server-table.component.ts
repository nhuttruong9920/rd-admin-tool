import { KeyValuePipe } from '@angular/common';
import { Component, inject, output, signal, viewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';

import { ToDatePipe } from '@shared/pipes';
import { GatewayServerStore } from '@shared/stores';
import { DataStateComponent } from '@shared/components';

@Component({
  selector: 'app-gateway-server-table',
  imports: [
    TableModule,
    ToDatePipe,
    ButtonModule,
    KeyValuePipe,
    PopoverModule,
    DataStateComponent,
  ],
  templateUrl: './gateway-server-table.component.html',
})
export class GatewayServerTableComponent {
  gatewayServerStore = inject(GatewayServerStore);

  update = output<string>();
  delete = output<string>();

  metadataPopover = viewChild.required<Popover>('metadataPopover');
  selectedMetadata = signal<Record<string, string> | null>(null);

  protected displayMetadata(
    event: Event,
    metadata: Record<string, string>,
  ): void {
    if (this.selectedMetadata() === metadata) {
      this.metadataPopover()?.hide();
      this.selectedMetadata.set(null);
    } else {
      this.selectedMetadata.set(metadata);
      this.metadataPopover()?.show(event);

      if (this.metadataPopover().container) {
        this.metadataPopover()?.align();
      }
    }
  }
}

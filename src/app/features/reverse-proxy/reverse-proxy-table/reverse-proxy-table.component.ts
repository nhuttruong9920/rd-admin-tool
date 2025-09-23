import { NgClass } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { ToDatePipe } from '@shared/pipes';
import { ReverseProxyStore } from '@shared/stores';
import { ReverseProxyConfigDto } from '@shared/types';

@Component({
  selector: 'app-reverse-proxy-table',
  imports: [TableModule, NgClass, ToDatePipe, ButtonModule],
  templateUrl: './reverse-proxy-table.component.html',
})
export class ReverseProxyTableComponent {
  reverseProxyStore = inject(ReverseProxyStore);

  updateReverseProxy = output<string>();
  deleteReverseProxy = output<string>();
  detailReverseProxy = output<ReverseProxyConfigDto>();

  reverseProxyConfigs = computed(() =>
    this.reverseProxyStore.filteredData().map((proxy) => proxy.configs),
  );
}

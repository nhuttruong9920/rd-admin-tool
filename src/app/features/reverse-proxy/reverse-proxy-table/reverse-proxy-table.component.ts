import { Component, inject, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { ToDatePipe } from '@shared/pipes';
import { ReverseProxyStore } from '@shared/stores';
import { ReverseProxyDto } from '@shared/types';

@Component({
  selector: 'app-reverse-proxy-table',
  imports: [TableModule, ToDatePipe, ButtonModule],
  templateUrl: './reverse-proxy-table.component.html',
})
export class ReverseProxyTableComponent {
  reverseProxyStore = inject(ReverseProxyStore);

  update = output<string>();
  delete = output<string>();
  detail = output<ReverseProxyDto>();
}

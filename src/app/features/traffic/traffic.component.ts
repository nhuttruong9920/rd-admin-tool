import { Component, inject } from '@angular/core';

import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';

import { TrafficStore } from '@shared/stores';
import { TrafficByRouteComponent } from './traffic-by-route/traffic-by-route.component';
import { TrafficSummaryComponent } from './traffic-summary/traffic-summary.component';

@Component({
  selector: 'app-traffic',
  imports: [TrafficSummaryComponent, TrafficByRouteComponent],
  templateUrl: './traffic.component.html',
  providers: [provideEchartsCore({ echarts }), TrafficStore],
})
export class TrafficComponent {
  trafficStore = inject(TrafficStore);

  constructor() {
    this.trafficStore.ensureData();
  }
}

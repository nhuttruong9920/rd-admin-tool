import { Component, inject } from '@angular/core';

import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';

import { TrafficStore } from '@shared/stores';
import { TrafficByRouteComponent } from './traffic-by-route/traffic-by-route.component';
import { TrafficSummaryComponent } from './traffic-summary/traffic-summary.component';
import { TrafficTimeRangeComponent } from '@shared/components';
import { TrafficTimeRange } from '@shared/types';

@Component({
  selector: 'app-traffic',
  imports: [TrafficSummaryComponent, TrafficByRouteComponent, TrafficTimeRangeComponent],
  templateUrl: './traffic.component.html',
  providers: [provideEchartsCore({ echarts }), TrafficStore],
})
export class TrafficComponent {
  trafficStore = inject(TrafficStore);

  constructor() {
    this.trafficStore.ensureData();
  }

  onSubmitTimeRange(timeRange: TrafficTimeRange): void {
  console.log('timeRange', timeRange);
  }
}

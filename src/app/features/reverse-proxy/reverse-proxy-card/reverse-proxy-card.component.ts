import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { ToDatePipe } from '@shared/pipes';
import { ReverseProxyConfigDto } from '@shared/types';

@Component({
  selector: 'app-reverse-proxy-card',
  imports: [ToDatePipe, ButtonModule, KeyValuePipe],
  templateUrl: './reverse-proxy-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverseProxyCardComponent {
  reverseProxy = input.required<ReverseProxyConfigDto>();
  update = output<string>();
  delete = output<string>();
  closeDialog = output<void>();

  routeGeneral = computed(() => [
    { label: 'Cluster ID', value: this.reverseProxy().route.clusterId },
    { label: 'Order', value: this.reverseProxy().route.order },
    {
      label: 'Authorization policy',
      value: this.reverseProxy().route.authorizationPolicy,
    },
    {
      label: 'Rate limiter policy',
      value: this.reverseProxy().route.rateLimiterPolicy,
    },
    {
      label: 'Output cache policy',
      value: this.reverseProxy().route.outputCachePolicy,
    },
    {
      label: 'Timeout policy',
      value: this.reverseProxy().route.timeoutPolicy,
    },
    {
      label: 'Cors policy',
      value: this.reverseProxy().route.corsPolicy,
    },
    {
      label: 'Load balancing policy',
      value: this.reverseProxy().cluster.loadBalancingPolicy,
    },
    { label: 'Timeout', value: this.reverseProxy().route.timeout },
  ]);

  clusterGeneral = computed(() => [
    {
      label: 'Cluster ID',
      value: this.reverseProxy().cluster.clusterId,
    },
    {
      label: 'Timeout',
      value: this.reverseProxy().cluster.httpRequest.timeout,
    },
    {
      label: 'Load balancing policy',
      value: this.reverseProxy().cluster.loadBalancingPolicy,
    },
  ]);

  constructor() {
    effect(() => {
      console.log(this.reverseProxy());
    });
  }
}

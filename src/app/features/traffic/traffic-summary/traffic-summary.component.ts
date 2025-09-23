import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import {} from 'echarts/core';
import { use as useEcharts, EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';

import { ThemeService } from '@core/services';
import { TrafficSummaryDto } from '@shared/types';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

useEcharts([
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  TooltipComponent,
  ToolboxComponent,
]);

@Component({
  selector: 'app-traffic-summary',
  imports: [NgxEchartsDirective],
  templateUrl: './traffic-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrafficSummaryComponent {
  readonly #themeService = inject(ThemeService);
  isDarkMode = computed(() => this.#themeService.isDarkMode());
  trafficSummary = input.required<TrafficSummaryDto | undefined>();

  summaryCards = computed(() => {
    const data = this.trafficSummary() as TrafficSummaryDto;
    if (!data) return [];

    return [
      {
        label: 'Total Requests',
        value: data.totalRequests,
        icon: {
          iconClass: 'fas fa-server',
          bgClass: 'bg-blue-500',
        },
      },
      {
        label: 'Total RPS',
        value: data.overallRps.toFixed(2),
        icon: {
          iconClass: 'fas fa-tachometer-alt',
          bgClass: 'bg-amber-500',
        },
      },
      {
        label: 'Error Rate',
        value: data.overallErrorRate.toFixed(2),
        unit: '%',
        icon: {
          iconClass: 'fas fa-exclamation-triangle',
          bgClass: 'bg-red-500',
        },
      },
      {
        label: 'P95 Latency',
        value: data.overallLatency.toFixed(2),
        unit: 'ms',
        icon: {
          iconClass: 'fas fa-clock',
          bgClass: 'bg-green-500',
        },
      },
    ];
  });

  statusCodeChart = computed<EChartsCoreOption>(() => {
    const data = this.trafficSummary() as TrafficSummaryDto;
    if (!data?.overallStatusPercentages || !data?.byStatus) return {};

    const statusData = Object.entries(data.overallStatusPercentages)
      .filter(([, percentage]) => percentage > 0)
      .map(([status, percentage]) => {
        const count = data.byStatus[status] || 0;
        return {
          name: status,
          value: percentage,
          count: count,
        };
      });

    const getStatusColor = (status: string): string => {
      const code = parseInt(status);
      if (code >= 100 && code < 200) return '#3498db';
      if (code >= 200 && code < 300) return '#52c41a';
      if (code >= 300 && code < 400) return '#ff9800 ';
      if (code >= 400 && code < 500) return '#dc3545';
      if (code >= 500) return '#721c24';
      return '#d9d9d9';
    };

    return {
      title: {
        text: 'Status Code Distribution',
        right: 0,
        textStyle: {
          fontSize: 14,
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          fontSize: 10,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (
          params: any,
        ): string => `<p style="display: flex; align-items: center;">
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" style="display: inline-block;">
    <circle cx="5" cy="5" r="5" fill="${params.data.itemStyle.color}"/>
  </svg>
  <span style="margin-left: 4px;">${params.name}</span>
</p> ${params.data.count}  (${params.percent}%)`,
      },
      series: [
        {
          name: 'Status Codes',
          type: 'pie',
          radius: ['20%', '80%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'inner',
            color: '#fff',
            fontSize: 12,
          },
          minShowLabelAngle: 15,
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: statusData.map((item) => ({
            ...item,
            itemStyle: {
              color: getStatusColor(item.name),
            },
          })),
        },
      ],
    };
  });

  methodChart = computed<EChartsCoreOption>(() => {
    const data = this.trafficSummary() as TrafficSummaryDto;
    if (!data?.byMethod) return {};

    const methodData = Object.entries(data.byMethod)
      .filter(([, count]) => count > 0)
      .map(([method, count]) => {
        const percentage = (count / data.totalRequests) * 100;
        return {
          name: method,
          value: percentage,
          count: count,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    const getMethodColor = (method: string): string => {
      const methodColors: Record<string, string> = {
        GET: '#52c41a', // Green
        POST: '#1890ff', // Blue
        PUT: '#fa8c16', // Orange
        DELETE: '#f5222d', // Red
        PATCH: '#722ed1', // Purple
        HEAD: '#13c2c2', // Cyan
        OPTIONS: '#eb2f96', // Magenta
      };
      return methodColors[method.toUpperCase()] || '#d9d9d9';
    };

    return {
      title: {
        text: 'HTTP Method Distribution',
        right: 0,
        textStyle: {
          fontSize: 14,
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          fontSize: 10,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (
          params: any,
        ): string => `<p style="display: flex; align-items: center;">
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" style="display: inline-block;">
    <circle cx="5" cy="5" r="5" fill="${params.data.itemStyle.color}"/>
  </svg>
  <span style="margin-left: 4px;">${params.name}</span>
</p> ${params.data.count}  (${params.percent}%)`,
      },
      series: [
        {
          name: 'HTTP Methods',
          type: 'pie',
          radius: ['20%', '80%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'inner',
            color: '#fff',
            fontSize: 12,
          },
          minShowLabelAngle: 15,
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: methodData.map((item) => ({
            ...item,
            itemStyle: {
              color: getMethodColor(item.name),
            },
          })),
        },
      ],
    };
  });
}

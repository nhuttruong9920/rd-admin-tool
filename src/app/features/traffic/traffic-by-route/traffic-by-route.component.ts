import {
  Component,
  computed,
  inject,
  input
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { EChartsCoreOption, use as useEcharts } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';

import { ThemeService } from '@core/services';
import { TrafficByRouteDto } from '@shared/types';
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
  LineChart,
  PieChart,
  TitleComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  TooltipComponent,
  ToolboxComponent,
]);

@Component({
  selector: 'app-traffic-by-route',
  imports: [
    NgxEchartsDirective,
    TableModule,
    ButtonModule,
    RippleModule,
    DecimalPipe,
  ],
  templateUrl: './traffic-by-route.component.html',
})
export class TrafficByRouteComponent {
  readonly #themeService = inject(ThemeService);
  isDarkMode = computed(() => this.#themeService.isDarkMode());
  trafficByRoute = input.required<TrafficByRouteDto[] | undefined>();

  // Row expansion state
  expandedRows: Record<string, boolean> = {};

  // Table data
  tableData = computed(() => {
    const data = this.trafficByRoute();
    if (!data || data.length === 0) return [];

    return [...data]
      .sort((a, b) => b.totalRequest - a.totalRequest)
      .map((route) => ({
        ...route,
        // Format methods as a string
        methodsDisplay: Object.entries(route.byMethod)
          .filter(([, count]) => count > 0)
          .map(([method, count]) => `${method}: ${count.toLocaleString()}`)
          .join(', '),
        // Format status codes as a string
        statusDisplay: Object.entries(route.byStatus)
          .filter(([, count]) => count > 0)
          .map(([status, count]) => `${status}: ${count.toLocaleString()}`)
          .join(', '),
      }));
  });

  // Bar chart: Requests by Route with line metrics
  requestsByRouteChart = computed<EChartsCoreOption>(() => {
    const data = this.trafficByRoute();
    if (!data || data.length === 0) return {};

    const sortedData = [...data].sort(
      (a, b) => b.totalRequest - a.totalRequest,
    );
    const routes = sortedData.map((item) => item.routeId);
    const requests = sortedData.map((item) => item.totalRequest);
    const errorRates = sortedData.map((item) => item.routeErrorRate);
    const latencies = sortedData.map((item) => item.routeLatency);
    const rps = sortedData.map((item) => item.routeRps);

    return {
      title: {
        text: 'Requests by Route with Metrics',
        left: 'center',
        textStyle: {
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any): string => {
          let result = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((param: any) => {
            const unit =
              param.seriesName === 'Error Rate'
                ? '%'
                : param.seriesName === 'Latency'
                  ? 'ms'
                  : param.seriesName === 'RPS'
                    ? '/s'
                    : '';
            result += `${param.seriesName}: ${param.value.toLocaleString()}${unit}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['Requests', 'Error Rate', 'Latency', 'RPS'],
        top: 30,
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: routes,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Requests',
          position: 'left',
          axisLabel: {
            formatter: (value: number): string => value.toLocaleString(),
          },
        },
        {
          type: 'value',
          name: 'Metrics (% / ms / RPS)',
          position: 'right',
          axisLabel: {
            formatter: (value: number): string => value.toFixed(1),
          },
        },
      ],
      series: [
        {
          name: 'Requests',
          type: 'bar',
          yAxisIndex: 0,
          data: requests,
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#40a9ff',
            },
          },
        },
        {
          name: 'Error Rate',
          type: 'line',
          yAxisIndex: 1,
          data: errorRates,
          lineStyle: {
            color: '#f5222d',
            width: 2,
          },
          itemStyle: {
            color: '#f5222d',
          },
          symbol: 'circle',
          symbolSize: 6,
        },
        {
          name: 'Latency',
          type: 'line',
          yAxisIndex: 1,
          data: latencies,
          lineStyle: {
            color: '#52c41a',
            width: 2,
          },
          itemStyle: {
            color: '#52c41a',
          },
          symbol: 'triangle',
          symbolSize: 6,
        },
        {
          name: 'RPS',
          type: 'line',
          yAxisIndex: 1,
          data: rps,
          lineStyle: {
            color: '#fa8c16',
            width: 2,
          },
          itemStyle: {
            color: '#fa8c16',
          },
          symbol: 'diamond',
          symbolSize: 6,
        },
      ],
    };
  });

  // Stacked bar: Requests by Method per Route
  requestsByMethodPerRouteChart = computed<EChartsCoreOption>(() => {
    const data = this.trafficByRoute();
    if (!data || data.length === 0) return {};

    const sortedData = [...data].sort(
      (a, b) => b.totalRequest - a.totalRequest,
    );
    const routes = sortedData.map((item) => item.routeId);

    // Get all unique methods
    const allMethods = new Set<string>();
    sortedData.forEach((route) => {
      Object.keys(route.byMethod).forEach((method) => allMethods.add(method));
    });
    const methods = Array.from(allMethods).sort();

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

    const series = methods.map((method) => ({
      name: method,
      type: 'bar',
      stack: 'total',
      data: sortedData.map((route) => route.byMethod[method] || 0),
      itemStyle: {
        color: getMethodColor(method),
      },
    }));

    return {
      title: {
        text: 'Requests by Method per Route',
        left: 'center',
        textStyle: {
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any): string => {
          let result = `<strong>${params[0].name}</strong><br/>`;
          let total = 0;
          params.forEach((param: any) => {
            if (param.value > 0) {
              result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
              total += param.value;
            }
          });
          result += `<strong>Total: ${total.toLocaleString()}</strong>`;
          return result;
        },
      },
      legend: {
        data: methods,
        top: 30,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: routes,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Requests',
        axisLabel: {
          formatter: (value: number): string => value.toLocaleString(),
        },
      },
      series: series,
    };
  });

  // Stacked bar: Status codes by Route
  statusCodesByRouteChart = computed<EChartsCoreOption>(() => {
    const data = this.trafficByRoute();
    if (!data || data.length === 0) return {};

    const sortedData = [...data].sort(
      (a, b) => b.totalRequest - a.totalRequest,
    );
    const routes = sortedData.map((item) => item.routeId);

    // Get all unique status codes
    const allStatusCodes = new Set<string>();
    sortedData.forEach((route) => {
      Object.keys(route.byStatus).forEach((status) =>
        allStatusCodes.add(status),
      );
    });
    const statusCodes = Array.from(allStatusCodes).sort();

    const getStatusColor = (status: string): string => {
      const code = parseInt(status);
      if (code >= 100 && code < 200) return '#3498db';
      if (code >= 200 && code < 300) return '#52c41a';
      if (code >= 300 && code < 400) return '#ff9800';
      if (code >= 400 && code < 500) return '#dc3545';
      if (code >= 500) return '#721c24';
      return '#d9d9d9';
    };

    const series = statusCodes.map((status) => ({
      name: status,
      type: 'bar',
      stack: 'total',
      data: sortedData.map((route) => route.byStatus[status] || 0),
      itemStyle: {
        color: getStatusColor(status),
      },
    }));

    return {
      title: {
        text: 'Status Codes by Route',
        left: 'center',
        textStyle: {
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any): string => {
          let result = `<strong>${params[0].name}</strong><br/>`;
          let total = 0;
          params.forEach((param: any) => {
            if (param.value > 0) {
              result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
              total += param.value;
            }
          });
          result += `<strong>Total: ${total.toLocaleString()}</strong>`;
          return result;
        },
      },
      legend: {
        data: statusCodes,
        top: 30,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: routes,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Requests',
        axisLabel: {
          formatter: (value: number): string => value.toLocaleString(),
        },
      },
      series: series,
    };
  });

  // Helper methods for row expansion tables
  getMethodsArray(
    route: TrafficByRouteDto,
  ): { name: string; count: number; percentage: number }[] {
    return Object.entries(route.byMethod)
      .filter(([, count]) => (count as number) > 0)
      .map(([method, count]) => ({
        name: method,
        count: count as number,
        percentage: ((count as number) / route.totalRequest) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getStatusArray(
    route: TrafficByRouteDto,
  ): { name: string; count: number; percentage: number }[] {
    return Object.entries(route.byStatus)
      .filter(([, count]) => (count as number) > 0)
      .map(([status, count]) => ({
        name: status,
        count: count as number,
        percentage: ((count as number) / route.totalRequest) * 100,
      }));
  }

  getTimeSeriesArray(
    route: TrafficByRouteDto,
  ): { period: string; count: number }[] {
    return [
      { period: 'Last 1 second', count: route.byTimeSeries.last1s },
      { period: 'Last 1 minute', count: route.byTimeSeries.last1m },
      { period: 'Last 1 hour', count: route.byTimeSeries.last1h },
      { period: 'Last 1 day', count: route.byTimeSeries.last1d },
    ];
  }

  getStatusClass(status: string): string {
    const code = parseInt(status);
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 300 && code < 400) return 'text-orange-600';
    if (code >= 400 && code < 500) return 'text-red-600';
    if (code >= 500) return 'text-red-800';
    return 'text-blue-600';
  }
}

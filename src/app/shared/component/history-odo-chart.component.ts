import { Component, computed, inject, input } from '@angular/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  MarkPointComponent,
  GridComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  TooltipComponent,
  ToolboxComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsCoreOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { ThemeService } from '@core/services';
import { FormattedWaypoint } from '@shared/types';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
echarts.use([
  BarChart,
  TitleComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  TooltipComponent,
  ToolboxComponent,
  PieChart,
  LineChart,
  MarkPointComponent,
  MarkLineComponent,
]);

@Component({
  selector: 'app-history-odo-chart',
  imports: [NgxEchartsDirective],
  template: `
    <section
      echarts
      [options]="combinedChartOptions()"
      [theme]="isDarkMode() ? 'dark' : 'light'"
      class="w-full h-full"
    ></section>
  `,
  providers: [provideEchartsCore({ echarts })],
})
export class HistoryOdoChartComponent {
  #themeService = inject(ThemeService);

  isDarkMode = computed(() => this.#themeService.isDarkMode());

  formattedWaypoints = input.required<FormattedWaypoint[]>();
  combinedChartOptions = computed<EChartsCoreOption>(() => {
    const waypoints = this.formattedWaypoints();
    if (!waypoints?.length) return {};

    const batteryData = waypoints
      .map((waypoint) => {
        const battery = waypoint.battery;
        if (!battery || battery.value === undefined || battery.value === null)
          return null;
        return {
          value: battery.value,
          time: waypoint.gpsTime,
        };
      })
      .filter((item): item is { value: number; time: string } => item !== null);

    const rangeData = waypoints
      .map((waypoint) => {
        const range = waypoint.range;
        if (!range || range.value === undefined || range.value === null)
          return null;
        const rangeValue =
          typeof range.value === 'string'
            ? parseFloat(range.value)
            : range.value;
        if (isNaN(rangeValue)) return null;
        return {
          value: rangeValue,
          time: waypoint.gpsTime,
        };
      })
      .filter((item): item is { value: number; time: string } => item !== null);

    const speedData = waypoints
      .map((waypoint) => {
        const vehicleSpeed = waypoint.vehicleSpeed;
        if (
          !vehicleSpeed ||
          vehicleSpeed.value === undefined ||
          vehicleSpeed.value === null
        )
          return null;
        return {
          value: vehicleSpeed.value,
          time: waypoint.gpsTime,
        };
      })
      .filter((item): item is { value: number; time: string } => item !== null);

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown): string => {
          if (Array.isArray(params) && params.length > 0) {
            const time = (params[0] as { axisValue: string }).axisValue;
            let result = `${time}<br/>`;
            params.forEach(
              (param: { seriesName: string; value: number; color: string }) => {
                let unit = '';
                if (param.seriesName === 'Mức pin') unit = '%';
                else if (param.seriesName === 'Quãng đường') unit = ' km';
                else if (param.seriesName === 'Tốc độ') unit = ' km/h';
                const colorDot = `<span class="inline-block mr-1 size-2 rounded-full" style="background-color:${param.color};"></span>`;
                result += `${colorDot}${param.seriesName}: ${param.value}${unit}<br/>`;
              },
            );
            return result;
          }
          return '';
        },
        textStyle: {
          fontSize: 10,
        },
        padding: [4, 8],
      },
      // legend: {
      //   data: ['Mức pin', 'Quãng đường', 'Tốc độ'],
      //   bottom: 0,
      //   textStyle: {
      //     fontSize: 10,
      //   },
      // },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: false,
        },
      ],

      grid: {
        left: '2%',
        right: '2%',
        bottom: '2%',
        top: '2%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: batteryData.map((item) => item.time),
        show: false,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Pin (%)',
          position: 'left',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            fontSize: 10,
          },
          nameTextStyle: {
            fontSize: 10,
          },
        },
        {
          type: 'value',
          name: 'km - km/h',
          position: 'right',
          min: 0,
          axisLabel: {
            formatter: '{value}',
            fontSize: 10,
          },
          nameTextStyle: {
            fontSize: 10,
          },
        },
      ],
      series: [
        {
          name: 'Mức pin',
          type: 'line',
          yAxisIndex: 0,
          data: batteryData.map((item) => item.value),
          smooth: true,
          showSymbol: false,
          color: '#52c41a',
          lineStyle: {
            width: 2,
          },
        },
        {
          name: 'Quãng đường',
          type: 'line',
          yAxisIndex: 1,
          data: rangeData.map((item) => item.value),
          smooth: true,
          showSymbol: false,
          color: '#1890ff',
          lineStyle: {
            width: 2,
          },
        },
        {
          name: 'Tốc độ',
          type: 'line',
          yAxisIndex: 1,
          data: speedData.map((item) => item.value),
          smooth: true,
          showSymbol: false,
          color: '#ff4d4f',
          lineStyle: {
            width: 0.3,
          },
        },
      ],
    };
  });
}

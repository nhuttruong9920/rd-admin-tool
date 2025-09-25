type TrafficTimeRange = `${number}${'s' | 'm' | 'h' | 'd' | 'mo' | 'y'}`;

type TrafficReq = {
  timeRange?: TrafficTimeRange;
  compareMode?: TrafficTimeRange;
  routeId?: string;
  top?: number;
  metrics?: string;
  pLatency?: number;
};

type TrafficByRouteDto = {
  routeId: string;
  totalRequest: number;
  routeRps: number;
  routeErrorRate: number;
  routeLatency: number;
  routeStatusPercentages: Record<string, number>;
  byTimeSeries: {
    last1s: number;
    last1m: number;
    last1h: number;
    last1d: number;
  };
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
};

type TrafficSummaryDto = {
  totalRequests: number;
  overallRps: number;
  overallErrorRate: number;
  overallLatency: number;
  overallStatusPercentages: Record<string, number>;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
};

type DeltaValueDto = {
  currentValue: number;
  compareValue: number;
  valueChange: number;
  percentChange: number;
};

type SummaryDeltaDto = {
  totalRequests: DeltaValueDto;
  overallRps: DeltaValueDto;
  overallErrorRate: DeltaValueDto;
  overallLatency: DeltaValueDto;
  byMethod: Record<string, DeltaValueDto>;
  byStatus: Record<string, DeltaValueDto>;
};

type ByRouteDeltaDto = {
  totalRequest: DeltaValueDto;
  routeRps: DeltaValueDto;
  routeErrorRate: DeltaValueDto;
  routeLatency: DeltaValueDto;
  byMethod: Record<string, DeltaValueDto>;
  byStatus: Record<string, DeltaValueDto>;
};

type TrafficDto = {
  presetWindowTotals: {
    last1s: number;
    last1m: number;
    last1h: number;
    last1d: number;
  };
  overview: {
    summary: TrafficSummaryDto;
    byRoute: TrafficByRouteDto[];
  };
  deltas: {
    window: {
      mode: string;
      currentTime: { from: string; to: string };
    };
    summary: SummaryDeltaDto;

    byRoute: ByRouteDeltaDto[];
  };
};

export type {
  TrafficTimeRange,
  TrafficReq,
  TrafficDto,
  TrafficByRouteDto,
  TrafficSummaryDto,
  DeltaValueDto,
  SummaryDeltaDto,
  ByRouteDeltaDto,
};

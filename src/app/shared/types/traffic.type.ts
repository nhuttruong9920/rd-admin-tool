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

type TrafficDto = {
  presetWindowTotals: {
    last1s: number;
    last1m: number;
    last1h: number;
    last1d: number;
  };
  summary: TrafficSummaryDto;
  byRoute: TrafficByRouteDto[];
};

export type { TrafficDto, TrafficByRouteDto, TrafficSummaryDto };

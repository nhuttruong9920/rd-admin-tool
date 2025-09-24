type RouteMatch = {
  path: string;
  hosts: string | null;
  methods: string | null;
  headers: string | null;
  queryParams: string | null;
};

type Route = {
  clusterId: string;
  match: RouteMatch;
  order: number;
  authorizationPolicy: string | null;
  rateLimiterPolicy: string | null;
  outputCachePolicy: string | null;
  timeoutPolicy: string | null;
  corsPolicy: string | null;
  timeout: string | null;
  metadata: Record<string, string>;
  transforms: Record<string, string>[];
};

type SwaggerConfig = {
  prefixPath: string;
  pathFilterRegexPattern: string;
  paths: string[];
  addOnlyPublishedPaths: boolean;
  metadataPath: string;
};

type Destination = {
  address: string;
  metadata: Record<string, string> | null;
  swaggers: SwaggerConfig[];
};

type Cluster = {
  clusterId: string;
  loadBalancingPolicy: string;
  destinations?: { destination1?: Destination };
  httpRequest: {
    timeout: string;
  };
};


type ReverseProxyDto = {
  route: Route;
  cluster: Cluster;
  createdAt: string; // ISO 8601 datetime string
  state: boolean;
  gatewayServerId: string | null;
  environment: string | null;
  lastAppliedAt: string | null;
  id: string;
  lastModified: string; // ISO 8601 datetime string
  isDeleted: boolean;
};

type ReverseProxyCtaDto = {
  id: string;
  message: string;
};

type CreateUpdateReverseProxyReq = {
  id: string;
  destinationAddress: string;
  swaggers: SwaggerConfig[];
  timeoutSeconds: number;
  path: string;
  order: number;
  authorizationPolicy: string;
  rateLimiterPolicy: string;
  outputCachePolicy: string;
  timeoutPolicy: string;
  corsPolicy: string;
  loadBalancingPolicy: string;
  timeout: string;
  metadata: Record<string, string>;
  transforms: Record<string, string>[];
};

type ReverseProxyApplyConfigReq = {
  routeIds: string[];
};

type ReverseProxyAppliedDto = {
  message: string;
  appliedRoutes?: string[];
  environment?: string;
  type?: 'update' | 'delete';
  routeCount?: 1;
  updatedAt?: string;
  errorCode?: string;
};

type ReverseProxyOptionDto = {
  label: string;
  field: string;
  id: number;
};

export type {
  ReverseProxyOptionDto,
  SwaggerConfig,
  Destination,
  Cluster,
  ReverseProxyDto,
  ReverseProxyCtaDto,
  CreateUpdateReverseProxyReq,
  ReverseProxyAppliedDto,
  ReverseProxyApplyConfigReq,
};

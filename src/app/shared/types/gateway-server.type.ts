type GatewayServerDto = {
  id: string;
  name: string;
  metadata: Record<string, string> | null;
  baseUrl: string;
  createdAt: string;
  lastModified: string;
  isDeleted: boolean;
};

type UpdateGatewayServerReq = {
  name: string;
  baseUrl: string;
  metadata: Record<string, string> | null;
};

type CreateGatewayServerReq = UpdateGatewayServerReq & {
  id: string;
};

type CtaSuccessDto = {
  message: string;
};

type CtaFailDto = {
  type: string;
  title: string;
  status: number;
  errors: Record<string, string[]>;
};

type GatewayServerHealthDto = {
  serverId: string;
  serverName: string;
  baseUrl: string;
  testUrl: string;
  isHealthy: boolean;
  statusCode: number;
  checkedAt: string; // ISO 8601 datetime string
  message: string;
  errorDetail: string | null;
};

type AllGatewayServerHealthDto = {
  totalServers: number;
  healthyCount: number;
  unhealthyCount: number;
  checkedAt: string; // ISO 8601 datetime string
  serverHealths: GatewayServerHealthDto[];
};

type CreateGatewayServerRes = (CtaSuccessDto & { id: string }) | CtaFailDto;

type UpdateGatewayServerRes = CtaSuccessDto | CtaFailDto;

export type {
  GatewayServerDto,
  UpdateGatewayServerReq,
  CreateGatewayServerReq,
  GatewayServerHealthDto,
  AllGatewayServerHealthDto,
  CtaSuccessDto,
  CtaFailDto,
  CreateGatewayServerRes,
  UpdateGatewayServerRes,
};

type KeyApplicationDto = {
  id: number;
  appCode: string;
  appName: string;
  isActive: boolean;
  createdAt: string;
};

type KeyPackageDto = {
  id: string;
  appId: number;
  packageCode: string;
  name: string;
  durationInDays: number;
  price: number;
  currency: string;
  isActive: boolean;
};

type ServiceKeyDto = {
  id: string;
  keyCode: string;
  status: 0;
  assignedToUserId: string | null;
  validFrom: string;
  validUntil: string;
  generatedAt: string;
};

type ServiceKey = ServiceKeyDto & {
  formattedStatus: KeyStatus;
};

type ServiceKeyReq = {
  appId?: number;
  packageId?: string;
  status?: number;
  userId?: string;
};

type KeyStatus = {
  id: number;
  name: string;
  textColor: string;
  backgroundColor: string;
};

type KeyPackageReq = {
  appId?: number;
};

type GenerateKeyBatchReq = {
  appId: number;
  packageId: string;
  quantity: number;
};

type GeneratedKeyDto = {
  keys: ServiceKeyDto[];
  keysGenerated: number;
};

type AssignKeyReq = {
  keyCode: string;
  userId: string;
  reason: string | null;
  autoActivate: boolean;
};

type AssignKeyDto = {
  keyCode: string;
  assignedToUserId: string;
  status: number;
  subscription: {
    id: string;
    userId: string;
    packageName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    isActive: boolean;
    isSuspended: boolean;
  };
};

export type {
  KeyStatus,
  KeyApplicationDto,
  KeyPackageDto,
  ServiceKeyDto,
  ServiceKeyReq,
  GenerateKeyBatchReq,
  GeneratedKeyDto,
  KeyPackageReq,
  ServiceKey,
  AssignKeyReq,
  AssignKeyDto,
};

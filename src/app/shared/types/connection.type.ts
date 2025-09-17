type StatusDto = {
  vehicleId: string;
  gpsTime: number;
  sysTime: number;
  eventId: number;
  status: number;
  satellite: number;
  input: number;
  output: number;
  voltage: number;
  battery: number;
  input1: number;
  input2: number;
  input3: number;
  input4: number;
  regionId: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  heading: number;
  mile: number;
  gpsMile: number;
  checkSum: number;
  deviceTypeId: number;
  geometryId: string | null;
  driverId: string | null;
  driverCode: string | null;
  info: string;
  data: string;
  companyId: string;
  unitId: string;
  message: string;
  type: number;
  version: number;
  sensors: any;
  maxSpeed: number;
  roadSpeed: number;
  road: string;
  deviceId: string;
  params: string;
  valueSensors: any;
  distance: number;
  distance2: number;
  free: boolean;
  camInterval: number;
  camMask: number;
  fake: boolean;
  pin: string;
  gps: number;
  gpsMileage: number;
  distanceP2P: number;
  imei: string;
  serverType: number;
  vehicleType: number | null;
  sensorMask: number;
  geometry: any | null;
  vehicleKeys: any | null;
  companyKeys: any | null;
  keys: any | null;
};

type DeviceStatusDto = {
  id: string;
  gpsTime: number;
  last: StatusDto;
  pingTime: number;
  sleepTime: number;
  sleepInterval: number;
};

type GetRawPackageReq = {
  imei: string;
  isRaw: boolean;
  includeContent: boolean;
};

type GetSTDCommandReq = {
  imei: string;
};

type SendCommandReq = {
  imei: string;
  command: string;
  label: string;
  priority: number;
};

type GetInfoReq = {
  deviceType: number;
  data: string;
};

type GetDeviceStatusReq = {
  imeis: string;
  time: number;
};

type ConnectionDto = {
  imei: string;
  deviceType: number;
  deviceTypeName: string;
  cmdVersion: string;
  gpsTime: 0;
};

type PackageDto = {
  t: number;
  d: string;
  imei: string;
  v: string;
  p: number;
  o: number;
  s: number;
};

const PackageType = {
  0: {
    label: 'UTF8',
    value: 0,
    color: 'orange',
  },
  1: {
    label: 'STD',
    value: 1,
    color: 'green',
  },
  2: {
    label: 'SMS',
    value: 2,
    color: 'blue',
  },
  3: {
    label: 'PING',
    value: 3,
    color: 'cyan',
  },
  4: {
    label: 'HTML/ASCII',
    value: 4,
    color: 'purple',
  },
  5: {
    label: 'HTML/ASCII',
    value: 5,
    color: 'purple',
  },
} as const;

type Package = PackageDto & {
  type: { label: string; value: number; color: string };
  isNew: boolean;
};
type DeviceState =
  | 'disconnected'
  | 'offline'
  | 'stop'
  | 'running'
  | 'overspeed';

type FormattedInfo = {
  title: string;
  value: string;
  icon: string;
  iconClass: string;
};

type FormattedDevice = {
  address: string;
  pingTime: string;
  gpsTime: string;
  state: DeviceState;
  lat: number;
  long: number;
  mode: FormattedInfo | null;
  battery: FormattedInfo & { isCharging: boolean };
  gpsSpeed: FormattedInfo;
  range: FormattedInfo;
  vehicleSpeed: FormattedInfo;
  voltage: FormattedInfo;
  odometer: FormattedInfo;
  odoTime: FormattedInfo;
};

type DeviceStatus = DeviceStatusDto & {
  formatted: FormattedDevice;
};

type GetDeviceHistoryReq = {
  id: string;
  fromTime: string;
  toTime: string;
};

type HistoryWaypointDto = {
  gpsTime: number;
  heading: number;
  info: string;
  road: string;
  roadSpeed: number;
  satellite: 12;
  speed: number;
  status: number;
  unitId: string;
  voltage: number;
  x: number;
  y: number;
  params: string;
};

type HistoryWaypoint = HistoryWaypointDto & {
  currentState: DeviceState;
  stateColor: string;
  iconClass: string;
  parsedParams: Record<string, string>;
  deltaGpsSecs: number;
  parsedOdoMeter: OdoMeterData | null;
};

type HistoryStopRange = {
  startIndex: number;
  endIndex: number;
  duration: number;
  fromTime: number;
  toTime: number;
  x: number;
  y: number;
  info: string;
};

type OdoMeter = [
  mode: string, // '0' - '1'
  pin: string, //%
  range: string, //km
  chargeStatus: string, // '0' - '1'
  speed: string,
  time1: string,
  time2: string,
  time3: string,
  time4: string,
  voltage1: string,
  voltage2: string,
  odometer1: string,
  odometer2: string,
  odometer3: string,
];

type OdoMeterMode = {
  id: string;
  icon: string;
  name: string;
  classes: string;
};

type OdoMeterData = {
  mode: OdoMeterMode;
  battery: {
    value: number;
    isCharging: boolean;
    icon: string;
    iconClass: string;
  };
  range: number;
  isCharging: boolean;
  speed: number;
  time: string;
  voltage: number;
  odometer: number;
};

export type {
  ConnectionDto,
  DeviceState,
  DeviceStatus,
  DeviceStatusDto,
  FormattedDevice,
  FormattedInfo,
  GetDeviceHistoryReq,
  GetDeviceStatusReq,
  GetInfoReq,
  GetRawPackageReq,
  GetSTDCommandReq,
  HistoryStopRange,
  HistoryWaypoint,
  HistoryWaypointDto,
  OdoMeter,
  OdoMeterData,
  OdoMeterMode,
  Package,
  PackageDto,
  SendCommandReq,
  StatusDto,
};

export { PackageType };

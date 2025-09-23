import Hls from 'hls.js';

type LivestreamRequest = {
  imei: string;
  channel: number;
  streamTime: number;
};

type LivestreamDto = {
  Url: string;
  StreamTime: number;
};

type LivestreamVideo = {
  id: string;
  channel: number;
  imei: string;
  url: string;
  streamTime: number;
  error?: string;
  bandwidth?: string;
  hls?: Hls;
};

export type { LivestreamRequest, LivestreamVideo, LivestreamDto };

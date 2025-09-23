type StreamDto = {
  streamId: string;
  clientId: number;
  streamPath: string;
  startTime: string;
  streamArguments: Record<string, unknown>;
  processorType: string;
  outputPath: string;
  subscribersCount: number;
  subscribers: SubscriberDto[];
};

type SubscriberDto = {
  clientId: number;
  startTime: string;
  endTime: string | null;
};

type PlaybackDto = {
  streamKey: string;
  timelines: PlaybackTimelineDto[];
};

type PlaybackTimelineDto = {
  date: string;
  from: string;
  to: string;
  duration: number;
};

type PlaybackLinkRequest = {
  streamKey: string;
  targetTime: string;
};

type PlaybackLinkDto = {
  date: string;
  duration: number;
  from: string;
  playbackPath: string;
  streamKey: string;
  to: string;
};

type PlaybackByDate = PlaybackDto & {
  timelinesByDate: TimelineByDate[];
};

type TimelineByDate = {
  date: string;
  streamKey: string;
  timelines: PlaybackTimelineDto[];
};

export type {
  StreamDto,
  SubscriberDto,
  PlaybackDto,
  PlaybackTimelineDto,
  PlaybackLinkRequest,
  PlaybackLinkDto,
  PlaybackByDate,
  TimelineByDate,
};

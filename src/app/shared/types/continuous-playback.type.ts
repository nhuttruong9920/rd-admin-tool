type ContinuousPlaybackDto = {
  File: string;
  Stream: string;
  Session: string;
  StartUtc: string;
  EndUtc: string;
  Duration: number;
  Source: string;
  ClipIndex: number;
};

type ContinuousPlayback = ContinuousPlaybackDto & {
  Start: Date;
  End: Date;
};

export type { ContinuousPlaybackDto, ContinuousPlayback };

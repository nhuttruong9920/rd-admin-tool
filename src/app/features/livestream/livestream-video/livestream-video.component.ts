import {
  Component,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  interval,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { LivestreamApiService } from '@shared/services';
import {
  LivestreamRequest,
  LivestreamVideo,
} from '@shared/types';

@Component({
  selector: 'app-livestream-video',
  imports: [],
  templateUrl: './livestream-video.component.html',
})
export class LivestreamVideoComponent implements OnDestroy, OnInit {
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly livestreamService = inject(LivestreamApiService);

  readonly livestreamRequest = input.required<LivestreamRequest>();
  readonly destroy = output<LivestreamRequest>();

  livestreamVideo = linkedSignal<LivestreamVideo>(() => ({
    id: `video-${this.livestreamRequest().imei}-${this.livestreamRequest().channel}`,
    channel: this.livestreamRequest().channel,
    imei: this.livestreamRequest().imei,
    error: '',
    url: '',
    bandwidth: '0',
    hls: undefined,
    streamTime: 0,
  }));

  refreshLivestream$ = new BehaviorSubject<void>(undefined);
  livestreamVideo$ = combineLatest([
    this.refreshLivestream$.asObservable(),
    interval(10000).pipe(startWith(0)),
  ]).pipe(
    switchMap(() =>
      this.livestreamService.getLivestreams(this.livestreamRequest()).pipe(
        catchError((err) => {
          this.livestreamVideo.update((prev) => ({
            ...prev,
            error: err?.error?.message ?? 'Lỗi hệ thống',
          }));
          return of(null);
        }),
      ),
    ),
  );

  ngOnInit(): void {
    this.livestreamVideo$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (!res) return;
        if (
          this.livestreamVideo().hls &&
          this.livestreamVideo().url !== res?.Url
        ) {
          this.livestreamService.replaceHlsUrl(
            this.livestreamVideo().hls!,
            res?.Url ?? '',
            this.livestreamVideo().id,
          );
        }

        this.livestreamVideo.update((prev) => ({
          ...prev,
          url: res?.Url ?? '',
          streamTime: res?.StreamTime ?? 0,
          error: '',
        }));

        if (!this.livestreamVideo().hls) {
          this.livestreamService.setupHls(this.livestreamVideo, () =>
            this.onRefreshLivestream(),
          );
        }
      });
  }

  onRefreshLivestream(): void {
    this.destroyVideo();
    this.refreshLivestream$.next();
  }

  private destroyVideo(): void {
    this.livestreamVideo.update((prev) => {
      prev.hls?.destroy();
      return {
        ...prev,
        error: '',
        url: '',
        bandwidth: '0',
        hls: undefined,
        streamTime: 0,
      };
    });
  }

  protected onCloseLivestream(): void {
    this.destroyVideo();
    this.destroy.emit(this.livestreamRequest());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.destroyVideo();
  }
}

import { inject, Injectable, WritableSignal } from '@angular/core';

import Hls, { ErrorDetails } from 'hls.js';
import { map, Observable } from 'rxjs';

import { RestService } from '@core/services';
import { Api } from '@shared/types';
import {
  LivestreamDto,
  LivestreamRequest,
  LivestreamVideo,
} from '@shared/types/livestream.type';

@Injectable({
  providedIn: 'root',
})
export class LivestreamApiService {
  private readonly restService = inject(RestService);
  getLivestreams(request: LivestreamRequest): Observable<LivestreamDto> {
    return this.restService
      .post<
        LivestreamRequest,
        Api<string>
      >('/rd-dev/mdvr/GetLiveStreams', request)
      .pipe(
        map((res) => {
          if (!res.isSucceeded) throw new Error(res.message ?? '');
          try {
            const parsedData = JSON.parse(res.data!);
            return parsedData;
          } catch (error) {
            console.error(error);
            throw new Error('Không thể phân tích dữ liệu');
          }
        }),
      );
  }

  calculateVideoGrid(itemAmount: number): {
    gridCols: number;
    gridRows: number;
  } {
    const videoAmount = itemAmount;
    const gridCols = Math.ceil(Math.sqrt(videoAmount));
    const gridRows = gridCols === 0 ? 0 : Math.ceil(videoAmount / gridCols);

    return {
      gridCols,
      gridRows,
    };
  }

  setupHls(
    video: WritableSignal<LivestreamVideo>,
    refreshCallback?: () => void,
  ): void {
    const videoElement = document.getElementById(
      video().id,
    ) as HTMLMediaElement;
    if (!videoElement) return;
    const videoSrc = video().url;

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoSrc;
    } else if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource(videoSrc);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('🚀 error fatal: ', data);
          setTimeout(() => {
            refreshCallback?.();
          }, 3000);
        } else {
          console.error('🚀 error not fatal: ', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (
                data.details === ErrorDetails.LEVEL_LOAD_ERROR ||
                data.details === ErrorDetails.FRAG_LOAD_ERROR
              ) {
                if (videoElement.paused) videoElement.play();
              } else {
                setTimeout(() => this.tryLoadHls(hls, videoSrc), 1000);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              if (
                data.details === ErrorDetails.BUFFER_STALLED_ERROR &&
                videoElement.paused
              ) {
                videoElement.play().then();
              }
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        let bandwidth = 0;
        if (hls.bandwidthEstimate) {
          bandwidth = hls.bandwidthEstimate / (8 * 1024);
          video.update((video) => ({
            ...video,
            bandwidth: `${bandwidth.toFixed(1)}`,
          }));
        }
      });
      video.update((video) => ({
        ...video,
        hls: hls,
      }));
    }

    videoElement.play();
  }

  tryLoadHls(hls: Hls, url: string): void {
    hls.loadSource(url);
    hls.startLoad();
  }

  replaceHlsUrl(hls: Hls, newUrl: string, videoId: string): void {
    const videoElement = document.getElementById(videoId) as HTMLMediaElement;
    if (!videoElement) return;
    hls.stopLoad();
    hls.detachMedia();
    hls.loadSource(newUrl);
    hls.attachMedia(videoElement);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoElement.play().catch((err) => {
        console.warn('Autoplay failed:', err);
      });
    });
  }
}

// import { inject, Injectable } from '@angular/core';
// import { RestService } from '@core/root-services';
// import {
//   PlaybackDto,
//   PlaybackLinkDto,
//   PlaybackLinkRequest,
//   PlaybackTimelineDto,
//   StreamDto,
// } from '@shared/types';
// import { httpErrorTransform, HttpObsError } from '@shared/utils';
// import Hls, { ErrorDetails } from 'hls.js';
// import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';

// @Injectable()
// export class LiveServerApiService {
//   readonly #restService = inject(RestService);
//   readonly #baseUrl = environment.liveServerUrl;

//   getStreams(): HttpObsError<StreamDto[]> {
//     return this.#restService
//       .getCustom<StreamDto[]>(this.#baseUrl, '/get-streams')
//       .pipe(httpErrorTransform<StreamDto[]>());
//   }

//   getPlaybackData(): HttpObsError<PlaybackDto[]> {
//     return this.#restService
//       .getCustom<PlaybackDto[]>(this.#baseUrl, '/playback-data')
//       .pipe(httpErrorTransform<PlaybackDto[]>());
//   }

//   getPlaybackTimelinesByStreamKey(request: {
//     streamKey: string;
//   }): HttpObsError<PlaybackTimelineDto[]> {
//     return this.#restService
//       .getCustom<
//         PlaybackTimelineDto[]
//       >(this.#baseUrl, `/playback/dates`, request)
//       .pipe(httpErrorTransform<PlaybackTimelineDto[]>());
//   }

//   getPlaybackLink(request: PlaybackLinkRequest): Observable<PlaybackLinkDto> {
//     return this.#restService.getCustom<PlaybackLinkDto>(
//       this.#baseUrl,
//       '/playback/link',
//       request,
//     );
//   }

//   setupHls(
//     videoElementId: string,
//     url: string,
//     refreshCallback?: () => void,
//   ): Hls | undefined {
//     const videoElement = document.getElementById(
//       videoElementId,
//     ) as HTMLMediaElement;
//     if (!videoElement) return undefined;
//     const videoSrc = url;

//     if (Hls.isSupported()) {
//       const hls = new Hls();

//       hls.loadSource(videoSrc);
//       hls.attachMedia(videoElement);
//       hls.on(Hls.Events.ERROR, (event, data) => {
//         if (data.fatal) {
//           console.error('🚀 error fatal: ', data);
//           setTimeout(() => {
//             refreshCallback?.();
//           }, 3000);
//         } else {
//           console.error('🚀 error not fatal: ', data);
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               if (
//                 data.details === ErrorDetails.LEVEL_LOAD_ERROR ||
//                 data.details === ErrorDetails.FRAG_LOAD_ERROR
//               ) {
//                 if (videoElement.paused) videoElement.play();
//               } else {
//                 setTimeout(() => this.tryLoadHls(hls, videoSrc), 1000);
//               }
//               break;
//             case Hls.ErrorTypes.MEDIA_ERROR:
//               hls.recoverMediaError();
//               if (
//                 data.details === ErrorDetails.BUFFER_STALLED_ERROR &&
//                 videoElement.paused
//               ) {
//                 videoElement.play().then();
//               }
//               break;
//             default:
//               hls.destroy();
//               break;
//           }
//         }
//       });

//       videoElement.play();
//       return hls;
//     } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
//       videoElement.src = videoSrc;

//       setTimeout(() => {
//         videoElement.play();
//       }, 1000);
//       return undefined;
//     } else {
//       return undefined;
//     }
//   }

//   tryLoadHls(hls: Hls, url: string): void {
//     hls.loadSource(url);
//     hls.startLoad();
//   }
// }

// import { inject, Injectable } from '@angular/core';
// import { RestService } from '@core/services';
// import { ContinuousPlayback, ContinuousPlaybackDto } from '@shared/types';

// import { map } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class ContinuousPlaybackApiService {
//   readonly #restService = inject(RestService);

//   baseUrl = 'https://live2.vietmap.vn/playback/clips/';

//   getAllPlaybackData(
//     channel: string,
//     date: string,
//   ): HttpObsError<ContinuousPlayback[]> {
//     return this.#restService
//       .getCustom<
//         ContinuousPlaybackDto[]
//       >(this.baseUrl, `${channel}/${date}/clips_metadata.json`)
//       .pipe(
//         map((data) =>
//           data.map((item) => ({
//             ...item,
//             Start: new Date(item.StartUtc),
//             End: new Date(item.EndUtc),
//           })),
//         ),
//         httpErrorTransform(),
//       );
//   }

//   getFakeData(): HttpObsError<ContinuousPlayback[]> {
//     return this.#restService
//       .getStatic<ContinuousPlaybackDto[]>('scripts/continuous-playback.json')
//       .pipe(
//         map((data) =>
//           data.map((item) => ({
//             ...item,
//             Start: new Date(item.StartUtc),
//             End: new Date(item.EndUtc),
//           })),
//         ),
//         httpErrorTransform(),
//       );
//   }
// }

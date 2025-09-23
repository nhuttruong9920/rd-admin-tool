import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';


import { DataStateComponent, SplitPanelComponent } from '@shared/components';
import { ConnectionApiService, LivestreamApiService } from '@shared/services';
import { LivestreamRequest } from '@shared/types';
import { LivestreamVideoComponent } from './livestream-video/livestream-video.component';

@Component({
  selector: 'app-livestream',
  imports: [
    SplitPanelComponent,
    // LivestreamListComponent,
    LivestreamVideoComponent,
    // AsyncPipe,
    DataStateComponent,
  ],
  templateUrl: './livestream.component.html',
  providers: [ConnectionApiService],
})
export class LivestreamComponent {
  #mdvrService = inject(LivestreamApiService);

  livestreamRequests = signal<LivestreamRequest[]>([]);
  selectedImei = signal<string | null>(null);
  gridTemplates = computed(() => {
    return this.#mdvrService.calculateVideoGrid(
      this.livestreamRequests().length,
    );
  });

  protected onDestroyLivestream(request: LivestreamRequest): void {
    this.livestreamRequests.update((prev) =>
      prev.filter(
        (r) => !(r.imei === request.imei && r.channel === request.channel),
      ),
    );
  }
}

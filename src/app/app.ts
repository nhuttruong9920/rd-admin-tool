import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { PrimengService, ToastService } from '@core/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  template: `<router-outlet />
    @for (config of toastConfigs; track config.position) {
      <p-toast
        [position]="config.position"
        [key]="config.key"
        [showTransitionOptions]="'300ms'"
        [breakpoints]="{
          '500px': { width: '95%', transform: 'translateX(-50%)', left: '50%' },
        }"
        [baseZIndex]="10001"
      />
    } `,
})
export class App {
  #primengService = inject(PrimengService);
  #toastService = inject(ToastService);
  #messageService = inject(MessageService);

  toastConfigs = this.#toastService.toastConfigs;

  constructor() {
    this.#primengService.initPrimengPreset();
    this.#toastService.subscribeToast((message) => {
      this.#messageService.add(message);
    });
  }
}

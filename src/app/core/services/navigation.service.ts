import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  #router = inject(Router);

  toHome(): void {
    this.#router.navigate(['/']);
  }

  toLogin(): void {
    this.#router.navigate(['/auth/login']);
  }

  toAllVehicles(params: Params): void {
    this.#router.navigate(['/monitor/all-vehicles'], {
      queryParams: params,
    });
  }

  toReplayHistory(params: Params): void {
    this.#router.navigate(['/monitor/history-replay'], {
      queryParams: params,
    });
  }

  toSendCommand(params: Params): void {
    this.#router.navigate(['/monitor/send-command'], {
      queryParams: params,
    });
  }

  toReverseProxy(params: Params): void {
    this.#router.navigate(['/reverse-proxy/reverse-proxy'], {
      queryParams: params,
    });
  }

  toTraffic(params: Params): void {
    this.#router.navigate(['/reverse-proxy/traffic'], {
      queryParams: params,
    });
  }

  toChatbot(params: Params): void {
    this.#router.navigate(['/others/chatbot'], {
      queryParams: params,
    });
  }
}

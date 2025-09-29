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

  toAllVehicles(params: Params = {}): void {
    this.#router.navigate(['/monitor/all-vehicles'], {
      queryParams: params,
    });
  }

  toReplayHistory(params: Params = {}): void {
    this.#router.navigate(['/monitor/history-replay'], {
      queryParams: params,
    });
  }

  toSendCommand(params: Params = {}): void {
    this.#router.navigate(['/monitor/command'], {
      queryParams: params,
    });
  }

  toReverseProxy(params: Params = {}): void {
    this.#router.navigate(['network', 'reverse-proxy'], {
      queryParams: params,
    });
  }

  toCreateUpdateReverseProxy(id?: string): void {
    if (id) {
      this.#router.navigate(['network', 'reverse-proxy', id, 'update']);
    } else {
      this.#router.navigate(['network', 'reverse-proxy', 'create']);
    }
  }

  toReverseProxyConfig(params: Params = {}): void {
    this.#router.navigate(['network', 'reverse-proxy', 'config'], {
      queryParams: params,
    });
  }

  toGatewayServer(params: Params = {}): void {
    this.#router.navigate(['network', 'gateway-server'], {
      queryParams: params,
    });
  }

  toCreateUpdateGatewayServer(id?: string): void {
    if (id) {
      this.#router.navigate(['network', 'gateway-server', id, 'update']);
    } else {
      this.#router.navigate(['network', 'gateway-server', 'create']);
    }
  }

  toTraffic(params: Params = {}): void {
    this.#router.navigate(['network', 'traffic'], {
      queryParams: params,
    });
  }

  toChatbot(params: Params = {}): void {
    this.#router.navigate(['/others/chatbot'], {
      queryParams: params,
    });
  }
}

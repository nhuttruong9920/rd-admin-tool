import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  of,
  switchMap
} from 'rxjs';

import { NavigationService, ToastService } from '@core/services';
import { ReverseProxyApiService } from '@shared/services';
import { ProxyGatewayServerStore, ReverseProxyStore } from '@shared/stores';
import { ReverseProxyDto } from '@shared/types';
import { generateFullJsonComparison } from '@shared/utils';

@Component({
  selector: 'app-reverse-proxy-config',
  imports: [
    ButtonModule,
    FloatLabelModule,
    SelectModule,
    FormsModule,
    RadioButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
  ],
  templateUrl: './reverse-proxy-config.component.html',
  providers: [ConfirmationService, ProxyGatewayServerStore],
})
export class ReverseProxyConfigComponent {
  reverseProxyStore = inject(ReverseProxyStore);
  proxyGatewayServerStore = inject(ProxyGatewayServerStore);

  #reverseProxyApiService = inject(ReverseProxyApiService);
  #navigationService = inject(NavigationService);
  #confirmationService = inject(ConfirmationService);
  #toastService = inject(ToastService);

  selectedGatewayServerId = signal<string>('');

  // preview config
  previewConfigYarp = signal<Record<string, unknown>>({});
  previewConfigYarpJSON = computed(() =>
    JSON.stringify(this.previewConfigYarp(), null, 2),
  );

  // curent config
  refreshConfig$ = new BehaviorSubject<void>(undefined);
  configYarp$ = combineLatest([
    toObservable(this.selectedGatewayServerId),
    this.refreshConfig$,
  ]).pipe(
    switchMap(([selectedGatewayServerId]) => {
      if (!selectedGatewayServerId) {
        return of({});
      }
      return this.#reverseProxyApiService
        .getConfigYarp(selectedGatewayServerId)
        .pipe(
          catchError((error) => {
            const errorMessage = error?.error?.message ?? {};
            this.#toastService.showError(errorMessage);
            return of({});
          }),
        );
    }),
  );
  configYarp = toSignal(this.configYarp$);
  configYarpJSON = computed(() => JSON.stringify(this.configYarp(), null, 2));

  comparisonResult = computed(() =>
    generateFullJsonComparison(this.configYarp(), this.previewConfigYarp()),
  );

  // apply
  applyTypeOptions = [
    { label: 'Cập nhật/Thêm', value: 'update' },
    { label: 'Gỡ áp dụng', value: 'unapply' },
    { label: 'Xoá', value: 'delete' },
  ];
  selectedApplyType = signal<'update' | 'delete' | 'unapply'>('update');

  selectedRoutes = linkedSignal<ReverseProxyDto[]>(() => {
    void this.selectedApplyType();
    return [];
  });

  constructor() {
    this.proxyGatewayServerStore.ensureData();
    this.reverseProxyStore.ensureData();
  }

  backToReverseProxy(): void {
    this.#navigationService.toReverseProxy();
  }

  copyRequestJSON(): void {
    navigator.clipboard.writeText(this.configYarpJSON());
  }

  copyPreviewJSON(): void {
    navigator.clipboard.writeText(this.previewConfigYarpJSON());
  }

  confirmConfig(event: Event): void {
    const gatewayServerId = this.selectedGatewayServerId();
    const routeIds = this.selectedRoutes().map((route) => route.id);
    const type = this.selectedApplyType();

    if (!gatewayServerId) {
      this.#toastService.showError('Vui lòng chọn 1 gateway server!');
      return;
    }

    if (routeIds.length === 0) {
      this.#toastService.showError('Vui lòng chọn ít nhất một route!');
      return;
    }

    // Show confirmation dialog with details
    const methodLabel =
      this.applyTypeOptions.find((option) => option.value === type)?.label ||
      type;

    this.#confirmationService.confirm({
      target: event.target as EventTarget,
      message: `
<strong>Gateway Server:</strong> ${gatewayServerId} <br />
<strong>Loại áp dụng:</strong> ${methodLabel} <br />
<strong>Số lượng routes:</strong> ${routeIds.length} <br />
<strong>Routes đã chọn:</strong> ${routeIds.join(', ')} <br />`,
      header: 'Xác nhận áp dụng cấu hình',
      icon: 'fas fa-exclamation-triangle',
      acceptLabel: 'Xác nhận',
      rejectLabel: 'Hủy bỏ',
      acceptButtonProps: {
        severity: 'primary',
      },
      rejectButtonProps: {
        severity: 'secondary',
        text: true,
      },
      accept: () => {
        this.executeApplyConfig(gatewayServerId, routeIds, type);
      },
    });
  }

  private executeApplyConfig(
    environment: string,
    routeIds: string[],
    type: 'update' | 'delete' | 'unapply',
  ): void {
    this.#reverseProxyApiService
      .applyConfigYarp(environment, type, { routeIds })
      .subscribe({
        next: () => {
          this.#toastService.showSuccess(
            `Áp dụng cấu hình thành công với ${routeIds.length} route`,
          );
          this.selectedRoutes.set([]);
          this.refreshConfig$.next();
          this.reverseProxyStore.refresh();
        },
        error: (error) => {
          this.#toastService.showError(
            'Có lỗi xảy ra khi áp dụng cấu hình: ' +
              (error.message || 'Unknown error'),
          );
        },
      });
  }

  getPreviewConfig(): void {
    if (!this.selectedGatewayServerId()) {
      this.#toastService.showError('Vui lòng chọn 1 gateway server!');
      return;
    }

    if (this.selectedRoutes().length === 0) {
      this.#toastService.showError('Vui lòng chọn ít nhất một route!');
      return;
    }

    this.#reverseProxyApiService
      .getPreviewConfigYarp(
        this.selectedGatewayServerId(),
        this.selectedApplyType(),
        { routeIds: this.selectedRoutes().map((route) => route.id) },
      )
      .subscribe({
        next: (data) => {
          this.previewConfigYarp.set(data);
        },
        error: (error) => {
          this.previewConfigYarp.set({});
          this.#toastService.showError(
            error?.error?.message ?? 'Lỗi lấy dữ liệu',
          );
        },
      });
  }
}

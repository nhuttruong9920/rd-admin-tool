import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, combineLatest, finalize, of, switchMap } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

import { NavigationService, ToastService } from '@core/services';
import { ReverseProxyApiService } from '@shared/services';
import { ProxyEnvironmentStore, ReverseProxyStore } from '@shared/stores';
import { ReverseProxyDto } from '@shared/types';

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
  providers: [ConfirmationService],
})
export class ReverseProxyConfigComponent {
  reverseProxyStore = inject(ReverseProxyStore);
  proxyEnvironmentStore = inject(ProxyEnvironmentStore);

  #ReverseProxyApiService = inject(ReverseProxyApiService);
  #navigationService = inject(NavigationService);
  #confirmationService = inject(ConfirmationService);
  #toastService = inject(ToastService);

  selectedEnvironment = signal<string>('');

  // curent config
  refreshConfig$ = new BehaviorSubject<void>(undefined);
  configYarp$ = combineLatest([
    toObservable(this.selectedEnvironment),
    this.refreshConfig$,
  ]).pipe(
    switchMap(([selectedEnvironment]) => {
      if (!selectedEnvironment) {
        return of('Chưa chọn môi trường');
      }
      return this.#ReverseProxyApiService.getConfigYarp(selectedEnvironment);
    }),
  );
  configYarp = toSignal(this.configYarp$);
  configYarpJSON = computed(() => JSON.stringify(this.configYarp(), null, 2));

  // apply
  applyTypeOptions = [
    { label: 'Cập nhật/Thêm', value: 'update' },
    { label: 'Xoá', value: 'delete' },
  ];
  selectedApplyType = signal<'update' | 'delete'>('update');

  selectedRoutes = linkedSignal<ReverseProxyDto[]>(() => {
    void this.selectedApplyType();
    return [];
  });

  constructor() {
    this.proxyEnvironmentStore.ensureData();
    this.reverseProxyStore.ensureData();
  }

  backToReverseProxy(): void {
    this.#navigationService.toReverseProxy();
  }

  copyRequestJSON(): void {
    navigator.clipboard.writeText(this.configYarpJSON());
  }

  confirmConfig(event: Event): void {
    const environment = this.selectedEnvironment();
    const routeIds = this.selectedRoutes().map((route) => route.configs.id);
    const type = this.selectedApplyType();

    if (!environment) {
      this.#toastService.showError('Vui lòng chọn môi trường!');
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
<strong>Môi trường:</strong> ${environment} <br />
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
        this.executeApplyConfig(environment, routeIds, type);
      },
    });
  }

  private executeApplyConfig(
    environment: string,
    routeIds: string[],
    type: 'update' | 'delete',
  ): void {
    this.#ReverseProxyApiService
      .applyConfigYarp(environment, type, { routeIds })
      .pipe(finalize(() => console.log('finalize')))
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
}

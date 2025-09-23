import { Component, inject, signal } from '@angular/core';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

import { NavigationService, ToastService } from '@core/services';
import { InputSearchComponent, ToolbarComponent } from '@shared/components';
import { ReverseProxyApiService } from '@shared/services';
import { ReverseProxyStore } from '@shared/stores';
import { ReverseProxyConfigDto } from '@shared/types';
import { ReverseProxyCardComponent } from './reverse-proxy-card/reverse-proxy-card.component';
import { ReverseProxyTableComponent } from './reverse-proxy-table/reverse-proxy-table.component';

@Component({
  selector: 'app-reverse-proxy',
  imports: [
    ToolbarComponent,
    ReverseProxyTableComponent,
    ButtonModule,
    InputSearchComponent,
    ConfirmDialogModule,
    DialogModule,
    ReverseProxyCardComponent,
  ],
  templateUrl: './reverse-proxy.component.html',
  providers: [ConfirmationService],
})
export class ReverseProxyComponent {
  reverseProxyStore = inject(ReverseProxyStore);
  #navigationService = inject(NavigationService);
  #confirmationService = inject(ConfirmationService);
  #ReverseProxyApiService = inject(ReverseProxyApiService);
  #toastService = inject(ToastService);

  reverseProxyDetailDialogVisible = signal<boolean>(false);
  reverseProxyDetail = signal<ReverseProxyConfigDto | null>(null);

  constructor() {
    this.reverseProxyStore.ensureData();
  }

  protected navigateToCreateUpdateReverseProxy(id?: string): void {
    this.#navigationService.toCreateUpdateReverseProxy(id);
  }

  protected navigateToReverseProxyConfig(): void {
    this.#navigationService.toReverseProxyConfig();
  }

  protected detailReverseProxy(reverseProxy: ReverseProxyConfigDto): void {
    this.reverseProxyDetail.set(reverseProxy);
    this.reverseProxyDetailDialogVisible.set(true);
  }

  protected confirmDeleteReverseProxy(id: string): void {
    this.#confirmationService.confirm({
      header: 'Xoá reverse proxy',
      message: 'Bạn có chắc chắn muốn xoá reverse proxy này không?',
      icon: 'fas fa-exclamation-triangle',
      acceptLabel: 'Xác nhận',
      rejectLabel: 'Hủy bỏ',
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        text: true,
      },
      accept: () => {
        this.deleteReverseProxy(id);
      },
    });
  }

  private deleteReverseProxy(id: string): void {
    this.#ReverseProxyApiService.deleteReverseProxy(id).subscribe({
      next: () => {
        this.reverseProxyDetailDialogVisible.set(false);
        this.reverseProxyStore.refresh();
        this.#toastService.showSuccess('Xoá reverse proxy thành công');
      },
      error: () => {
        this.#toastService.showError('Xoá reverse proxy thất bại');
      },
    });
  }
}

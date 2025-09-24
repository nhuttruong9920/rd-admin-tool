import { Component, inject } from '@angular/core';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

import { NavigationService, ToastService } from '@core/services';
import { InputSearchComponent, ToolbarComponent } from '@shared/components';
import { GatewayServerApiService } from '@shared/services';
import { GatewayServerStore } from '@shared/stores';
import { GatewayServerTableComponent } from './gateway-server-table/gateway-server-table.component';

@Component({
  selector: 'app-gateway-server',
  imports: [
    ToolbarComponent,
    GatewayServerTableComponent,
    ButtonModule,
    InputSearchComponent,
    ConfirmDialogModule,
    DialogModule,
  ],
  templateUrl: './gateway-server.component.html',
  providers: [ConfirmationService],
})
export class GatewayServerComponent {
  gatewayServerStore = inject(GatewayServerStore);
  #navigationService = inject(NavigationService);
  #confirmationService = inject(ConfirmationService);
  #gatewayServerApiService = inject(GatewayServerApiService);
  #toastService = inject(ToastService);

  constructor() {
    this.gatewayServerStore.ensureData();
  }

  protected navigateToCreateUpdateGatewayServer(id?: string): void {
    this.#navigationService.toCreateUpdateGatewayServer(id);
  }

  protected confirmDeleteGatewayServer(id: string): void {
    this.#confirmationService.confirm({
      header: 'Xoá gateway server',
      message: 'Bạn có chắc chắn muốn xoá gateway server này không?',
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
        this.deleteGatewayServer(id);
      },
    });
  }

  private deleteGatewayServer(id: string): void {
    this.#gatewayServerApiService.delete(id).subscribe({
      next: () => {
        this.gatewayServerStore.refresh();
        this.#toastService.showSuccess('Xoá gateway server thành công!');
      },
      error: () => {
        this.#toastService.showError('Xoá gateway server thất bại!');
      },
    });
  }
}

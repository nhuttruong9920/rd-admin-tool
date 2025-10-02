import { Component, inject, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { ToastService } from '@core/services';
import { CopyButtonComponent, ErrorMessageComponent } from '@shared/components';
import { ServiceKeyApiService } from '@shared/services';
import { KeyApplicationStore, ServiceKeyStore } from '@shared/stores';
import {
  GenerateKeyBatchReq,
  KeyPackageDto,
  ServiceKeyDto,
} from '@shared/types';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-key-batch-generation-dialog',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    CopyButtonComponent,
    ErrorMessageComponent,
    InputTextModule,
  ],
  templateUrl: './key-batch-generation-dialog.component.html',
})
export class KeyBatchGenerationDialogComponent {
  #serviceKeyApiService = inject(ServiceKeyApiService);
  #toastService = inject(ToastService);
  serviceKeyStore = inject(ServiceKeyStore);
  keyApplicationStore = inject(KeyApplicationStore);

  packageOptions = signal<KeyPackageDto[]>([]);
  closeDialog = output<void>();

  createForm = new FormGroup({
    appId: new FormControl<number | null>(null, [Validators.required]),
    packageId: new FormControl<string | null>(null, [Validators.required]),
    quantity: new FormControl<number>(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(1000),
    ]),
  });

  quickQuantityOption: number[] = [1, 5, 10, 20, 30, 40, 50];

  generatedKeys = signal<ServiceKeyDto[]>([]);

  constructor() {
    this.createForm.controls.appId.valueChanges.subscribe((appId) => {
      this.createForm.controls.packageId.reset();

      if (appId != null) {
        this.loadPackageOptions(appId);
      } else {
        this.packageOptions.set([]);
      }
    });
  }

  private loadPackageOptions(appId: number): void {
    this.#serviceKeyApiService.getKeyPackages({ appId }).subscribe({
      next: (res) => {
        this.packageOptions.set(res.data ?? []);
      },
      error: () => {
        this.packageOptions.set([]);
      },
    });
  }

  submitCreateForm(): void {
    Object.values(this.createForm.controls).forEach((control) => {
      control.markAsDirty();
    });

    if (this.createForm.invalid) {
      return;
    }

    const request: GenerateKeyBatchReq = {
      appId: this.createForm.get('appId')!.value!,
      packageId: this.createForm.get('packageId')!.value!,
      quantity: this.createForm.get('quantity')!.value!,
    };

    this.#serviceKeyApiService.generateKeyBatch(request).subscribe({
      next: (respose) => {
        this.serviceKeyStore.refresh();
        this.generatedKeys.set(respose.data?.keys ?? []);
        this.#toastService.showSuccess('Tạo key batch thành công');
      },
      error: () => {
        this.#toastService.showError('Tạo key batch thất bại');
      },
    });
  }
}

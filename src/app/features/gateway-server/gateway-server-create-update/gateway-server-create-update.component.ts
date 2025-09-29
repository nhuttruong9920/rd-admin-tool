import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { take } from 'rxjs/operators';

import { NavigationService, ToastService } from '@core/services';
import { GatewayServerApiService } from '@shared/services';
import { GatewayServerStore } from '@shared/stores';
import { CreateGatewayServerReq, GatewayServerDto } from '@shared/types';

@Component({
  selector: 'app-reverse-proxy-create-dialog',
  imports: [
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    ReactiveFormsModule,
    ButtonModule,
    PopoverModule,
    FieldsetModule,
    SelectModule,
  ],
  templateUrl: './gateway-server-create-update.component.html',
})
export class GatewayServerCreateUpdateComponent {
  gatewayServerStore = inject(GatewayServerStore);
  #gatewayServerApiService = inject(GatewayServerApiService);
  #activatedRoute = inject(ActivatedRoute);
  #navigationService = inject(NavigationService);
  #toastService = inject(ToastService);

  createForm = new FormGroup({
    id: new FormControl<string>('', [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
    baseUrl: new FormControl<string>('', [Validators.required]),
    metadata: new FormArray<FormGroup>([]),
  });

  // Updating
  gatewayServerUpdatingId = this.#activatedRoute.snapshot.paramMap.get('id');
  isUpdating = !!this.gatewayServerUpdatingId;

  constructor() {
    if (this.isUpdating) {
      this.getGatewayServerById(this.gatewayServerUpdatingId!);
    }
  }

  protected backToGatewayServer(): void {
    this.#navigationService.toGatewayServer();
  }

  get metadataFormArray(): FormArray {
    return this.createForm.get('metadata') as FormArray;
  }

  protected onAddMetadataEntry(): void {
    const metadataGroup = new FormGroup({
      key: new FormControl<string>(''),
      value: new FormControl<string>(''),
    });
    this.metadataFormArray.push(metadataGroup);
  }

  protected onRemoveMetadataEntry(index: number): void {
    if (index >= 0 && index < this.metadataFormArray.length) {
      this.metadataFormArray.removeAt(index);
    }
  }

  // form
  private processFormData(): CreateGatewayServerReq {
    const formValue = { ...this.createForm.value };

    const metadataRecord: Record<string, string> = {};

    this.metadataFormArray.controls.forEach((control) => {
      const group = control as FormGroup;
      const key = group.get('key')?.value;
      const value = group.get('value')?.value;
      if (key && value) {
        metadataRecord[key] = value;
      }
    });

    const requestBody = {
      ...formValue,
      metadata:
        Object.keys(metadataRecord).length > 0 ? metadataRecord : undefined,
    } as CreateGatewayServerReq;

    return requestBody;
  }

  protected onSubmit(): void {
    const requestBody = this.processFormData();
    if (this.isUpdating) {
      this.updateGatewayServer(requestBody);
    } else {
      this.createGatewayServer(requestBody);
    }
  }

  // updating
  private getGatewayServerById(id: string): void {
    this.#gatewayServerApiService
      .getById(id)
      .pipe(take(1))
      .subscribe({
        next: (gatewayServer) => {
          this.mapGatewayServerToForm(gatewayServer);
        },
        error: (error) => {
          console.error('error', error);
        },
      });
  }

  private mapGatewayServerToForm(gatewayServer: GatewayServerDto): void {
    const transformedGatewayServer = {
      id: gatewayServer.id,
      name: gatewayServer.name,
      baseUrl: gatewayServer.baseUrl,
    };

    Object.entries(gatewayServer.metadata || {}).forEach(([key, value]) => {
      const metadataGroup = new FormGroup({
        key: new FormControl<string>(key),
        value: new FormControl<string>(value),
      });
      this.metadataFormArray.push(metadataGroup);
    });

    this.createForm.patchValue(transformedGatewayServer);
  }

  private createGatewayServer(requestBody: CreateGatewayServerReq): void {
    this.#gatewayServerApiService.create(requestBody).subscribe({
      next: () => {
        this.gatewayServerStore.refresh();
        this.#navigationService.toGatewayServer();
        this.#toastService.showSuccess('Tạo gateway server thành công');
      },
      error: (error) => {
        console.error('error', error);
        this.#toastService.showError('Tạo gateway server thất bại');
      },
    });
  }

  private updateGatewayServer(requestBody: CreateGatewayServerReq): void {
    this.#gatewayServerApiService.update(requestBody).subscribe({
      next: () => {
        this.gatewayServerStore.refresh();
        this.#navigationService.toGatewayServer();
        this.#toastService.showSuccess('Cập nhật gateway server thành công');
      },
      error: (error) => {
        console.error('error', error);
        this.#toastService.showError('Cập nhật gateway server thất bại');
      },
    });
  }
}

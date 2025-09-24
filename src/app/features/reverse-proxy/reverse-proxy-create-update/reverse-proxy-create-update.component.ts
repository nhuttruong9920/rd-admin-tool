import { KeyValuePipe } from '@angular/common';
import {
  Component,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { startWith, take } from 'rxjs/operators';

import { DateService, NavigationService, ToastService } from '@core/services';
import { ReverseProxyApiService } from '@shared/services';
import {
  ProxyLoadBalancingPolicyStore,
  ReverseProxyStore,
} from '@shared/stores';
import {
  CreateUpdateReverseProxyReq,
  ReverseProxyDto,
  SwaggerConfig,
} from '@shared/types';
import { ReverseProxyCreateSwaggerDialogComponent } from './reverse-proxy-create-swagger-dialog/reverse-proxy-create-swagger-dialog.component';
import { ReverseProxyCreateTransformDialogComponent } from './reverse-proxy-create-transform-dialog/reverse-proxy-create-transform-dialog.component';

@Component({
  selector: 'app-reverse-proxy-create-dialog',
  imports: [
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    ReactiveFormsModule,
    ButtonModule,
    PopoverModule,
    ReverseProxyCreateSwaggerDialogComponent,
    ReverseProxyCreateTransformDialogComponent,
    KeyValuePipe,
    FieldsetModule,
    SelectModule,
  ],
  templateUrl: './reverse-proxy-create-update.component.html',
})
export class ReverseProxyCreateUpdateComponent {
  proxyLoadBalancingPolicyStore = inject(ProxyLoadBalancingPolicyStore);
  reverseProxyStore = inject(ReverseProxyStore);
  #ReverseProxyApiService = inject(ReverseProxyApiService);
  #dateService = inject(DateService);
  #activatedRoute = inject(ActivatedRoute);
  #navigationService = inject(NavigationService);
  #toastService = inject(ToastService);

  reverseProxyCreateTransformDialog =
    viewChild<ReverseProxyCreateTransformDialogComponent>(
      'reverseProxyCreateTransformDialog',
    );

  reverseProxyCreateSwaggerDialog =
    viewChild<ReverseProxyCreateSwaggerDialogComponent>(
      'reverseProxyCreateSwaggerDialog',
    );

  createForm = new FormGroup({
    id: new FormControl<string>('', [Validators.required]),
    destinationAddress: new FormControl<string>('', [Validators.required]),
    swaggers: new FormControl<SwaggerConfig[]>([], [Validators.required]),
    timeoutSeconds: new FormControl<number>(0),
    path: new FormControl<string>('', [Validators.required]),
    order: new FormControl<number>(0),
    authorizationPolicy: new FormControl<string>(''),
    rateLimiterPolicy: new FormControl<string>(''),
    outputCachePolicy: new FormControl<string>(''),
    timeoutPolicy: new FormControl<string>(''),
    corsPolicy: new FormControl<string>(''),
    loadBalancingPolicy: new FormControl<string>(''),
    timeout: new FormControl<string | null>(null),
    metadata: new FormArray<FormGroup>([]),
    transforms: new FormControl<Record<string, string>[]>([]),
  });

  resultJSON = signal<string>('');

  // Transform
  updatingTransform = signal<Record<string, string> | null>(null);
  updatingTransformIndex = signal<number | null>(null);

  // Swagger
  updatingSwagger = signal<SwaggerConfig | null>(null);
  updatingSwaggerIndex = signal<number | null>(null);

  // Updating
  proxyUpdatingId = this.#activatedRoute.snapshot.paramMap.get('id');
  isUpdating = !!this.proxyUpdatingId;

  constructor() {
    this.createForm.valueChanges
      .pipe(takeUntilDestroyed(), startWith(this.createForm.value))
      .subscribe(() => {
        this.resultJSON.set(JSON.stringify(this.processFormData(), null, 2));
      });

    if (this.proxyUpdatingId) {
      this.getReverseProxyById(this.proxyUpdatingId!);
    }

    this.proxyLoadBalancingPolicyStore.ensureData();
  }

  protected backToReverseProxy(): void {
    this.#navigationService.toReverseProxy();
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

  // Transform
  protected onAddTransform(transform: Record<string, string>): void {
    const transforms = this.createForm.value.transforms ?? [];
    transforms.push(transform);
    this.createForm.patchValue({ transforms });
  }

  protected onRemoveTransform(index: number): void {
    const transforms = this.createForm.value.transforms ?? [];
    transforms.splice(index, 1);
    this.createForm.patchValue({ transforms });
  }

  protected onStartUpdateTransform(index: number): void {
    const transform = this.createForm.value.transforms ?? [];
    this.updatingTransform.set(transform[index]);
    this.updatingTransformIndex.set(index);
  }

  protected onUpdateTransform(transform: Record<string, string>): void {
    const transforms = this.createForm.value.transforms ?? [];
    const index = this.updatingTransformIndex();
    if (index !== null) {
      transforms[index] = transform;
      this.createForm.patchValue({ transforms });
    }
    this.updatingTransformIndex.set(null);
    this.updatingTransform.set(null);
  }

  protected onHideAddTransformPopover(): void {
    this.reverseProxyCreateTransformDialog()?.onClosePopover();
    this.updatingTransform.set(null);
    this.updatingTransformIndex.set(null);
  }

  // Swagger
  protected onEditSwagger(index: number): void {
    const swaggers = this.createForm.value.swaggers ?? [];
    this.updatingSwagger.set(swaggers[index]);
    this.updatingSwaggerIndex.set(index);
  }

  protected onAddSwagger(swaggerConfig: SwaggerConfig): void {
    const swaggers = this.createForm.value.swaggers ?? [];
    swaggers.push(swaggerConfig);
    this.createForm.patchValue({ swaggers });
  }

  protected onRemoveSwagger(index: number): void {
    const swaggers = this.createForm.value.swaggers ?? [];
    swaggers.splice(index, 1);
    this.createForm.patchValue({ swaggers });
  }

  protected onUpdateSwagger(swaggerConfig: SwaggerConfig): void {
    const swaggers = this.createForm.value.swaggers ?? [];
    const index = this.updatingSwaggerIndex();
    if (index !== null) {
      swaggers[index] = swaggerConfig;
      this.createForm.patchValue({ swaggers });
    }
    this.updatingSwaggerIndex.set(null);
  }

  protected onHideAddSwaggerPopover(): void {
    this.reverseProxyCreateSwaggerDialog()?.onClosePopover();
    this.updatingSwagger.set(null);
    this.updatingSwaggerIndex.set(null);
  }

  // form
  private processFormData(): CreateUpdateReverseProxyReq {
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
      metadata: metadataRecord,
      timeout: formValue.timeout || null,
    } as CreateUpdateReverseProxyReq;

    return requestBody;
  }

  protected onSubmit(): void {
    const requestBody = this.processFormData();
    if (this.isUpdating) {
      this.updateReverseProxy(requestBody);
    } else {
      this.createReverseProxy(requestBody);
    }
  }

  // updating
  private getReverseProxyById(id: string): void {
    this.#ReverseProxyApiService
      .getReverseProxyById(id)
      .pipe(take(1))
      .subscribe({
        next: (proxy) => {
          this.mapReverseProxyToForm(proxy);
        },
        error: (error) => {
          console.error('error', error);
        },
      });
  }

  private mapReverseProxyToForm(proxy: ReverseProxyDto): void {
    const transformedProxy = {
      id: proxy.id,
      destinationAddress:
        proxy.cluster?.destinations?.destination1?.address || '',
      swaggers:
        proxy.cluster?.destinations?.destination1?.swaggers || [],
      timeoutSeconds: this.#dateService.getSecondsFromDuration(
        proxy.cluster?.httpRequest?.timeout,
      ),
      path: proxy.route?.match?.path || '',
      order: proxy.route?.order || 0,
      authorizationPolicy: proxy.route?.authorizationPolicy || '',
      rateLimiterPolicy: proxy.route?.rateLimiterPolicy || '',
      outputCachePolicy: proxy.route?.outputCachePolicy || '',
      timeoutPolicy: proxy.route?.timeoutPolicy || '',
      corsPolicy: proxy.route?.corsPolicy || '',
      timeout: proxy.route?.timeout || '',
      transforms: proxy.route?.transforms || [],
    };

    Object.entries(proxy.route?.metadata || {}).forEach(
      ([key, value]) => {
        const metadataGroup = new FormGroup({
          key: new FormControl<string>(key),
          value: new FormControl<string>(value),
        });
        this.metadataFormArray.push(metadataGroup);
      },
    );

    this.createForm.patchValue(transformedProxy);
  }

  protected copyRequestJSON(): void {
    navigator.clipboard.writeText(this.resultJSON());
  }

  private createReverseProxy(requestBody: CreateUpdateReverseProxyReq): void {
    this.#ReverseProxyApiService.createReverseProxy(requestBody).subscribe({
      next: () => {
        this.reverseProxyStore.refresh();
        this.#navigationService.toReverseProxy();
        this.#toastService.showSuccess('Tạo reverse proxy thành công');
      },
      error: (error) => {
        console.error('error', error);
        this.#toastService.showError('Tạo reverse proxy thất bại');
      },
    });
  }

  private updateReverseProxy(requestBody: CreateUpdateReverseProxyReq): void {
    this.#ReverseProxyApiService.updateReverseProxy(requestBody).subscribe({
      next: () => {
        this.reverseProxyStore.refresh();
        this.#navigationService.toReverseProxy();
        this.#toastService.showSuccess('Cập nhật reverse proxy thành công');
      },
      error: (error) => {
        console.error('error', error);
        this.#toastService.showError('Cập nhật reverse proxy thất bại');
      },
    });
  }
}

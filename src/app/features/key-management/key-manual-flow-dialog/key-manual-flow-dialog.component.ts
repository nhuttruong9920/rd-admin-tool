import { DatePipe } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { ToastService } from '@core/services';
import { ServiceKeyApiService } from '@shared/services';
import { KeyApplicationStore, ServiceKeyStore } from '@shared/stores';
import { AssignKeyDto, AssignKeyReq } from '@shared/types';

@Component({
  selector: 'app-key-manual-flow-dialog',
  imports: [
    StepperModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    ToggleSwitchModule,
    DatePipe,
  ],
  templateUrl: './key-manual-flow-dialog.component.html',
})
export class KeyManualFlowDialogComponent {
  keyApplicationStore = inject(KeyApplicationStore);
  #serviceKeyApiService = inject(ServiceKeyApiService);
  #toastService = inject(ToastService);
  serviceKeyStore = inject(ServiceKeyStore);

  closeDialog = output<void>();

  stepValue = signal<number>(1);

  // step 1
  selectedKeyApplicationId = signal<number | undefined>(undefined);

  // step 2
  packageOptions$ = toObservable(this.selectedKeyApplicationId).pipe(
    switchMap((app) => {
      console.log(app);
      if (app != undefined) {
        return this.#serviceKeyApiService
          .getKeyPackages({
            appId: app,
          })
          .pipe(map((res) => res.data ?? []));
      } else {
        return of([]);
      }
    }),
  );
  packageOptions = toSignal(this.packageOptions$);
  selectedKeyPackageId = signal<string | undefined>(undefined);

  // step 3
  availableKeys$ = combineLatest([
    toObservable(this.selectedKeyPackageId),
    toObservable(this.selectedKeyApplicationId),
  ]).pipe(
    switchMap(([packageId, appId]) => {
      if (packageId == undefined || appId == undefined) {
        return of([]);
      }
      return this.#serviceKeyApiService
        .getServiceKeys({
          appId: appId,
          packageId: packageId,
          status: 0,
        })
        .pipe(map((res) => res.data ?? []));
    }),
  );
  availableKeys = toSignal(this.availableKeys$);
  selectedAvailableKey = signal<string | undefined>(undefined);
  userId = signal<string>('');
  reason = signal<string>('');
  isAutoActivate = signal<boolean>(true);

  // step 4
  successResponse = signal<AssignKeyDto | null>(null);

  protected processStepThree(): void {
    if (!this.selectedAvailableKey()) {
      return;
    }
    const request: AssignKeyReq = {
      keyCode: this.selectedAvailableKey()!,
      userId: this.userId(),
      reason: this.reason(),
      autoActivate: this.isAutoActivate(),
    };

    this.#serviceKeyApiService.assignKey(request).subscribe({
      next: (res) => {
        this.serviceKeyStore.refresh();
        this.successResponse.set(res.data);
        this.stepValue.set(4);
      },
      error: () => {
        this.#toastService.showError('Gán key thất bại');
      },
    });
  }
}

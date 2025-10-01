import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';

import { SafeHtmlPipe } from '@shared/pipes';
import { ConnectionApiService } from '@shared/services';

@Component({
  selector: 'app-package-info',
  imports: [
    FloatLabelModule,
    InputNumberModule,
    TextareaModule,
    FormsModule,
    AsyncPipe,
    SafeHtmlPipe,
    SkeletonModule,
  ],
  templateUrl: './package-info.component.html',
})
export class PackageInfoComponent {
  #connectionService = inject(ConnectionApiService);
  packageCopiedData = model.required<string>();
  packageCopiedType = model.required<number>();
  dataFontSizePx = input.required<number>();

  refreshInfo$ = new BehaviorSubject<void>(undefined);
  infoReq = computed(() => ({
    data: this.packageCopiedData().trim(),
    deviceType: this.packageCopiedType(),
  }));

  info$ = combineLatest([toObservable(this.infoReq), this.refreshInfo$]).pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(([infoReq]) => {
      if (!infoReq.data || !infoReq.deviceType) return of(undefined);
      return this.#connectionService.fetchConnectionInfo(infoReq);
    }),
  );
}

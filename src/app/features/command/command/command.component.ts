import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { DataStateComponent, ToolbarComponent } from '@shared/components';
import { RelativeTimePipe, SafeHtmlPipe } from '@shared/pipes';
import { ConnectionApiService } from '@shared/services/connection.api.service';
import {
  ConnectionDto,
  GetSTDCommandReq,
  Package,
} from '@shared/types/connection.type';
import {
  DisplaySettingComponent,
  ShowInfoMethod,
} from '../display-setting/display-setting.component';
import { SendCommandInputComponent } from '../send-command-input/send-command-input.component';

@Component({
  selector: 'app-send-command',
  imports: [
    ButtonModule,
    InputTextModule,
    BadgeModule,
    TooltipModule,
    RelativeTimePipe,
    AsyncPipe,
    DataStateComponent,
    SkeletonModule,
    ToolbarComponent,
    SendCommandInputComponent,
    DisplaySettingComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './send-command.component.html',
})
export class SendCommandComponent {
  readonly REQUEST_INTERVAL = 10000;
  private readonly connectionService = inject(ConnectionApiService);
  readonly selectedConnection = input.required<ConnectionDto | null>();

  previousCommandHistory = signal<Package[] | null>(null);
  interval$ = interval(this.REQUEST_INTERVAL).pipe(startWith(0));
  refreshCommandHistory$ = new BehaviorSubject<void>(undefined);
  commandHistory$ = combineLatest([
    toObservable(this.selectedConnection),
    this.refreshCommandHistory$,
    this.interval$,
  ]).pipe(
    switchMap(([selectedConnection]) => {
      if (!selectedConnection) return of(undefined);

      const request: GetSTDCommandReq = {
        imei: selectedConnection.imei,
      };

      return this.connectionService.fetchSTDCommandByImei(request);
    }),
    map((res) => ({
      ...res,
      data: res?.data ?? this.previousCommandHistory(),
    })),
    tap((res) => {
      if (res?.data) {
        this.previousCommandHistory.set(res.data);
      }
    }),
  );

  packageFontSizePx = signal<number>(14);
  showInfoMethod = signal<ShowInfoMethod>('showToast');

  protected onCopyResponseCommand(command: string): void {
    navigator.clipboard.writeText(command);
  }

  protected onRefreshCommandHistory(): void {
    this.refreshCommandHistory$.next();
  }

  protected onFontSizeChange(fontSize: number): void {
    this.packageFontSizePx.set(fontSize);
  }

  protected onShowInfoMethodChange(showInfoMethod: ShowInfoMethod): void {
    this.showInfoMethod.set(showInfoMethod);
  }
}

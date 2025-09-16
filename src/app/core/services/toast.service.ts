import { Injectable } from '@angular/core';

import { ToastMessageOptions } from 'primeng/api';
import { ToastPositionType } from 'primeng/toast';
import { Subject } from 'rxjs';

type ToastPositionModel = {
  position: ToastPositionType;
  key: ToastPosition;
};

export const enum ToastSeverity {
  Success = 'success',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export const enum ToastPosition {
  TopLeft = 'tl',
  TopCenter = 'tc',
  TopRight = 'tr',
  CenterCenter = 'cc',
  BottomLeft = 'bl',
  BottomCenter = 'bc',
  BottomRight = 'br',
}
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toastConfigs: ToastPositionModel[] = this.initToastConfig();

  private toastSubject = new Subject<ToastMessageOptions>();
  toast$ = this.toastSubject.asObservable();

  public registerToast(message: ToastMessageOptions): void {
    this.toastSubject.next(message);
  }

  public subscribeToast(callback: (message: ToastMessageOptions) => void): void {
    this.toastSubject.subscribe(callback);
  }

  showToast(
    message: string,
    severity: ToastSeverity = ToastSeverity.Success,
    position: ToastPosition = ToastPosition.BottomRight,
  ): void {
    this.registerToast({
      key: position,
      severity: severity,
      summary: new Date().toLocaleString(),
      detail: message,
    });
  }
  showSuccess(message: string): void {
    this.showToast(message, ToastSeverity.Success);
  }
  showError(message: string): void {
    this.showToast(message, ToastSeverity.Error);
  }
  showWarn(message: string): void {
    this.showToast(message, ToastSeverity.Warn);
  }
  showInfo(message: string): void {
    this.showToast(message, ToastSeverity.Info);
  }
  showServerError(): void {
    this.showError('Lỗi máy chủ');
  }
  showNetworkError(): void {
    this.showError('Lỗi mạng');
  }

  private initToastConfig(): ToastPositionModel[] {
    return [
      {
        position: 'top-left',
        key: ToastPosition.TopLeft,
      },
      {
        position: 'top-center',
        key: ToastPosition.TopCenter,
      },
      {
        position: 'top-right',
        key: ToastPosition.TopRight,
      },
      {
        position: 'center',
        key: ToastPosition.CenterCenter,
      },
      {
        position: 'bottom-left',
        key: ToastPosition.BottomLeft,
      },
      {
        position: 'bottom-center',
        key: ToastPosition.BottomCenter,
      },
      {
        position: 'bottom-right',
        key: ToastPosition.BottomRight,
      },
    ];
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import { RelativeTimePipe, SafeHtmlPipe } from '@shared/pipes';
import { ConnectionDto, Package } from '@shared/types/connection.type';
import { ShowInfoMethod } from '@features/command/display-setting/display-setting.component';
import { TooltipModule } from 'primeng/tooltip';
import { PackageInfoComponent } from '../package-info/package-info.component';

@Component({
  selector: 'app-package-card',
  imports: [
    RelativeTimePipe,
    SafeHtmlPipe,
    ToastModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    PackageInfoComponent,
  ],
  templateUrl: './package-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class PackageCardComponent {
  #messageService = inject(MessageService);

  package = input.required<Package>();
  dataFontSizePx = input.required<number>();
  showInfoMethod = input.required<ShowInfoMethod>();
  selectedConnection = input.required<ConnectionDto | null>();

  packageCopiedData = signal<string>('');
  packageCopiedType = linkedSignal<number>(
    () => this.selectedConnection()?.deviceType ?? 0,
  );

  infoDialogVisible = signal<boolean>(false);

  protected onCopy(): void {
    const selectedText = window.getSelection()?.toString();
    this.packageCopiedData.set(selectedText ?? '');
    switch (this.showInfoMethod()) {
      case 'showToast':
        this.#messageService.clear();
        this.#messageService.add({
          severity: 'info',
          summary: 'Xem gói tin',
          detail: selectedText,
          life: 3000,
        });
        break;
      case 'onCopy':
        this.onSeeInfo();
        break;
    }
  }

  onSeeInfo(): void {
    this.infoDialogVisible.set(true);
  }

  getBorderStyleClass(color: string): string {
    switch (color) {
      case 'orange':
        return 'border-orange-500 dark:border-orange-400/60';
      case 'green':
        return 'border-green-500 dark:border-green-400/60';
      case 'blue':
        return 'border-blue-500 dark:border-blue-400/60';
      case 'cyan':
        return 'border-cyan-500 dark:border-cyan-400/60';
      case 'purple':
        return 'border-purple-500 dark:border-purple-400/60';
      default:
        return '';
    }
  }

  getBackgroundColorClass(color: string): string {
    switch (color) {
      case 'orange':
        return 'bg-orange-500 dark:bg-orange-400/60';
      case 'green':
        return 'bg-green-500 dark:bg-green-400/60';
      case 'blue':
        return 'bg-blue-500 dark:bg-blue-400/60';
      case 'cyan':
        return 'bg-cyan-500 dark:bg-cyan-400/60';
      case 'purple':
        return 'bg-purple-500 dark:bg-purple-400/60';
      default:
        return '';
    }
  }
}

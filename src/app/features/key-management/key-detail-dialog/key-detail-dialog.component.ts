import { Component, input, output } from '@angular/core';
import { CopyButtonComponent } from '@shared/component';
import { ToDatePipe } from '@shared/pipes';
import { ServiceKey } from '@shared/types';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-key-detail-dialog',
  imports: [ButtonModule, CopyButtonComponent, ToDatePipe],
  templateUrl: './key-detail-dialog.component.html',
})
export class KeyDetailDialogComponent {
  key = input.required<ServiceKey>();

  closeDialog = output<void>();

  get remainingDays(): number {
    const until = new Date(this.key().validUntil).getTime();
    const now = Date.now();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((until - now) / msPerDay);
    return Math.max(0, diff);
  }
}

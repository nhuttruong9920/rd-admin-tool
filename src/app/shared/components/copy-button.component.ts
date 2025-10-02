import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  signal,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-copy-button',
  imports: [ButtonModule],
  template: `
    <p-button
      [label]="showLabel() ? 'Sao chép' : undefined"
      [variant]="variant()"
      [icon]="copying() ? 'fas fa-check' : 'fas fa-copy'"
      size="small"
      [severity]="copying() ? 'success' : 'secondary'"
      (click)="onTriggerCopy($event)"
      [disabled]="copying()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyButtonComponent implements OnDestroy {
  readonly value = input.required<string>();
  readonly showLabel = input<boolean>(true);
  readonly variant = input<'text' | 'outlined' | undefined>(undefined);
  readonly size = input<'small' | 'large'>('small');

  copying = signal<boolean>(false);

  timeout: ReturnType<typeof setTimeout> | null = null;

  protected onTriggerCopy(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    navigator.clipboard.writeText(this.value());
    this.copying.set(true);
    this.timeout = setTimeout(() => {
      this.copying.set(false);
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import {
  Component,
  input
} from '@angular/core';
import { AbstractControl, AbstractControlDirective } from '@angular/forms';

@Component({
  selector: 'app-error-message',
  template: `
    @if (hasError()) {
      <div class="w-full truncate text-xs text-red-500 form-error-container">
        <span>
          <i class="far fa-triangle-exclamation mr-1"></i>
          @for (key of errorObject | keyvalue; track key.key) {
            @let errorKey = key.key | titlecase;
            <span>{{ errorKey }}{{ getDesiredValue(key.value) }}</span
            >.&nbsp;
          }
        </span>
      </div>
    }
  `,
  imports: [KeyValuePipe, TitleCasePipe],
})
export class ErrorMessageComponent {
  control = input.required<AbstractControl | AbstractControlDirective>();

  errorObject: Record<string, unknown> | null = null;

  hasError(): boolean {
    this.errorObject = this.control().errors;
    return Boolean(
      this.control() && this.control().errors && this.control().dirty,
    );
  }

  getDesiredValue(error: unknown): string | null {
    if (typeof error !== 'object') return null;
    const [, firstFieldValue] = Object.entries(
      error as Record<string, unknown>,
    )[0];
    return ' ' + firstFieldValue;
  }
}

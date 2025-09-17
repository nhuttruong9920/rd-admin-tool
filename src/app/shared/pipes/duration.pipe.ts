import { Pipe, PipeTransform, inject } from '@angular/core';

import { DateService } from '@core/services';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  #dateService = inject(DateService);
  transform(
    value: number | undefined | null,
    format: 'verbose' | 'short' | 'compact' = 'compact',
  ): string {
    if (!value) {
      return '0';
    }

    return this.#dateService.formatSecondsToDuration(value, format);
  }
}

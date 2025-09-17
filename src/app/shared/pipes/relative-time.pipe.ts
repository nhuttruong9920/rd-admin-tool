import { Pipe, PipeTransform, inject } from '@angular/core';

import { DateService } from '@core/services';

@Pipe({
  name: 'relativeTime',
  pure: false,
})
export class RelativeTimePipe implements PipeTransform {
  #dateService = inject(DateService);

  /**
   * @param value accept seconds or Date object or Date string
   * @param baseYear  accept year in number
   */
  transform(value: number | Date | string, baseYear: number = 2010): string {
    if (value === undefined || value === null) {
      return '';
    }

    const relativeTime = this.#dateService.getRelativeTime(value, baseYear);

    return relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);
  }
}

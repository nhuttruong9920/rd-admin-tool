import { Pipe, PipeTransform, inject } from '@angular/core';

import { DateService } from '@core/services';

@Pipe({
  name: 'toDate',
})
export class ToDatePipe implements PipeTransform {
  #dateService = inject(DateService);

  /**
   * @param value accept seconds or Date object
   * @param baseYear  accept '1970' or '2010'
   */
  transform(
    value: number | Date | string | undefined | null,
    baseYear: number = 2010,
  ): null | string {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string') {
      try {
        value = new Date(value);
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    return this.#dateService.getFormattedDate(value, undefined, baseYear);
  }
}

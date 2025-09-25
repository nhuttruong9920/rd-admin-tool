import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absoluteNumber',
})
export class AbsoluteNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return Math.abs(value).toFixed(2);
  }
}

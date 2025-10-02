import { Injectable } from '@angular/core';
import { LabelValue } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  dateRangeOptions: LabelValue<string>[] = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Hôm qua', value: 'yesterday' },
    { label: '3 ngày trước', value: 'threeDaysAgo' },
    { label: '5 ngày trước', value: 'fiveDaysAgo' },
    { label: '7 ngày trước', value: 'sevenDaysAgo' },
    { label: 'Tuần này', value: 'thisWeek' },
    { label: 'Tuần trước', value: 'lastWeek' },
  ];

  getBaseDate(year: number): Date {
    if (year === 1970) {
      return new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
    }
    return new Date(year, 0, 1, 0, 0, 0, 0);
  }

  private padTwo(number: number): string {
    return number.toString().padStart(2, '0');
  }

  combineDayTime(day: Date, time: Date): Date {
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
    );
  }

  getDateRange(dateRange: string): [Date, Date] {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    switch (dateRange) {
      case 'today':
        return [startDate, endDate];
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        return [startDate, endDate];
      case 'threeDaysAgo':
        startDate.setDate(startDate.getDate() - 2);
        return [startDate, endDate];
      case 'fiveDaysAgo':
        startDate.setDate(startDate.getDate() - 4);
        return [startDate, endDate];
      case 'sevenDaysAgo':
        startDate.setDate(startDate.getDate() - 6);
        return [startDate, endDate];
      case 'thisWeek': {
        const dayOfWeek = today.getDay() || 7;
        startDate.setDate(today.getDate() - (dayOfWeek - 1));
        endDate.setDate(startDate.getDate() + 6);
        return [startDate, endDate];
      }
      case 'lastWeek': {
        const dayOfWeek = today.getDay() || 7;
        startDate.setDate(today.getDate() - (dayOfWeek - 1) - 7);
        endDate.setDate(startDate.getDate() + 6);
        return [startDate, endDate];
      }
      default:
        return [startDate, endDate];
    }
  }

  checkValidDateRange(
    fromDay: Date,
    fromTime: Date,
    toDay: Date,
    toTime: Date,
    range: number = 7,
  ): boolean {
    const fromDate = this.combineDayTime(fromDay, fromTime);

    const toDate = this.combineDayTime(toDay, toTime);

    const differenceInMs = toDate.getTime() - fromDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    return differenceInDays >= 0 && differenceInDays <= range;
  }

  getSeconds(date: Date, baseYear: number = 2010): number {
    if (!date) return 0;
    const baseDate = this.getBaseDate(baseYear);
    return Math.floor((date.getTime() - baseDate.getTime()) / 1000);
  }

  getDate(seconds: number, baseYear: number = 2010): Date {
    // historical tzdata
    if (baseYear <= 1975) {
      return new Date(seconds * 1000);
    }

    const baseDate = this.getBaseDate(baseYear);
    if (!seconds || seconds < 0) return baseDate;
    baseDate.setSeconds(baseDate.getSeconds() + seconds);
    return baseDate;
  }

  formatSecondsToDuration(
    seconds: number,
    format: 'verbose' | 'short' | 'compact' = 'short',
  ): string {
    // Handle edge cases
    if (!seconds || seconds <= 0) return format === 'compact' ? '0:00' : '0';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatters = {
      verbose: (): string => {
        const parts = [];
        if (hours > 0) parts.push(`${hours} giờ`);
        if (minutes > 0) parts.push(`${minutes} phút`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds} giây`);
        return parts.join(' ') || '0 giây';
      },

      short: (): string => {
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
        return parts.join(' ') || '0s';
      },

      compact: (): string => {
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      },
    };

    return formatters[format]();
  }

  getSecondsFromDuration(duration: string): number {
    if (!duration) return 0;

    const [hours, minutes, seconds] = duration.split(':').map((unit) => +unit);

    return hours * 3600 + minutes * 60 + seconds;
  }

  shiftDate(
    amount: number,
    unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
  ): Date {
    const date = new Date();

    switch (unit) {
      case 'year':
        date.setFullYear(date.getFullYear() + amount);
        break;
      case 'month':
        date.setMonth(date.getMonth() + amount);
        break;
      case 'day':
        date.setDate(date.getDate() + amount);
        break;
      case 'hour':
        date.setHours(date.getHours() + amount);
        break;
      case 'minute':
        date.setMinutes(date.getMinutes() + amount);
        break;
      case 'second':
        date.setSeconds(date.getSeconds() + amount);
        break;
    }

    return date;
  }

  getFormattedDate(
    value: number | Date,
    format = 'dd/MM/yyyy HH:mm:ss',
    baseYear: number = 2010,
  ): string {
    if (!value) return '--:--:--';

    const date =
      typeof value === 'number' ? this.getDate(value, baseYear) : value;

    const year = date.getFullYear();
    const month = this.padTwo(date.getMonth() + 1);
    const day = this.padTwo(date.getDate());
    const hour = this.padTwo(date.getHours());
    const minute = this.padTwo(date.getMinutes());
    const second = this.padTwo(date.getSeconds());

    return format
      .replace(/dd/, day)
      .replace(/MM/, month)
      .replace(/yyyy/, String(year))
      .replace(/HH/, hour)
      .replace(/mm/, minute)
      .replace(/ss/, second);
  }

  getFormattedDayTime(
    day: Date,
    time: Date,
    baseYear: number = 2010,
    format = 'dd/MM/yyyy HH:mm:ss',
  ): string {
    if (!day || !time) return '--:--:--';

    const date = this.combineDayTime(day, time);
    return this.getFormattedDate(date, format, baseYear);
  }

  getRelativeTime(
    date: Date | number | string,
    baseYear: number = 2010,
  ): string {
    if (!date) return '';

    const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'always' });
    let inputDate: Date;

    if (typeof date === 'string') {
      inputDate = new Date(date);
    } else if (typeof date === 'number') {
      inputDate = this.getDate(date, baseYear);
    } else {
      inputDate = date;
    }

    const now = new Date().getTime();
    const past = inputDate.getTime();
    const diff = now - past;

    const units = [
      { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
      { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
      // { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
      { unit: 'day', ms: 1000 * 60 * 60 * 24 },
      { unit: 'hour', ms: 1000 * 60 * 60 },
      { unit: 'minute', ms: 1000 * 60 },
      { unit: 'second', ms: 1000 },
    ];

    for (const { unit, ms } of units) {
      const elapsed = diff / ms;
      if (Math.abs(elapsed) >= 1) {
        return rtf.format(
          Math.round(elapsed * -1),
          unit as Intl.RelativeTimeFormatUnit,
        );
      }
    }

    return rtf.format(0, 'second');
  }

  getToday(type: 'start' | 'end' | 'default' = 'default'): Date {
    const today = new Date();

    switch (type) {
      case 'start':
        today.setHours(0, 0, 0, 0);
        break;
      case 'end':
        today.setHours(23, 59, 59, 999);
        break;
    }

    return today;
  }
}

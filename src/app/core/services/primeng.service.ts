import { inject, Injectable } from '@angular/core';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { PrimeNG } from 'primeng/config';

@Injectable({
  providedIn: 'root',
})
export class PrimengService {
  primeng = inject(PrimeNG);

  initPrimengPreset(): void {
    const semanticPrimary = {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    };

    const semanticSurface = {
      0: '#fff',
      50: '{slate.50}',
      100: '{slate.100}',
      200: '{slate.200}',
      300: '{slate.300}',
      400: '{slate.400}',
      500: '{slate.500}',
      600: '{slate.600}',
      700: '{slate.700}',
      800: '{slate.800}',
      900: '{slate.900}',
      950: '{slate.950}',
    };

    const newPreset = definePreset(Aura, {
      semantic: {
        primary: semanticPrimary,
        colorScheme: {
          light: {
            surface: semanticSurface,
          },
          dark: {
            surface: semanticSurface,
          },
        },
      },
      components: {},
    });

    // set primeng theme
    this.primeng.setThemeConfig({
      theme: {
        preset: newPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
    });

    // set primeng translation
    this.primeng.setTranslation(this.getPrimeNGLocaleObject());
  }

  private getPrimeNGLocaleObject(): Record<string, string | string[]> {
    return {
      dayNames: [
        'Chủ nhật',
        'Thứ hai',
        'Thứ ba',
        'Thứ tư',
        'Thứ năm',
        'Thứ sáu',
        'Thứ bảy',
      ],
      dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      monthNames: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ],
      monthNamesShort: [
        'Th1',
        'Th2',
        'Th3',
        'Th4',
        'Th5',
        'Th6',
        'Th7',
        'Th8',
        'Th9',
        'Th10',
        'Th11',
        'Th12',
      ],
      today: 'Hôm nay',
      clear: 'Xóa',
      dateFormat: 'yy-mm-dd',
      addRule: 'Thêm điều kiện',
      removeRule: 'Xóa điều kiện',
      equals: 'Bằng',
      notEquals: 'Không bằng',
      contains: 'Chứa',
      notContains: 'Không chứa',
      endsWith: 'Kết thúc bằng',
      apply: 'Áp dụng',
      matchAll: 'Khớp tất cả',
      matchAny: 'Khớp bất kỳ',
      startsWith: 'Bắt đầu bằng',
      lt: 'Nhỏ hơn',
      lte: 'Nhỏ hơn hoặc bằng',
      gt: 'Lớn hơn',
      gte: 'Lớn hơn hoặc bằng',
      dateIs: 'Ngày là',
      dateIsNot: 'Ngày không là',
      dateBefore: 'Trước ngày',
      dateAfter: 'Sau ngày',
      weekHeader: 'Tuần',
      emptyMessage: 'Không có dữ liệu',
      emptyFilterMessage:'Không tìm thấy kết quả',
    };
  }
}

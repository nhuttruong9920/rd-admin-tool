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
      50: '{neutral.50}',
      100: '{neutral.100}',
      200: '{neutral.200}',
      300: '{neutral.300}',
      400: '{neutral.400}',
      500: '{neutral.500}',
      600: '{neutral.600}',
      700: '{neutral.700}',
      800: '{neutral.800}',
      900: '{neutral.900}',
      950: '{neutral.950}',
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
  }
}

import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';

import { DataStateComponent, ToolbarComponent } from '@shared/components';
import { ConnectionStore, PackageStore } from '@shared/stores';
import { DisplayOption, GetRawPackageReq, LabelValue } from '@shared/types';
import { PackageDisplay } from '../command.component';
import {
  DisplaySettingComponent,
  ShowInfoMethod,
} from '../display-setting/display-setting.component';
import { PackageCardComponent } from './package-card/package-card.component';

@Component({
  selector: 'app-package',
  imports: [
    ToolbarComponent,
    ButtonModule,
    SelectButtonModule,
    DisplaySettingComponent,
    FormsModule,
    PackageCardComponent,
    DataStateComponent,
  ],
  templateUrl: './package.component.html',
  providers: [PackageStore],
})
export class PackageComponent {
  packageStore = inject(PackageStore);
  connectionStore = inject(ConnectionStore);

  selectedDeviceId = input.required<string | null>();
  selectedPackageDisplay = model.required<PackageDisplay>();
  dataFontSizePx = model.required<number>();

  selectedConnection = computed(
    () =>
      this.connectionStore
        .data()
        ?.find((c) => c.imei === this.selectedDeviceId()) ?? null,
  );

  displayOption = signal<LabelValue<DisplayOption>[]>([
    {
      label: 'Raw',
      value: 'raw',
    },
    {
      label: 'Parsed',
      value: 'parsed',
    },
    {
      label: 'Content',
      value: 'content',
    },
  ]);

  displayReq = computed(() => {
    switch (this.selectedPackageDisplay()) {
      case 'raw':
        return {
          isRaw: true,
          includeContent: false,
        };
      case 'parsed':
        return {
          isRaw: false,
          includeContent: false,
        };
      case 'content':
        return {
          isRaw: false,
          includeContent: true,
        };
    }
  });

  request = computed(() => ({
    imei: this.selectedDeviceId(),
    ...this.displayReq(),
  }));

  showInfoMethod = signal<ShowInfoMethod>('showToast');

  constructor() {
    this.packageStore.startAutoRefresh();

    effect(() => {
      if (this.request().imei) {
        this.packageStore.setRequest(this.request() as GetRawPackageReq);
      }
    });
  }

  protected onFontSizeChange(fontSize: number): void {
    this.dataFontSizePx.set(fontSize);
  }

  protected onShowInfoMethodChange(showInfoMethod: ShowInfoMethod): void {
    this.showInfoMethod.set(showInfoMethod);
  }
}

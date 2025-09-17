import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { StorageService, NavigationService } from '@core/services';
import {
  VehicleIconComponent,
  QuickCommandManagerComponent,
} from '@shared/components';
import { LSKeys } from '@shared/constants';
import { DeviceStatus } from '@shared/types';
import { ToDatePipe } from '@shared/pipes';

@Component({
  selector: 'app-vehicle-card',
  imports: [
    VehicleIconComponent,
    ButtonModule,
    TieredMenuModule,
    DialogModule,
    QuickCommandManagerComponent,
    ToDatePipe,
  ],
  templateUrl: './vehicle-card.component.html',
})
export class VehicleCardComponent implements OnInit {
  #storageService = inject(StorageService);
  #navigationService = inject(NavigationService);

  device = input.required<DeviceStatus>();

  quickCommandDialogVisible = signal<boolean>(false);
  quickCommands = signal<string[]>([]);

  moreMenu = computed<MenuItem[]>(() => this.updateMoreMenu());

  waypointInfo = computed(() => [
    {
      id: 'range',
      title: 'QĐ còn lại',
      value: this.device().parsedOdoMeter?.range,
      unit: 'km',
      icon: 'fas fa-route',
      iconColorClass: 'text-blue-500 dark:text-blue-400',
    },
    {
      id: 'voltage',
      title: 'Điện áp',
      value: this.device().parsedOdoMeter?.voltage,
      unit: 'V',
      icon: 'fas fa-bolt',
      iconColorClass: 'text-orange-500 dark:text-orange-400',
    },
    {
      id: 'speed',
      title: 'Vận tốc xe',
      value: this.device().parsedOdoMeter?.speed,
      unit: 'km/h',
      icon: 'fas fa-car',
      iconColorClass: 'text-purple-500 dark:text-purple-400',
    },
    {
      id: 'gpsSpeed',
      title: 'Vận tốc GPS',
      value: this.device().last.speed / 100,
      unit: 'km/h',
      icon: 'fas fa-microchip',
      iconColorClass: 'text-violet-500 dark:text-violet-400',
    },
    {
      id: 'odometer',
      title: 'Odo meter',
      value: this.device().parsedOdoMeter?.odometer,
      unit: 'km',
      icon: 'fas fa-meter',
      iconColorClass: 'text-yellow-500 dark:text-yellow-400',
    },
  ]);

  ngOnInit(): void {
    this.loadLocalCommands();
  }

  private updateMoreMenu(): MenuItem[] {
    const quickCommandItems: MenuItem[] = this.quickCommands().map(
      (command) => ({
        label: command,
        icon: 'fas fa-terminal',
        command: (): void => this.executeCommand(command),
      }),
    );

    quickCommandItems.push({
      label: 'Quản lý',
      icon: 'far fa-gear',
      command: (): void => this.quickCommandDialogVisible.set(true),
    });

    const menuItems: MenuItem[] = [
      {
        label: ' Gửi lệnh',
        icon: 'far fa-rectangle-terminal',
        items: [
          {
            label: 'Gửi nhanh',
            icon: 'far fa-rectangle-terminal',
            items: quickCommandItems,
          },
          {
            label: 'Trang gửi lệnh',
            icon: 'far fa-arrow-up-right-from-square',
            command: (): void =>
              this.#navigationService.toSendCommand({ id: this.device().id }),
          },
        ],
      },
      { separator: true },
      {
        label: 'Xem lại lộ trình',
        icon: 'far fa-history',
        items: [
          {
            label: 'Xem nhanh',
            icon: 'far fa-history',
          },
          {
            label: 'Trang xem lại lộ trình',
            icon: 'far fa-arrow-up-right-from-square',
            command: (): void =>
              this.#navigationService.toReplayHistory({ id: this.device().id }),
          },
        ],
      },
    ];

    return menuItems;
  }

  private executeCommand(command: string): void {
    // TODO: Implement command execution logic
    console.log(
      `Executing command: ${command} for device: ${this.device().id} (IMEI: ${this.device().last?.imei})`,
    );
  }

  protected onQuickCommandDialogClose(): void {
    this.loadLocalCommands();
  }

  private loadLocalCommands(): void {
    console.log('loadLocalCommands');
    const localCommands: string[] =
      this.#storageService.getLocal(LSKeys.QUICK_COMMANDS, true) || [];
    this.quickCommands.set(localCommands);
  }
}

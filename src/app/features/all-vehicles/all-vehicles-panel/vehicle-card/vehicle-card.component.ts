import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  signal
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { NavigationService, StorageService } from '@core/services';
import {
  QuickCommandManagerComponent,
  VehicleIconComponent,
} from '@shared/components';
import { LSKeys } from '@shared/constants';
import { DeviceStatus } from '@shared/types';

@Component({
  selector: 'app-vehicle-card',
  imports: [
    VehicleIconComponent,
    ButtonModule,
    TieredMenuModule,
    DialogModule,
    QuickCommandManagerComponent,
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

  selectedVehicleId = model.required<string | null>();

  waypointInfo = computed(() => [
    { ...this.device().formatted.voltage, colSpan: 'col-span-1' },
    { ...this.device().formatted.range, colSpan: 'col-span-1' },
    { ...this.device().formatted.odometer, colSpan: 'col-span-1' },
    { ...this.device().formatted.gpsSpeed, colSpan: 'col-span-1' },
    { ...this.device().formatted.vehicleSpeed, colSpan: 'col-span-1' },
    { ...this.device().formatted.odoTime, colSpan: 'col-span-2' },
  ]);

  ngOnInit(): void {
    this.loadLocalCommands();
  }

  selectVehicle(event: Event): void {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.closest('.p-button')) return;

    const vehicleId = this.device().id;

    if (this.selectedVehicleId() === vehicleId) {
      this.selectedVehicleId.set(null);
    } else {
      this.selectedVehicleId.set(vehicleId);
    }
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
        label: 'Gửi lệnh nhanh',
        icon: 'far fa-rectangle-terminal',
        items: quickCommandItems,
      },
      {
        label: 'Trang gửi lệnh',
        icon: 'far fa-arrow-up-right-from-square',
        command: (): void =>
          this.#navigationService.toSendCommand({ id: this.device().id }),
      },

      { separator: true },

      {
        label: 'Xem nhanh lộ trình',
        icon: 'far fa-history',
      },
      {
        label: 'Trang xem lại lộ trình',
        icon: 'far fa-arrow-up-right-from-square',
        command: (): void =>
          this.#navigationService.toReplayHistory({ id: this.device().id }),
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
    const localCommands: string[] =
      this.#storageService.getLocal(LSKeys.QUICK_COMMANDS, true) || [];
    this.quickCommands.set(localCommands);
  }
}

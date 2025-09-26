import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

import { StorageService } from '@core/services';
import { AllVehiclesService } from '@features/all-vehicles/all-vehicles.service';
import { LSKeys } from '@shared/constants';
import { FormattedDevice } from '@shared/types';
import { ScrollContainerComponent } from './scroll-container.component';
import { VehicleIconComponent } from './vehicle-icon.component';

@Component({
  selector: 'app-vehicle-marker-popup',
  imports: [
    VehicleIconComponent,
    ScrollContainerComponent,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    FormsModule,
  ],
  template: `
    <div class="h-60 w-[301px] flex flex-col bg-white">
      <!-- header -->
      <section class="bg-[#001433] p-2 pb-0">
        <div class="flex gap-2 w-full">
          @let isEcoMode = device().mode?.value === 'Eco';
          @let isCharging = device().battery.isCharging;
          <app-vehicle-icon
            [iconClass]="'bg-car_' + device().state"
            [isEcoMode]="isEcoMode"
            [isCharging]="isCharging"
          />
          <div class="flex-1">
            <p
              class="font-bold text-base leading-none my-[5px] text-white !m-0"
            >
              {{ deviceId() }}
            </p>

            <!-- tab header -->
            <div class="flex gap-1 bg-[#001433]">
              @for (tab of tabs; track tab.index) {
                @let isSelected = selectedTabIdx() === tab.index;
                <button
                  class="size-7 flex-center rounded-t cursor-pointer "
                  [class]="
                    isSelected ? 'text-[#001433] bg-white' : 'text-white'
                  "
                  (click)="selectedTabIdx.set(tab.index)"
                >
                  <i [class]="tab.icon"></i>
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- tab content -->
      <section class="p-2 flex-1 overflow-hidden">
        <app-scroll-container styleClass="h-full">
          @switch (selectedTabIdx()) {
            @case (0) {
              <div class="grid grid-cols-3 gap-1">
                <div class="flex items-center gap-1 col-span-3" title="Địa chỉ">
                  <figure
                    class="size-5 flex-shrink-0 flex-center shadow-icon rounded-full"
                  >
                    <i
                      class="text-xs fas fa-location-pin text-blue-400 dark:text-blue-500"
                    ></i>
                  </figure>

                  <span class="text-xs text-gray-700">
                    {{ device().address }}
                  </span>
                </div>
                <div class="flex items-center gap-1" title="Pin">
                  <figure
                    class="size-5 flex-shrink-0 flex-center shadow-icon rounded-full"
                  >
                    @let batteryIcon = device().battery.icon;
                    @let batteryIconClass = device().battery.iconClass;
                    @if (batteryIcon) {
                      <i
                        class="text-xs"
                        [class]="batteryIconClass + ' ' + batteryIcon"
                      ></i>
                    }
                  </figure>

                  <span class="text-xs text-gray-700">
                    {{ device().battery.value }}
                  </span>
                </div>
                @for (info of waypointInfo(); track info.title) {
                  <div
                    class="flex items-center gap-1"
                    [class]="info.colSpan"
                    [title]="info.title"
                  >
                    <figure
                      class="size-5 flex-shrink-0 flex-center shadow-icon rounded-full"
                    >
                      <i
                        class="text-xs"
                        [class]="info.iconClass + ' ' + info.icon"
                      ></i>
                    </figure>

                    <span class="text-xs text-gray-700">
                      {{ info.value }}
                      @if (info.unit) {
                        {{ info.unit }}
                      }
                    </span>
                  </div>
                }
              </div>
            }
            @case (1) {
              <div class="flex gap-1 my-2">
                <p-floatlabel variant="on" class="flex-1 ">
                  <input
                    #inputCommandInput
                    type="text"
                    pInputText
                    id="newCommand"
                    [(ngModel)]="inputCommand"
                    autocomplete="off"
                    pSize="small"
                    class="w-full"
                  />
                  <label for="newCommand">Lệnh</label>
                </p-floatlabel>
                <p-button label="Gửi" size="small" icon="fas fa-send" />
              </div>
              <div class="flex flex-wrap gap-1">
                @for (command of quickCommands; track command) {
                  <button
                    class="text-xs bg-gray-200 rounded-full px-1 py-0.5 cursor-pointer"
                    (click)="inputCommand.set(command)"
                  >
                    {{ command }}
                  </button>
                }
              </div>
            }
          }
        </app-scroll-container>
      </section>

      <section [class.hidden]="selectedTabIdx() !== 0">
        <p
          class="text-xs text-gray-500 !m-0 p-1 border-t border-gray-200 text-center"
        >
          ping: {{ device().pingTime }} - gps: {{ device().gpsTime }}
        </p>
      </section>
    </div>
  `,
})
export class VehicleMarkerPopupComponent {
  #storageService = inject(StorageService);
  #allVehiclesService = inject(AllVehiclesService);

  deviceId = input.required<string>();
  device = input.required<FormattedDevice>();

  selectedTabIdx = this.#allVehiclesService.selectedTabIdx;

  tabs = [
    {
      index: 0,
      label: 'Thông tin',
      icon: 'fas fa-info-circle',
    },
    {
      index: 1,
      label: 'Gửi lệnh',
      icon: 'fas fa-rectangle-terminal',
    },
  ];

  // tab 0
  waypointInfo = computed(() => [
    { ...this.device().voltage, colSpan: 'col-span-1' },
    { ...this.device().range, colSpan: 'col-span-1' },
    { ...this.device().odometer, colSpan: 'col-span-1' },
    { ...this.device().gpsSpeed, colSpan: 'col-span-1' },
    { ...this.device().vehicleSpeed, colSpan: 'col-span-1' },
    { ...this.device().odoTime, colSpan: 'col-span-2' },
  ]);

  // tab 1
  quickCommands =
    this.#storageService.getLocal<string[]>(LSKeys.QUICK_COMMANDS, true) || [];
  inputCommand = signal<string>('');
}

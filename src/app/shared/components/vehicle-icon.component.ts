import { Component, input } from '@angular/core';

@Component({
  selector: 'app-vehicle-icon',
  imports: [],
  template: `
    <figure class="w-fit flex-center" [class]="isSmall() ? 'h-5' : 'h-10'">
      <div
        class="car-marker relative"
        [class]="iconClass()"
        [class.scale-60]="isSmall()"
      >
        <span
          [class.!hidden]="!isEcoMode()"
          class="absolute top-0 -left-1 size-4 border border-green-600 rounded-full bg-white flex-center"
        >
          <i class="fas fa-seedling text-[8px] text-green-600"></i>
        </span>

        <span
          [class.!hidden]="!isCharging()"
          class="absolute bottom-0 -left-1 size-4 border border-yellow-600 rounded-full bg-white flex-center"
        >
          <i class="fas fa-bolt text-[8px] text-yellow-600"></i>
        </span>
      </div>
    </figure>
  `,
})
export class VehicleIconComponent {
  iconClass = input.required<string>();
  isEcoMode = input<boolean>(false);
  isCharging = input<boolean>(false);
  isSmall = input<boolean>(false);
}

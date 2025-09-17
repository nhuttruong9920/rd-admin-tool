import { Component, input } from '@angular/core';

@Component({
  selector: 'app-vehicle-icon',
  imports: [],
  template: `
    <figure class="h-10 w-fit flex-center">
      <div class="car-marker relative" [class]="iconClass()">
        <span
          [class.!hidden]="!ecoMode()"
          class="absolute top-0 -left-1 size-4 border border-green-600 rounded-full bg-white flex-center"
        >
          <i class="fas fa-seedling text-[8px] text-green-600"></i>
        </span>

        <span
          [class.!hidden]="!charging()"
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
  ecoMode = input<boolean>(false);
  charging = input<boolean>(false);
}

// import {
//   Component,
//   inject,
//   input,
//   model,
//   signal
// } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// import { ButtonModule } from 'primeng/button';
// import { InputNumberModule } from 'primeng/inputnumber';

// import { ToastService } from '@core/services';
// import {
//   ConnectionDto,
//   LivestreamRequest,
// } from '@shared/types';

// @Component({
//   selector: 'app-livestream-card',
//   imports: [InputNumberModule, ButtonModule, FormsModule],
//   templateUrl: './livestream-card.component.html',
// })
// export class LivestreamCardComponent {
//   private readonly toastService = inject(ToastService);
//   readonly connection = input.required<ConnectionDto>();
//   inputChannel = signal<number>(0);
//   readonly isSelected = input.required<boolean>();
//   readonly livestreamRequests = model.required<LivestreamRequest[]>();

//   protected onAddChannel(): void {
//     const request = {
//       imei: this.connection().imei,
//       channel: this.inputChannel(),
//       streamTime: 0,
//     };

//     if (
//       this.livestreamRequests().some(
//         (r) => r.imei === request.imei && r.channel === request.channel,
//       )
//     ) {
//       this.toastService.showInfo(
//         `Imei: ${request.imei} - Kênh: ${request.channel} đã tồn tại!`,
//       );
//       return;
//     }

//     this.livestreamRequests.update((prev) => [...prev, request]);
//   }
// }

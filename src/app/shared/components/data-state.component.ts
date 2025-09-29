import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';

type DataState =
  | 'empty'
  | 'error'
  | 'broken'
  | 'somethingWentWrong'
  | 'notFound'
  | 'noUnread'
  | 'pleaseSelect';

type DataStateDisplay = {
  stateTitle: string;
  stateDescription: string;
  imgSrc: string;
};

@Component({
  selector: 'app-data-state',
  imports: [NgOptimizedImage, ButtonModule],
  host: {
    class: 'w-full flex flex-col items-center justify-center gap-3 py-2 px-4',
    '[class.h-full]': 'fullHeight()',
  },
  template: `
    <img
      [ngSrc]="stateDisplay().imgSrc"
      class="animate-[float_5s_ease-in-out_infinite]"
      alt="data-state"
      [width]="size()"
      [height]="size()"
      priority
    />
    <h1 class="text-2xl font-bold">
      {{ stateDisplay().stateTitle }}
    </h1>
    <p
      class="text-pretty text-surface-600 text-center !m-0"
      [innerHTML]="stateDisplay().stateDescription"
    ></p>
    @if (showActionButton()) {
      <p-button
        [label]="actionButtonKey()"
        [rounded]="true"
        [icon]="actionButtonIcon()"
        [severity]="actionButtonSeverity()"
        (onClick)="onActionButtonClick()"
        [loading]="actionButtonLoading()"
      />
    }
  `,
})
export class DataStateComponent {
  readonly state = input.required<DataState>();
  readonly size = input<number>(100);
  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly imgSrc = input<string | null>(null);
  readonly fullHeight = input<boolean>(true);

  readonly showActionButton = input<boolean>(false);
  readonly actionButtonKey = input<string>('Thử lại');
  readonly actionButtonIcon = input<string>('fas fa-refresh');
  readonly actionButtonSeverity = input<
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'danger'
    | 'help'
    | 'contrast'
  >('primary');
  readonly actionButtonLoading = input<boolean>(false);

  stateDisplay = computed<DataStateDisplay>(() => {
    switch (this.state()) {
      case 'empty':
        return {
          stateTitle: this.title() ?? 'Không có dữ liệu',
          stateDescription:
            this.description() ??
            'Hiện tại không có dữ liệu để hiển thị, vui lòng thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/empty-min.svg',
        };
      case 'error':
        return {
          stateTitle: this.title() ?? 'Đã xảy ra lỗi',
          stateDescription:
            this.description() ??
            'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/error-min.svg',
        };
      case 'broken':
        return {
          stateTitle: this.title() ?? 'Dữ liệu bị lỗi',
          stateDescription:
            this.description() ??
            'Dữ liệu hiện tại có thể bị hỏng hoặc không thể đọc được. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/broken-min.svg',
        };
      case 'somethingWentWrong':
        return {
          stateTitle: this.title() ?? 'Lỗi không xác định',
          stateDescription:
            this.description() ??
            'Đã xảy ra lỗi không xác định. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/sad-min.svg',
        };
      case 'notFound':
        return {
          stateTitle: this.title() ?? 'Không tìm thấy dữ liệu',
          stateDescription:
            this.description() ??
            'Không tìm thấy dữ liệu theo yêu cầu. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/not-found-min.svg',
        };
      case 'noUnread':
        return {
          stateTitle: this.title() ?? 'Không có dữ liệu chưa đọc',
          stateDescription:
            this.description() ??
            'Hiện tại không có dữ liệu chưa đọc để hiển thị, vui lòng thử lại sau.',
          imgSrc: this.imgSrc() ?? '/images/web/no-unread-min.svg',
        };
      case 'pleaseSelect':
        return {
          stateTitle: this.title() ?? 'Vui lòng chọn',
          stateDescription:
            this.description() ?? 'Vui lòng chọn dữ liệu để hiển thị',
          imgSrc: this.imgSrc() ?? '/images/web/please-select-min.svg',
        };
    }
  });

  readonly actionButtonClick = output<void>();

  protected onActionButtonClick(): void {
    this.actionButtonClick.emit();
  }
}

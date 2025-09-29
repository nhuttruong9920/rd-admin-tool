import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `<div class="relative">
    <span class="relative z-20">
      <div class="absolute top-1/2 left-3 -translate-y-1/2 text-surface-500">
        @if (loading()) {
          <i class="fa-solid fa-spinner-third fa-spin"></i>
        } @else {
          <i class="fas fa-search"></i>
        }
      </div>
      <input
        #input
        name="search"
        type="text"
        class=" w-full rounded-md border border-surface-400 bg-surface px-9 hover:border-surface-500 focus-visible:outline-none focus-visible:border-primary-500  duration-300 transition-colors placeholder:text-surface-400"
        [ngClass]="size() === 'small' ? 'py-1 placeholder:text-sm' : 'py-2'"
        [class]="styleClass()"
        [(ngModel)]="value"
        [placeholder]="placeholder()"
        [disabled]="disabled() || loading()"
      />
      @if (value()) {
        <button
          class="absolute top-1/2 right-3 -translate-y-1/2 text-surface-600 rounded-full  flex-center cursor-pointer w-5 h-5 hover:bg-surface-200"
          (click)="onClear()"
        >
          <i class="far fa-times"></i>
        </button>
      }
    </span>
  </div> `,
})
export class InputSearchComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  private readonly input = viewChild.required<ElementRef>('input');

  readonly placeholder = input<string>('Tìm kiếm');
  readonly loading = input<boolean>(false);
  readonly styleClass = input<string>('');
  readonly debounceTimeMs = input<number>(300);
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly size = input<'small' | 'medium'>('small');
  readonly textChanged = output<string>();

  constructor() {
    effect(() => {
      this.searchSubject.next(this.value().trim().toLowerCase());
    });
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(this.debounceTimeMs()), takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        this.textChanged.emit(value);
      });
  }

  protected onClear(): void {
    this.value.set('');
    this.input().nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

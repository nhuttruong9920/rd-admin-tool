import { Component, input, model, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { concatMap, delay, finalize, from, of, take, takeWhile } from 'rxjs';

@Component({
  selector: 'app-history-controls',
  imports: [ButtonModule, SliderModule, SelectModule, FormsModule],
  template: `
    <div
      class="flex items-center gap-3 h-9"
      [class.hidden]="!historyLength() || historyLength() === 0"
    >
      <div class="flex items-center gap-1">
        @let icon =
          currentPlayingIndex() === historyLength()! - 1
            ? 'fas fa-rotate-left'
            : isHistoryPlaying()
              ? 'fas fa-pause'
              : 'fas fa-play';
        <p-button
          (click)="toggleHistoryReplay()"
          [icon]="icon"
          rounded
          size="small"
          [disabled]="historyLength() === 0"
        />
        <button
          pButton
          (click)="clickStep(-1)"
          icon="fas fa-backward-step"
          rounded
          severity="secondary"
          outlined
          size="small"
          (mousedown)="stepHoldStart(-1)"
          (mouseup)="stepHoldEnd()"
          (mouseleave)="stepHoldEnd()"
          [disabled]="historyLength() === 0"
        ></button>
        <button
          pButton
          (click)="clickStep(1)"
          icon="fas fa-forward-step"
          rounded
          severity="secondary"
          outlined
          size="small"
          (mousedown)="stepHoldStart(1)"
          (mouseup)="stepHoldEnd()"
          (mouseleave)="stepHoldEnd()"
          [disabled]="historyLength() === 0"
        ></button>
      </div>
      <div class="flex-1 h-full flex-center" (wheel)="scrollSlider($event)">
        @let maxSliderValue = historyLength()! > 0 ? historyLength()! - 1 : 100;
        <p-slider
          [min]="0"
          [max]="maxSliderValue"
          [(ngModel)]="currentPlayingIndex"
          (onChange)="slideSlider()"
          class="!h-1.5 w-full"
          [disabled]="historyLength() === 0"
        />
      </div>
      <p-select
        appendTo="body"
        [options]="playingSpeedOption"
        [(ngModel)]="selectedPlayingSpeed"
        optionLabel="label"
        optionValue="timeout"
        class="min-w-24"
        size="small"
        (wheel)="scrollPlayingSpeed($event)"
      />
    </div>
  `,
})
export class HistoryControlsComponent implements OnDestroy {
  historyLength = input.required<number | undefined>();
  currentPlayingIndex = model.required<number>();
  isHistoryPlaying = model.required<boolean>();
  selectedPlayingSpeed = model.required<number>();

  playingSpeedOption = [
    { label: 'x0.25', timeout: 2000 },
    { label: 'x0.5', timeout: 1000 },
    { label: 'x1', timeout: 500 },
    { label: 'x2', timeout: 250 },
    { label: 'x4', timeout: 125 },
    { label: 'x8', timeout: 62.5 },
    { label: 'x16', timeout: 31.25 },
  ];

  isStepHolding = signal<boolean>(false);
  holdDelayTimeout: ReturnType<typeof setTimeout> | null = null;
  holdInterval: ReturnType<typeof setInterval> | null = null;

  protected toggleHistoryReplay(): void {
    this.isHistoryPlaying.set(!this.isHistoryPlaying());

    if (this.isHistoryPlaying()) {
      if (!this.historyLength()) return;

      //if the selected route is the last route or not yet select, then start from the first route
      if (this.currentPlayingIndex() === this.historyLength()! - 1) {
        this.currentPlayingIndex.set(0);
      }

      const remainingSteps =
        this.historyLength()! - this.currentPlayingIndex() - 1;

      from(Array.from({ length: remainingSteps }, (_, i) => i))
        .pipe(
          concatMap((route) =>
            of(route).pipe(delay(this.selectedPlayingSpeed())),
          ),
          takeWhile(() => this.isHistoryPlaying()),
          take(remainingSteps),
          finalize(() => this.isHistoryPlaying.set(false)),
        )
        .subscribe(() => {
          this.currentPlayingIndex.update((prev) => prev + 1);
        });
    }
  }

  protected clickStep(step: -1 | 1): void {
    if (!this.historyLength()) return;

    this.isHistoryPlaying.set(false);
    if (step === 1 && this.currentPlayingIndex() === this.historyLength()! - 1)
      return;

    if (step === -1 && this.currentPlayingIndex() === 0) return;

    this.currentPlayingIndex.set(this.currentPlayingIndex() + step);
  }

  protected slideSlider(): void {
    this.isHistoryPlaying.set(false);
  }

  protected scrollSlider(event: WheelEvent): void {
    event.preventDefault();
    if (!this.historyLength()) return;

    this.isHistoryPlaying.set(false);
    this.currentPlayingIndex.update((prev) => {
      const newValue = event.deltaY > 0 ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(this.historyLength()! - 1, newValue));
    });
  }

  protected scrollPlayingSpeed(event: WheelEvent): void {
    event.preventDefault();
    const currentIndex = this.playingSpeedOption.findIndex(
      (option) => option.timeout === this.selectedPlayingSpeed(),
    );

    let newIndex = currentIndex;

    if (event.deltaY > 0) {
      newIndex = (currentIndex + 1) % this.playingSpeedOption.length;
    } else {
      newIndex =
        (currentIndex - 1 + this.playingSpeedOption.length) %
        this.playingSpeedOption.length;
    }

    this.selectedPlayingSpeed.set(this.playingSpeedOption[newIndex].timeout);
  }

  protected stepHoldStart(step: -1 | 1): void {
    if (!this.historyLength()) return;

    this.isStepHolding.set(false);
    this.holdDelayTimeout = setTimeout(() => {
      this.isStepHolding.set(true);
      this.holdInterval = setInterval(() => {
        if (this.isStepHolding()) {
          this.clickStep(step);
        }
        if (
          this.currentPlayingIndex() === this.historyLength()! - 1 ||
          this.currentPlayingIndex() === 0
        ) {
          this.stepHoldEnd();
        }
      }, this.selectedPlayingSpeed());
    }, 300);
  }

  protected stepHoldEnd(): void {
    this.clearMemory();
    this.isStepHolding.set(false);
  }

  private clearMemory(): void {
    if (this.holdDelayTimeout) {
      clearTimeout(this.holdDelayTimeout);
    }
    if (this.holdInterval) {
      clearInterval(this.holdInterval);
    }
  }

  ngOnDestroy(): void {
    this.clearMemory();
    this.isHistoryPlaying.set(false);
  }
}

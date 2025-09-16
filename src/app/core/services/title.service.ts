import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TitleService extends TitleStrategy {
  private readonly title = inject(Title);

  constructor() {
    super();

    effect(() => {
      const currentSnapshot = this.snapshotSignal();

      if (currentSnapshot) {
        const titleKey = this.buildTitle(currentSnapshot) ?? 'RD';
        const translatedTitle = `${titleKey} | ${'Admin Tool'}`;
        this.title.setTitle(translatedTitle);
      }
    });
  }

  private snapshotSignal = signal<RouterStateSnapshot | null>(null);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.snapshotSignal.set(snapshot);
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-split-panel',
  imports: [],
  template: `<div class="h-full w-full flex gap-2">
    <section class="flex-1 bg-surface rounded-none md:rounded-lg shadow bg-red-500"></section>
    <section class="w-100 bg-surface rounded-none md:rounded-lg shadow hidden md:block"></section>
  </div> `,
})
export class SplitPanelComponent {}

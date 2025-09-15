import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimengService } from '@core/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'rd-admin-tool';
  #primengService = inject(PrimengService);

  constructor() {
    this.#primengService.initPrimengPreset();
  }
}

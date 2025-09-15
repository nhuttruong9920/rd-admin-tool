import { Component, inject } from "@angular/core";
import { LayoutService } from "../../services/layout.service";

@Component({
  selector: "app-topbar",
  imports: [],
  templateUrl: "./topbar.component.html",
})
export class TopbarComponent {
  #layoutService = inject(LayoutService);

  protected openOverlayNav(): void {
    this.#layoutService.isOverlayNavOpened.set(true);
  }
}

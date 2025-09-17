import { Component, Provider, Type } from '@angular/core';
import { RouterOutlet } from '@angular/router';

export function createWrapperComponent(providers: Provider[]): Type<object> {
  @Component({
    imports: [RouterOutlet],
    template: `<router-outlet />`,
    providers: providers,
  })
  class WrapperComponent {}
  return WrapperComponent;
}

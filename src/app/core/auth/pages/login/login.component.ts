import {
  AfterViewInit,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService, LoginReq } from '@core/services';
import { MapInstanceService } from '@shared/services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.component.html',
  providers: [MapInstanceService],
})
export class LoginComponent implements AfterViewInit {
  #authService = inject(AuthService);
  #mapInstanceService = inject(MapInstanceService);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  showPassword = signal<boolean>(false);

  ngAfterViewInit(): void {
    this.#mapInstanceService.createMap('login-map', {
      zoomControl: false,
      fitBoundsButton: false,
      myLocationButton: false,
      layerControl: false,
    });
  }

  protected onTogglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected onSubmit(): void {
    const loginReq: LoginReq = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    };

    this.#authService.login(loginReq);
  }
}

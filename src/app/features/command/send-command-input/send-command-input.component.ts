import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StorageService, ToastService } from '@core/services';
import { QuickCommandManagerComponent } from '@shared/components';
import { LSKeys } from '@shared/constants';
import { CommandExecutionService } from '@shared/services';
import { SendCommandReq } from '@shared/types';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';

@Component({
  selector: 'app-send-command-input',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputGroupModule,
    SplitButtonModule,
    InputTextModule,
    DialogModule,
    QuickCommandManagerComponent,
  ],
  templateUrl: './send-command-input.component.html',
})
export class SendCommandInputComponent implements OnInit {
  #toastService = inject(ToastService);
  #storageService = inject(StorageService);
  #commandExecutionService = inject(CommandExecutionService);

  quickCommandDialogVisible = signal<boolean>(false);
  quickCommands = signal<string[]>([]);

  selectedDeviceId = input.required<string | null>();

  sendCommandForm = new FormGroup({
    command: new FormControl<string>('', Validators.required),
    label: new FormControl<string>(''),
  });

  splitButtonMenus = computed<MenuItem[]>(() => this.updateSplitButtonMenus());


  ngOnInit(): void {
    this.loadLocalCommands();
  }

  onSendCommand(priority: number): void {
    if (!this.selectedDeviceId()) {
      this.#toastService.showError('Vui lòng chọn một IMEI!');
      return;
    }

    if (this.sendCommandForm.invalid) {
      this.#toastService.showError('Vui lòng nhập lệnh và nhãn!');
      return;
    }

    const request: SendCommandReq = {
      imei: this.selectedDeviceId()!,
      command: this.sendCommandForm.get('command')?.value ?? '',
      label: this.sendCommandForm.get('label')?.value ?? '',
      priority,
    };

    this.#commandExecutionService.executeCommand(request);
  }

  private updateSplitButtonMenus(): MenuItem[] {
    const quickCommandItems: MenuItem[] = this.quickCommands().map(
      (command) => ({
        label: command,
        icon: 'fas fa-terminal',
        command: (): void => this.sendQuickCommand(command),
      }),
    );

    const menuItems: MenuItem[] = [
      {
        label: 'Gửi chờ',
        icon: 'fas fa-turtle',
        command: (): void => this.onSendCommand(1),
      },

      { separator: true },

      {
        label: 'Quản lý',
        icon: 'far fa-gear',
        command: (): void => this.quickCommandDialogVisible.set(true),
      },
      ...quickCommandItems,
    ];

    return menuItems;
  }

  protected onQuickCommandDialogClose(): void {
    this.loadLocalCommands();
  }

  private loadLocalCommands(): void {
    const localCommands: string[] =
      this.#storageService.getLocal(LSKeys.QUICK_COMMANDS, true) || [];
    this.quickCommands.set(localCommands);
  }

  private sendQuickCommand(command: string): void {
    this.sendCommandForm.get('command')?.setValue(command);
    this.onSendCommand(0);
  }
}

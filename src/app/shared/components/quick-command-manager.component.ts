import {
  Component,
  effect,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '@core/services';
import { LSKeys } from '../constants/storage.constant';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
@Component({
  selector: 'app-quick-command-manager',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, FloatLabel],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl text-theme-700 font-bold ">Quản lý lệnh</h3>
        <p-button
          icon="fas fa-times"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          (onClick)="closeDialog.emit()"
        />
      </div>
      <div class="flex flex-col gap-2 px-2">
        @for (command of commands(); track command) {
          <div
            class="flex items-center gap-2 justify-between border-b border-surface-200 py-1"
          >
            <span>{{ command }}</span>
            <p-button
              icon="fas fa-trash-alt"
              severity="danger"
              [rounded]="true"
              [text]="true"
              size="small"
              (onClick)="deleteCommand(command)"
            />
          </div>
        }

        @if (isCreating()) {
          <div class="flex items-center justify-between gap-2 mt-2">
            <p-floatlabel variant="on" class="flex-1">
              <input
                type="text"
                pInputText
                id="newCommand"
                [(ngModel)]="newCommand"
                autocomplete="off"
                pSize="small"
                class="w-full"
              />
              <label for="newCommand">Lệnh mới</label>
            </p-floatlabel>
            <div class="flex-center gap-2">
              <p-button
                icon="fas fa-xmark"
                severity="danger"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="cancelCreateCommand()"
              />
              <p-button
                icon="fas fa-check"
                severity="success"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="createCommand()"
              />
            </div>
          </div>
        } @else {
          <button
            class="flex-center gap-2 hover:bg-primary-500/20 rounded py-2 text-primary transition-colors duration-300 cursor-pointer"
            (click)="isCreating.set(true)"
          >
            <i class="fas fa-plus"></i>
            <p class="font-medium">Thêm lệnh</p>
          </button>
        }
      </div>
    </div>
  `,
})
export class QuickCommandManagerComponent implements OnInit {
  #storageService = inject(StorageService);

  closeDialog = output<void>();

  commands = signal<string[]>([]);
  isCreating = signal<boolean>(false);
  newCommand = signal<string>('');

  constructor() {
    effect(() => {
      this.#storageService.setLocal(LSKeys.QUICK_COMMANDS, this.commands());
    });
  }

  ngOnInit(): void {
    this.loadCommands();
  }

  private loadCommands(): void {
    try {
      const localCommands: string[] =
        this.#storageService.getLocal(LSKeys.QUICK_COMMANDS, true) || [];
      if (localCommands) {
        this.commands.set(localCommands);
      }
    } catch (error) {
      console.error('Error loading commands from localStorage:', error);
      this.commands.set([]);
    }
  }

  protected cancelCreateCommand(): void {
    this.isCreating.set(false);
    this.newCommand.set('');
  }

  protected createCommand(): void {
    const existingCommand = this.commands().find(
      (cmd) =>
        cmd.trim().toUpperCase() === this.newCommand().trim().toUpperCase(),
    );
    if (this.newCommand().trim() === '' || existingCommand) {
      this.cancelCreateCommand();
      return;
    }

    this.commands.update((commands) => [
      ...commands,
      this.newCommand().trim().toUpperCase(),
    ]);
    this.isCreating.set(false);
    this.newCommand.set('');
  }

  deleteCommand(command: string): void {
    this.commands.update((commands) =>
      commands.filter((cmd) => cmd !== command),
    );
  }
}

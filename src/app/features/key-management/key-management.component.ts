import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSearchComponent, ToolbarComponent } from '@shared/components';
import {
  KeyApplicationStore,
  KeyPackageStore,
  ServiceKeyStore,
} from '@shared/stores';
import { KeyApplicationDto, KeyPackageDto, KeyStatus } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { KeyBatchGenerationDialogComponent } from './key-batch-generation-dialog/key-batch-generation-dialog.component';
import { KeyTableComponent } from './key-table/key-table.component';
@Component({
  selector: 'app-key-management',
  imports: [
    ToolbarComponent,
    InputSearchComponent,
    ButtonModule,
    KeyTableComponent,
    SelectModule,
    FormsModule,
    DialogModule,
    KeyBatchGenerationDialogComponent,
  ],
  templateUrl: './key-management.component.html',
  providers: [ServiceKeyStore, KeyApplicationStore, KeyPackageStore],
})
export class KeyManagementComponent {
  serviceKeyStore = inject(ServiceKeyStore);
  keyApplicationStore = inject(KeyApplicationStore);
  keyPackageStore = inject(KeyPackageStore);

  keyStatues = signal<KeyStatus[]>([
    {
      id: 0,
      name: 'Available',
      textColor: 'text-blue-900',
      backgroundColor: 'bg-blue-500/20',
    },
    {
      id: 1,
      name: 'Reserved',
      textColor: 'text-cyan-900',
      backgroundColor: 'bg-cyan-500/20',
    },
    {
      id: 2,
      name: 'Activated',
      textColor: 'text-green-900',
      backgroundColor: 'bg-green-500/20',
    },
    {
      id: 3,
      name: 'Expired',
      textColor: 'text-red-900',
      backgroundColor: 'bg-red-500/20',
    },
    {
      id: 4,
      name: 'Deleted',
      textColor: 'text-orange-900',
      backgroundColor: 'bg-orange-500/20',
    },
  ]);

  selectedKeyStatus = signal<KeyStatus | undefined>(undefined);
  selectedKeyApplication = signal<KeyApplicationDto | undefined>(undefined);
  selectedKeyPackage = signal<KeyPackageDto | undefined>(undefined);

  keyGenerationDialogVisible = signal<boolean>(false);
  protected requestKey(): void {
    this.serviceKeyStore.setRequest({
      appId: this.selectedKeyApplication()?.id,
      packageId: this.selectedKeyPackage()?.id,
      status: this.selectedKeyStatus()?.id,
    });

    this.serviceKeyStore.refresh();
  }
}

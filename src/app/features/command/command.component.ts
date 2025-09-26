import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';

import { SplitPanelComponent } from '@shared/components';
import { DevicePanelComponent } from './device-panel/device-panel.component';
import { PackageComponent } from './package/package.component';
import { SendCommandComponent } from './send-command/send-command.component';

export type PackageDisplay = 'raw' | 'parsed' | 'content';

@Component({
  selector: 'app-command',
  imports: [
    FormsModule,
    SelectButtonModule,
    SelectModule,
    FloatLabelModule,
    SplitPanelComponent,
    DevicePanelComponent,
    PackageComponent,
    SendCommandComponent,
  ],
  templateUrl: './command.component.html',
  providers: [],
})
export class CommandComponent {
  selectedTabIdx = signal<number>(0);
  selectedDeviceId = signal<string | null>(null);

  // !package display
  selectedPackageDisplay = signal<PackageDisplay>('parsed');
  dataFontSizePx = signal<number>(12);
}

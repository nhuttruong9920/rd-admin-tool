import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-key-manual-flow-dialog',
  imports: [StepperModule, ButtonModule],
  templateUrl: './key-manual-flow-dialog.component.html',
})
export class KeyManualFlowDialogComponent {}

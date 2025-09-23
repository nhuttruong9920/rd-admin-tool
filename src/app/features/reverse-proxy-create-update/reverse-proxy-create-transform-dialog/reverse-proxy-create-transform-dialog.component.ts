import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  model,
  output,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-reverse-proxy-create-transform-dialog',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
  ],
  templateUrl: './reverse-proxy-create-transform-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverseProxyCreateTransformDialogComponent {
  readonly closePopover = output<void>();
  readonly addTransform = output<Record<string, string>>();
  readonly updatingTransform = model<Record<string, string> | null>();
  readonly updateTransform = output<Record<string, string>>();

  readonly submitLabel = computed(() =>
    this.updatingTransform() ? 'Sửa' : 'Thêm',
  );

  createTransformForm = new FormGroup({
    transform: new FormArray<FormGroup>([]),
  });

  constructor() {
    effect(() => {
      if (this.updatingTransform()) {
        this.transformsFormArray.clear();
        const transform = this.updatingTransform()!;
        Object.entries(transform).forEach(([key, value]) => {
          const transformGroup = new FormGroup({
            key: new FormControl<string>(key),
            value: new FormControl<string>(value),
          });
          this.transformsFormArray.push(transformGroup);
        });
      } else {
        this.createTransformForm.reset();
        this.transformsFormArray.clear();
      }
    });
  }

  get transformsFormArray(): FormArray {
    return this.createTransformForm.get('transform') as FormArray;
  }

  protected onAddTransformEntry(): void {
    const transformGroup = new FormGroup({
      key: new FormControl<string>(''),
      value: new FormControl<string>(''),
    });
    this.transformsFormArray.push(transformGroup);
  }

  protected onRemoveTransformEntry(index: number): void {
    if (index >= 0 && index < this.transformsFormArray.length) {
      this.transformsFormArray.removeAt(index);
    }
  }

  protected onSubmit(): void {
    const transform = this.transformsFormArray.controls.reduce(
      (acc, curr) => {
        const key = curr.get('key')?.value;
        const value = curr.get('value')?.value;
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    if (this.updatingTransform()) {
      this.updateTransform.emit(transform);
    } else {
      this.addTransform.emit(transform);
    }
    this.onClosePopover();
  }

  public onClosePopover(): void {
    this.transformsFormArray.clear();
    this.createTransformForm.reset();
    this.updatingTransform.set(null);
    this.closePopover.emit();
  }
}

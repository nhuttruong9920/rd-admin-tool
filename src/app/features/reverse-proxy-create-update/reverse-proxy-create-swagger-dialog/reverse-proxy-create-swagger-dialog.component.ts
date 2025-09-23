import {
  Component,
  computed,
  effect,
  model,
  output
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { SwaggerConfig } from '@shared/types';

@Component({
  selector: 'app-reverse-proxy-create-swagger-dialog',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    ToggleSwitchModule,
  ],
  templateUrl: './reverse-proxy-create-swagger-dialog.component.html',
})
export class ReverseProxyCreateSwaggerDialogComponent {
  readonly updatingSwagger = model<SwaggerConfig | null>();
  readonly closePopover = output<void>();
  readonly addSwagger = output<SwaggerConfig>();
  readonly updateSwagger = output<SwaggerConfig>();

  readonly submitLabel = computed(() =>
    this.updatingSwagger() ? 'Sửa' : 'Thêm',
  );

  createSwaggerForm = new FormGroup({
    metadataPath: new FormControl<string>(''),
    paths: new FormArray<FormControl<string>>([]),
    prefixPath: new FormControl<string>(''),
    pathFilterRegexPattern: new FormControl<string>(''),
    addOnlyPublishedPaths: new FormControl<boolean>(false),
  });

  constructor() {
    effect(() => {
      if (this.updatingSwagger()) {
        this.createSwaggerForm.patchValue(this.updatingSwagger()!);
        this.pathsArray.clear();
        this.updatingSwagger()!.paths.forEach((path) => {
          this.pathsArray.push(
            new FormControl<string>(path, { nonNullable: true }),
          );
        });
      } else {
        this.createSwaggerForm.reset();
        this.pathsArray.clear();
      }
    });
  }

  get pathsArray(): FormArray<FormControl<string>> {
    return this.createSwaggerForm.get('paths') as FormArray<
      FormControl<string>
    >;
  }

  protected onAddPath(): void {
    this.pathsArray.push(new FormControl<string>('', { nonNullable: true }));
  }

  protected onRemovePath(index: number): void {
    this.pathsArray.removeAt(index);
  }

  protected onSubmit(): void {
    const swaggerConfig: SwaggerConfig = {
      metadataPath: this.createSwaggerForm.value.metadataPath ?? '',
      paths: this.pathsArray.value.filter((path) => path !== ''),
      prefixPath: this.createSwaggerForm.value.prefixPath ?? '',
      pathFilterRegexPattern:
        this.createSwaggerForm.value.pathFilterRegexPattern ?? '',
      addOnlyPublishedPaths:
        this.createSwaggerForm.value.addOnlyPublishedPaths ?? false,
    };

    if (this.updatingSwagger()) {
      this.updateSwagger.emit(swaggerConfig);
    } else {
      this.addSwagger.emit(swaggerConfig);
    }
    this.onClosePopover();
  }

  onClosePopover(): void {
    this.createSwaggerForm.reset();
    this.updatingSwagger.set(null);
    this.pathsArray.clear();
    this.closePopover.emit();
  }
}

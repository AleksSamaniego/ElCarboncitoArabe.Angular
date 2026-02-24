import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../../shared/models';

export interface CategoryDialogData {
  category?: CategoryDto;
}

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
})
export class CategoryDialogComponent {
  form: FormGroup;
  readonly isEdit: boolean;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: CategoryDialogData,
  ) {
    this.isEdit = !!data.category;
    this.form = this.fb.group({
      name: [
        data.category?.name ?? '',
        [Validators.required, Validators.maxLength(100)],
      ],
      sortOrder: [
        data.category?.sortOrder ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      isActive: [data.category?.isActive ?? true],
    });
  }

  confirm(): void {
    if (this.form.invalid) return;
    const { name, sortOrder, isActive } = this.form.value;

    if (this.isEdit) {
      const req: UpdateCategoryRequest = {
        name,
        sortOrder: +sortOrder,
        isActive,
      };
      this.dialogRef.close(req);
      return;
    }

    const req: CreateCategoryRequest = {
      name,
      sortOrder: +sortOrder,
    };
    this.dialogRef.close(req);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

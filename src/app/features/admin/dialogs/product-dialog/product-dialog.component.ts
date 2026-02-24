import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoryDto,
  CreateProductRequest,
  ProductDto,
  UpdateProductRequest,
} from '../../../../shared/models';
import { CategoriesApiService } from '../../../../core/api/categories-api.service';

export interface ProductDialogData {
  product?: ProductDto;
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
})
export class ProductDialogComponent implements OnInit {
  form: FormGroup;
  categories: CategoryDto[] = [];
  readonly isEdit: boolean;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProductDialogData,
    private readonly categoriesApi: CategoriesApiService,
  ) {
    this.isEdit = !!data.product;
    this.form = this.fb.group({
      name: [
        data.product?.name ?? '',
        [Validators.required, Validators.maxLength(200)],
      ],
      price: [
        data.product?.price ?? null,
        [Validators.required, Validators.min(0.01)],
      ],
      categoryId: [data.product?.categoryId ?? null, Validators.required],
      isActive: [data.product?.isActive ?? true],
    });
  }

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe((c) => (this.categories = c));
  }

  confirm(): void {
    if (this.form.invalid) return;
    const { name, price, categoryId, isActive } = this.form.value;
    if (this.isEdit) {
      const req: UpdateProductRequest = {
        name,
        price: +price,
        categoryId: categoryId,
        isActive,
      };
      this.dialogRef.close(req);
      return;
    }

    const req: CreateProductRequest = {
      name,
      price: +price,
      categoryId: categoryId,
    };
    this.dialogRef.close(req);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

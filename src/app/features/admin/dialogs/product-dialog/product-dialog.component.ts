import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryDto, CreateProductRequest, ProductDto } from '../../../../shared/models';
import { CategoriesApiService } from '../../../../core/api/categories-api.service';

export interface ProductDialogData {
  product?: ProductDto;
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent implements OnInit {
  form: FormGroup;
  categories: CategoryDto[] = [];
  readonly isEdit: boolean;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProductDialogData,
    private readonly categoriesApi: CategoriesApiService
  ) {
    this.isEdit = !!data.product;
    this.form = this.fb.group({
      name: [data.product?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [data.product?.description ?? ''],
      price: [data.product?.price ?? null, [Validators.required, Validators.min(0)]],
      categoryId: [data.product?.categoryId ?? null, Validators.required],
      isAvailable: [data.product?.isAvailable ?? true],
      imageUrl: [data.product?.imageUrl ?? '']
    });
  }

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe(c => (this.categories = c));
  }

  confirm(): void {
    if (this.form.invalid) return;
    const { name, description, price, categoryId, isAvailable, imageUrl } = this.form.value;
    const req: CreateProductRequest = {
      name,
      price: +price,
      categoryId: +categoryId,
      isAvailable
    };
    if (description) req.description = description;
    if (imageUrl) req.imageUrl = imageUrl;
    this.dialogRef.close(req);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { ProductsApiService } from '../../../core/api/products-api.service';
import { CategoriesApiService } from '../../../core/api/categories-api.service';
import { CategoryDto, CreateProductRequest, ProductDto } from '../../../shared/models';
import { ProductDialogComponent, ProductDialogData } from '../dialogs/product-dialog/product-dialog.component';

@Component({
  selector: 'app-products-catalog',
  templateUrl: './products-catalog.component.html',
  styleUrl: './products-catalog.component.scss'
})
export class ProductsCatalogComponent implements OnInit {
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loading = false;
  savingIds = new Set<string | null>();

  readonly displayedColumns = ['name', 'category', 'price', 'available', 'actions'];

  constructor(
    private readonly productsApi: ProductsApiService,
    private readonly categoriesApi: CategoriesApiService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    forkJoin({
      categories: this.categoriesApi.getCategories(),
      products: this.productsApi.getProducts()
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories = categories;
        this.products = products;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.name ?? '—';
  }

  openAddDialog(): void {
    const ref = this.dialog.open<ProductDialogComponent, ProductDialogData, CreateProductRequest>(
      ProductDialogComponent,
      { width: '480px', data: {} }
    );
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(null);
      this.productsApi.createProduct(req).subscribe({
        next: (created) => {
          this.products = [...this.products, created];
          this.savingIds.delete(null);
        },
        error: () => this.savingIds.delete(null)
      });
    });
  }

  openEditDialog(product: ProductDto): void {
    const ref = this.dialog.open<ProductDialogComponent, ProductDialogData, CreateProductRequest>(
      ProductDialogComponent,
      { width: '480px', data: { product } }
    );
    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(product.id);
      this.productsApi.updateProduct(product.id, req).subscribe({
        next: (updated) => {
          this.products = this.products.map(p => p.id === updated.id ? updated : p);
          this.savingIds.delete(product.id);
        },
        error: () => this.savingIds.delete(product.id)
      });
    });
  }

  isSaving(productId: string | null): boolean {
    return this.savingIds.has(productId);
  }
}

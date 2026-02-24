import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesApiService } from '../../../core/api/categories-api.service';
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../shared/models';
import {
  CategoryDialogComponent,
  CategoryDialogData,
} from '../dialogs/category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories-catalog',
  templateUrl: './categories-catalog.component.html',
  styleUrl: './categories-catalog.component.scss',
})
export class CategoriesCatalogComponent implements OnInit {
  categories: CategoryDto[] = [];
  loading = false;
  savingIds = new Set<string | null>();

  readonly displayedColumns = ['name', 'sortOrder', 'active', 'actions'];

  constructor(
    private readonly categoriesApi: CategoriesApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open<
      CategoryDialogComponent,
      CategoryDialogData,
      CreateCategoryRequest
    >(CategoryDialogComponent, {
      width: '420px',
      data: {},
    });

    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(null);
      this.categoriesApi.createCategory(req).subscribe({
        next: (created) => {
          this.categories = [...this.categories, created];
          this.savingIds.delete(null);
        },
        error: () => this.savingIds.delete(null),
      });
    });
  }

  openEditDialog(category: CategoryDto): void {
    const ref = this.dialog.open<
      CategoryDialogComponent,
      CategoryDialogData,
      UpdateCategoryRequest
    >(CategoryDialogComponent, {
      width: '420px',
      data: { category },
    });

    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(category.id);
      this.categoriesApi.updateCategory(category.id, req).subscribe({
        next: (updated) => {
          this.categories = this.categories.map((c) =>
            c.id === updated.id ? updated : c,
          );
          this.savingIds.delete(category.id);
        },
        error: () => this.savingIds.delete(category.id),
      });
    });
  }

  deleteCategory(category: CategoryDto): void {
    if (!confirm(`¿Desactivar la categoria "${category.name}"?`)) return;
    this.savingIds.add(category.id);
    this.categoriesApi.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.map((c) =>
          c.id === category.id ? { ...c, isActive: false } : c,
        );
        this.savingIds.delete(category.id);
      },
      error: () => this.savingIds.delete(category.id),
    });
  }

  isSaving(categoryId: string | null): boolean {
    return this.savingIds.has(categoryId);
  }
}

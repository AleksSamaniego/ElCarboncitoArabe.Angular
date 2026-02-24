import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActiveOrdersComponent } from './active-orders/active-orders.component';
import { ProductsCatalogComponent } from './products-catalog/products-catalog.component';
import { CategoriesCatalogComponent } from './categories-catalog/categories-catalog.component';

const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'orders', component: ActiveOrdersComponent },
  { path: 'products', component: ProductsCatalogComponent },
  { path: 'categories', component: CategoriesCatalogComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

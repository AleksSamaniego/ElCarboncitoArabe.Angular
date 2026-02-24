import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActiveOrdersComponent } from './active-orders/active-orders.component';
import { ProductsCatalogComponent } from './products-catalog/products-catalog.component';
import { CategoriesCatalogComponent } from './categories-catalog/categories-catalog.component';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { UsersManagementComponent } from './users-management/users-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: OwnerDashboardComponent },
  { path: 'orders', component: ActiveOrdersComponent },
  { path: 'products', component: ProductsCatalogComponent },
  { path: 'categories', component: CategoriesCatalogComponent },
  { path: 'users', component: UsersManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

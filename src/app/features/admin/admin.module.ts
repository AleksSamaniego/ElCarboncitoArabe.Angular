import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AdminRoutingModule } from './admin-routing.module';
import { ActiveOrdersComponent } from './active-orders/active-orders.component';
import { CheckoutDialogComponent } from './dialogs/checkout-dialog/checkout-dialog.component';
import { ChangeTypeDialogComponent } from './dialogs/change-type-dialog/change-type-dialog.component';
import { ProductDialogComponent } from './dialogs/product-dialog/product-dialog.component';
import { ProductsCatalogComponent } from './products-catalog/products-catalog.component';


@NgModule({
  declarations: [
    ActiveOrdersComponent,
    CheckoutDialogComponent,
    ChangeTypeDialogComponent,
    ProductDialogComponent,
    ProductsCatalogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatCheckboxModule
  ]
})
export class AdminModule { }

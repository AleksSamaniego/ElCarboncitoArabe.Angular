import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KitchenRoutingModule } from './kitchen-routing.module';
import { BoardComponent } from './board/board.component';


@NgModule({
  declarations: [
    BoardComponent
  ],
  imports: [
    CommonModule,
    KitchenRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class KitchenModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ShellComponent } from './shared/components/shell/shell.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'waiter',
        canActivate: [RoleGuard],
        data: { roles: ['Waiter', 'Owner'] },
        loadChildren: () => import('./features/waiter/waiter.module').then(m => m.WaiterModule)
      },
      {
        path: 'kitchen',
        canActivate: [RoleGuard],
        data: { roles: ['Kitchen', 'Owner'] },
        loadChildren: () => import('./features/kitchen/kitchen.module').then(m => m.KitchenModule)
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['Owner'] },
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: '',
        redirectTo: 'waiter',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

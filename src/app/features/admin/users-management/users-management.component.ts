import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsersApiService } from '../../../core/api/users-api.service';
import {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from '../../../shared/models';
import {
  UserDialogComponent,
  UserDialogData,
} from '../dialogs/user-dialog/user-dialog.component';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
})
export class UsersManagementComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  savingIds = new Set<string | null>();

  readonly displayedColumns = ['name', 'email', 'role', 'active', 'actions'];
  readonly roles = Object.values(UserRole);

  constructor(
    private readonly usersApi: UsersApiService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.usersApi.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open<
      UserDialogComponent,
      UserDialogData,
      CreateUserRequest
    >(UserDialogComponent, {
      width: '450px',
      data: {},
    });

    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(null);
      this.usersApi.createUser(req).subscribe({
        next: (created) => {
          this.users = [...this.users, created];
          this.savingIds.delete(null);
        },
        error: () => this.savingIds.delete(null),
      });
    });
  }

  openEditDialog(user: UserDto): void {
    const ref = this.dialog.open<
      UserDialogComponent,
      UserDialogData,
      UpdateUserRequest
    >(UserDialogComponent, {
      width: '450px',
      data: { user },
    });

    ref.afterClosed().subscribe((req) => {
      if (!req) return;
      this.savingIds.add(user.id);
      this.usersApi.updateUser(user.id, req).subscribe({
        next: (updated) => {
          this.users = this.users.map((u) => (u.id === user.id ? updated : u));
          this.savingIds.delete(user.id);
        },
        error: () => this.savingIds.delete(user.id),
      });
    });
  }

  deleteUser(user: UserDto): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${user.name}?`))
      return;

    this.savingIds.add(user.id);
    this.usersApi.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.savingIds.delete(user.id);
      },
      error: () => this.savingIds.delete(user.id),
    });
  }

  isSaving(userId: string | null): boolean {
    return this.savingIds.has(userId);
  }
}

import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../../../shared/models/user.models';

// Re-export UserDto interface explicitly to ensure TypeScript recognizes all properties
export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UserDialogData {
  user?: UserDto;
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
})
export class UserDialogComponent {
  form!: FormGroup;
  isEditMode = false;
  roles = Object.values(UserRole);
  private user: UserDto | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
  ) {
    this.user = data?.user;
    this.isEditMode = !!this.user;
    this.initForm();
  }

  private initForm(): void {
    if (this.isEditMode && this.user) {
      const formGroup = {
        name: [this.user.name, [Validators.required]],
        email: [this.user.email, [Validators.required, Validators.email]],
        role: [this.user.role, [Validators.required]],
        isActive: [this.user.isActive],
      };
      this.form = this.fb.group(formGroup);
    } else {
      this.form = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        role: ['Waiter', [Validators.required]],
      });
    }
  }

  get passwordControl() {
    return this.form.get('password');
  }

  get isPasswordVisible(): boolean {
    return this.passwordControl?.value?.length > 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditMode) {
      const payload: UpdateUserRequest = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        isActive: formValue.isActive,
      };
      this.dialogRef.close(payload);
    } else {
      const payload: CreateUserRequest = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
      };
      this.dialogRef.close(payload);
    }
  }
}

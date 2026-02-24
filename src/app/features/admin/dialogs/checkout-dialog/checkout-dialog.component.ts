import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CheckoutRequest,
  OrderDto,
  PaymentMethod,
  OrderStatus,
} from '../../../../shared/models';

export interface CheckoutDialogData {
  order: OrderDto;
  orders?: OrderDto[]; // All unpaid orders from the same table
}

@Component({
  selector: 'app-checkout-dialog',
  templateUrl: './checkout-dialog.component.html',
  styleUrl: './checkout-dialog.component.scss',
})
export class CheckoutDialogComponent {
  form: FormGroup;
  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: PaymentMethod.Cash, label: 'Efectivo' },
    { value: PaymentMethod.Card, label: 'Tarjeta' },
    { value: PaymentMethod.Transfer, label: 'Transferencia' },
  ];

  get consolidatedOrders(): OrderDto[] {
    return this.data.orders ?? [this.data.order];
  }

  get isConsolidated(): boolean {
    return this.consolidatedOrders.length > 1;
  }

  get consolidatedTotal(): number {
    return this.consolidatedOrders.reduce((sum, o) => sum + o.total, 0);
  }

  get consolidatedSubtotal(): number {
    return this.consolidatedOrders.reduce(
      (sum, o) => sum + (o.subtotal ?? o.total),
      0,
    );
  }

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: CheckoutDialogData,
  ) {
    this.form = this.fb.group({
      paymentMethod: [PaymentMethod.Cash, Validators.required],
      discount: [0],
      tax: [0],
      paymentNotes: [''],
    });
  }

  confirm(): void {
    if (this.form.invalid) return;
    const { paymentMethod, discount, tax, paymentNotes } = this.form.value;
    const req: CheckoutRequest = {
      paymentMethod,
      discount: discount != null ? +discount : 0,
      tax: tax != null ? +tax : 0,
      paymentNotes: paymentNotes || undefined,
    };
    this.dialogRef.close(req);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

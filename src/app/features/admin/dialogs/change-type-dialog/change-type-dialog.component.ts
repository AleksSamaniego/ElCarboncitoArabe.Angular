import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderDto, OrderType, PlatformDto, TableDto } from '../../../../shared/models';
import { ChangeTypeRequest } from '../../../../core/api/orders-api.service';
import { TablesApiService } from '../../../../core/api/tables-api.service';
import { PlatformsApiService } from '../../../../core/api/platforms-api.service';

export interface ChangeTypeDialogData {
  order: OrderDto;
}

@Component({
  selector: 'app-change-type-dialog',
  templateUrl: './change-type-dialog.component.html'
})
export class ChangeTypeDialogComponent implements OnInit {
  form: FormGroup;
  readonly OrderType = OrderType;
  readonly orderTypeOptions: { value: OrderType; label: string }[] = [
    { value: OrderType.DineIn, label: 'Comer aquí (Mesa)' },
    { value: OrderType.TakeAway, label: 'Para llevar' },
    { value: OrderType.Delivery, label: 'Plataforma' }
  ];
  tables: TableDto[] = [];
  platforms: PlatformDto[] = [];

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<ChangeTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ChangeTypeDialogData,
    private readonly tablesApi: TablesApiService,
    private readonly platformsApi: PlatformsApiService
  ) {
    this.form = this.fb.group({
      type: [data.order.type, Validators.required],
      tableId: [data.order.tableId ?? null],
      platformId: [data.order.platformId ?? null]
    });
  }

  ngOnInit(): void {
    this.tablesApi.getTables().subscribe(t => (this.tables = t));
    this.platformsApi.getPlatforms().subscribe(p => (this.platforms = p));

    this.form.get('type')!.valueChanges.subscribe((t: OrderType) => {
      if (t !== OrderType.DineIn) this.form.patchValue({ tableId: null });
      if (t !== OrderType.Delivery) this.form.patchValue({ platformId: null });
    });
  }

  get selectedType(): OrderType {
    return this.form.value.type;
  }

  confirm(): void {
    if (this.form.invalid) return;
    const { type, tableId, platformId } = this.form.value;
    const req: ChangeTypeRequest = { type };
    if (type === OrderType.DineIn && tableId) req.tableId = tableId;
    if (type === OrderType.Delivery && platformId) req.platformId = platformId;
    this.dialogRef.close(req);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

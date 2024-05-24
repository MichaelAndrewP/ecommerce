import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AdminService } from 'src/app/services/admin/admin.service';
import { CreateProductComponent } from '../admin-create-product/create-product/create-product.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnDestroy {
  dialogRef: MatDialogRef<CreateProductComponent> | undefined;
  products = this.adminService.getProducts();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    public dialog: MatDialog,
    public matCardModule: MatCardModule
  ) {}

  openDialog() {
    if (!this.dialog.openDialogs.length) {
      this.dialogRef = this.dialog.open(CreateProductComponent);
    }
  }

  closeDialog() {
    this.dialogRef?.close();
  }

  logout() {
    this.authService.logout('admin');
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.closeDialog();
  }
}

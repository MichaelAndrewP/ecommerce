import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AdminService } from 'src/app/services/admin/admin.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CreateProductComponent } from '../create-product/create-product.component';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { NotificationService } from 'src/app/services/toastr/notification.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnDestroy {
  createProductDialogRef: MatDialogRef<CreateProductComponent> | undefined;
  updateProductDialogRef: MatDialogRef<UpdateProductComponent> | undefined;
  products = this.adminService.getProducts();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    public dialog: MatDialog,
    public matCardModule: MatCardModule,
    private fireStore: Firestore,
    private toastr: NotificationService,
    private storage: Storage
  ) {}

  openNewItemDialog() {
    if (!this.dialog.openDialogs.length) {
      this.createProductDialogRef = this.dialog.open(CreateProductComponent, {
        data: {
          close: this.closeDialog.bind(this),
        },
      });
    }
  }

  openEditProductDialog(
    id: string,
    name: string,
    product?: {
      price?: number;
      quantity?: number;
      description?: string;
      currency?: string;
      imageUrl?: string;
    },
    toEdit?: string
  ) {
    try {
      if (!this.dialog.openDialogs.length) {
        this.updateProductDialogRef = this.dialog.open(UpdateProductComponent, {
          data: {
            close: this.closeDialog.bind(this),
            name: name ?? '',
            price: product?.price ?? 0,
            quantity: product?.quantity ?? 0,
            description: product?.description ?? '',
            currency: product?.currency ?? 0,
            imageUrl: product?.imageUrl ?? '',
            id: id,
            toEdit: toEdit,
          },
        });
      }
    } catch (error) {
      this.toastr.showError('Error!', 'Failed to open dialog');
      console.error('Failed to open dialog', error);
    }
  }

  closeDialog() {
    this.createProductDialogRef?.close();
    this.updateProductDialogRef?.close();
  }
  deleteAdminProduct(id: string, imgUrl: string) {
    return this.adminService.deleteProduct(id, imgUrl);
  }

  logout() {
    this.authService.logout('admin');
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.closeDialog();
  }
}

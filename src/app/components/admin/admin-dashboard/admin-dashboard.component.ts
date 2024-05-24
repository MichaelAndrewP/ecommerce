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
import { NotificationService } from 'src/app/services/toastr/notification.service';
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
    public matCardModule: MatCardModule,
    private fireStore: Firestore,
    private toastr: NotificationService,
    private storage: Storage
  ) {}

  openDialog() {
    if (!this.dialog.openDialogs.length) {
      this.dialogRef = this.dialog.open(CreateProductComponent, {
        data: {
          close: this.closeDialog.bind(this),
        },
      });
    }
  }

  closeDialog() {
    this.dialogRef?.close();
  }

  deleteProduct(id: string, imgUrl: string) {
    const docInstance = doc(this.fireStore, 'products', id);
    deleteDoc(docInstance)
      .then(() => {
        const refPath = ref(this.storage, imgUrl);
        deleteObject(refPath);
        this.toastr.showSuccess('Success!', 'Product deleted successfully!');
      })
      .catch(() => {
        this.toastr.showError(
          'Error removing the Product!',
          'Please try again later!'
        );
      });
  }

  logout() {
    this.authService.logout('admin');
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.closeDialog();
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { finalize, from } from 'rxjs';
import { AdminService } from 'src/app/services/admin/admin.service';
import { NotificationService } from 'src/app/services/toastr/notification.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent {
  name: string = '';
  price: number = 0;
  quantity: number = 0;
  description: string = '';
  currency: string = '';
  imageUrl: string = '';
  uploadFilePath: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: Storage,
    private fireStore: Firestore,
    private toastr: NotificationService,
    private adminService: AdminService
  ) {}

  close() {
    this.data.close();
    /* TODO: THIS BECOMES A BUG THAT DELETES IMAGES WHENEVER */
    /*   if (this.imageUrl) {
      this.deleteFile(this.uploadFilePath);
    } */
  }

  /*   uploadFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    const filePath = `products/${new Date().getTime()}_${file.name}`;
    this.uploadFilePath = filePath;
    const fileRef = ref(this.storage, filePath);

    const task = uploadBytes(fileRef, file);
    console.log('task', task.then());
    from(task)
      .pipe(
        finalize(() => {
          from(getDownloadURL(fileRef)).subscribe((url) => {
            this.imageUrl = url;
          });
        })
      )
      .subscribe();
  } */

  uploadFile(event: Event) {
    this.adminService.uploadImageFile(event).subscribe((url: string) => {
      this.imageUrl = url;
    });
  }
  /* 
  deleteFile(filePath: string) {
    return this.adminService.deleteProductFromStorage(filePath);
  } */

  onSubmit() {
    addDoc(collection(this.fireStore, 'products'), {
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      description: this.description,
      currency: this.currency,
      image: this.imageUrl,
    })
      .then(() => {
        this.toastr.showSuccess('Success!', 'Product added!');
        this.close();
      })
      .catch(() => {
        this.toastr.showError(
          'Error adding the new Product!',
          'Please try again later!'
        );
      });
  }
}

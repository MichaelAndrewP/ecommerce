import { Injectable } from '@angular/core';
import { NotificationService } from '../toastr/notification.service';
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
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { map, finalize, from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  editName: boolean = false;
  constructor(
    private toastr: NotificationService,
    private fireStore: Firestore,
    private storage: Storage
  ) {}

  collectionInstance = collection(this.fireStore, 'products');

  getProducts() {
    return collectionData(this.collectionInstance, { idField: 'id' }).pipe(
      map((actions) => {
        return actions;
      })
    );
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
  async updateProductName(id: string, newName: string) {
    // Query the 'products' collection for documents with the new name
    const productsRef = collection(this.fireStore, 'products');
    const snapshot = await getDocs(
      query(productsRef, where('name', '==', newName))
    );

    if (!snapshot.empty) {
      this.toastr.showError('Error!', 'Product with this name already exists');
      return;
    }

    // If no existing document with the new name was found, update the document
    const docInstance = doc(this.fireStore, 'products', id);
    const updatedData = {
      name: newName,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product name updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product name');
      });
  }

  updateProductPrice(id: string, newPrice: number) {
    const docInstance = doc(this.fireStore, 'products', id);
    const updatedData = {
      price: newPrice,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product price updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product price');
      });
  }

  updateProductQuantity(id: string, newQuantity: number) {
    const docInstance = doc(this.fireStore, 'products', id);
    const updatedData = {
      quantity: newQuantity,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product quantity updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product quantity');
      });
  }

  updateProductDescription(id: string, newDescription: string) {
    const docInstance = doc(this.fireStore, 'products', id);
    const updatedData = {
      description: newDescription,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product description updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product description');
      });
  }

  updateProductCurrency(id: string, newCurrency: string) {
    const docInstance = doc(this.fireStore, 'products', id);
    const updatedData = {
      currency: newCurrency,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product currency updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product currency');
      });
  }

  deleteProductFromStorage(filePath: string) {
    const fileRef = ref(this.storage, filePath);
    deleteObject(fileRef)
      .then(() => {
        console.log('File deleted successfully');
      })
      .catch((error) => {
        console.log('Error in file deletion:', error);
      });
  }

  updateProductImageUrl(
    id: string,
    newImageUrl: string,
    event: Event,
    oldImageUrl: string
  ) {
    const docInstance = doc(this.fireStore, 'products', id);
    this.deleteProductFromStorage(oldImageUrl);
    const updatedData = {
      image: newImageUrl,
    };
    updateDoc(docInstance, updatedData)
      .then(() => {
        this.toastr.showSuccess(
          'Success!',
          'Product image URL updated successfully'
        );
      })
      .catch((error) => {
        this.toastr.showError('Error!', 'Error updating product image URL');
      });
  }

  uploadImageFile(event: Event): Observable<string> {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    const filePath = `products/${new Date().getTime()}_${file.name}`;

    const fileRef = ref(this.storage, filePath);

    const task = uploadBytes(fileRef, file);

    return from(task).pipe(switchMap(() => getDownloadURL(fileRef)));
  }
  /*  .then(() => {
        this.toastr.showSuccess('Product name updated successfully');
      })
      .catch((error) => {
        this.toastr.showError('Error updating product name');
      });
  } */
}

import { Injectable } from '@angular/core';
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
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  collectionInstance = collection(this.fireStore, 'products');

  constructor(private fireStore: Firestore) {}

  getListedProducts() {
    return collectionData(this.collectionInstance, { idField: 'id' }).pipe(
      map((actions) => {
        return actions;
      })
    );
  }

  getCustomerCartItems(customerId: string) {
    return collectionData(
      collection(this.fireStore, `customer/${customerId}/products`),
      { idField: 'id' }
    ).pipe(
      map((actions) => {
        return actions;
      })
    );
  }

  addToCustomerCart(product: any, customerId: string) {
    return addDoc(
      collection(this.fireStore, `customer/${customerId}/products`),
      product
    );
  }
}

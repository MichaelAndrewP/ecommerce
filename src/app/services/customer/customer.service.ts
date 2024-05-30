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
  getDoc,
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
      collection(this.fireStore, `customer/${customerId}/cart`),
      { idField: 'id' }
    ).pipe(
      map((products) => {
        return products;
      })
    );
  }

  async changeRowTotal(
    currentItemPrice: number,
    cartQuantity: number,
    productId: string,
    customerId: string
  ) {
    try {
      const newRowTotal = currentItemPrice * cartQuantity;
      const productRef = doc(
        this.fireStore,
        `customer/${customerId}/cart/${productId}`
      );
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        return updateDoc(productRef, {
          rowTotal: newRowTotal,
        });
      }
    } catch (error) {
      console.log('Error changing row total', error);
    }
  }

  async changeCartQuantity(
    newQuantity: number,
    productId: string,
    customerId: string
  ) {
    try {
      const productRef = doc(
        this.fireStore,
        `customer/${customerId}/cart/${productId}`
      );
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        return updateDoc(productRef, {
          cartQuantity: newQuantity,
        });
      }
    } catch (error) {
      console.log('Error changing cart quantity', error);
    }
  }

  addToCustomerCart(product: any, customerId: string) {
    const currentDate = new Date();
    return addDoc(collection(this.fireStore, `customer/${customerId}/cart`), {
      ...product,
      addedAt: currentDate,
      cartQuantity: 0,
      rowTotal: 0,
    });
  }
}

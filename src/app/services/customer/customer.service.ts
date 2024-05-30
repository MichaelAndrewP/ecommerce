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
  getDocs,
  query,
  where,
  DocumentData,
  runTransaction,
} from '@angular/fire/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  collectionInstance = collection(this.fireStore, 'products');

  constructor(private fireStore: Firestore) {}

  async isProductExistingInCart(productId: string, customerId: string) {
    const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
    const productSnapshot = await getDocs(
      query(cartRef, where('id', '==', productId))
    );

    if (!productSnapshot.empty) {
      console.log('Product exists in cart');
      return true;
    } else {
      console.log('Product does not exist in cart');
      return false;
    }
  }

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
      { idField: 'docId' }
    ).pipe(
      map((products) => {
        console.log('Products check', products);
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
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const productSnapshot = await getDocs(
        query(cartRef, where('id', '==', productId))
      );

      if (!productSnapshot.empty) {
        const docId = productSnapshot.docs[0].id;
        const productRef = doc(
          this.fireStore,
          `customer/${customerId}/cart/${docId}`
        );
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
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const productSnapshot = await getDocs(
        query(cartRef, where('id', '==', productId))
      );

      if (!productSnapshot.empty) {
        const docId = productSnapshot.docs[0].id;

        const docRef = doc(
          this.fireStore,
          `customer/${customerId}/cart/${docId}`
        );

        await updateDoc(docRef, {
          cartQuantity: newQuantity,
        });

        console.log('Quantity updated');
      } else {
        console.log('Product not found in cart');
      }
    } catch (error) {
      console.log('Error changing cart quantity', error);
    }
  }

  addToCustomerCart(product: any, customerId: string) {
    const currentDate = new Date();
    const productRef = doc(this.fireStore, 'products', product.id);

    return addDoc(collection(this.fireStore, `customer/${customerId}/cart`), {
      ...product,
      addedToCartAt: currentDate,
      cartQuantity: 1,
      rowTotal: product.price,
      productObjectRef: productRef,
    });
  }

  async addToCheckedOutProducts(customerId: string, transaction: any) {
    try {
      const currentDate = new Date();
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const cartItems = await getDocs(cartRef);
      cartItems.docs.forEach(async (docCartItem) => {
        addDoc(collection(this.fireStore, `customer/${customerId}/checkout`), {
          ...docCartItem.data(),
          checkedOutAt: currentDate,
        });
      });
    } catch (error) {
      console.log('Error adding to checked out products', error);
    }
  }

  async deleteProductFromCart(productId: string, customerId: string) {
    try {
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const productSnapshot = await getDocs(
        query(cartRef, where('id', '==', productId))
      );

      if (!productSnapshot.empty) {
        const docId = productSnapshot.docs[0].id;
        const productRef = doc(
          this.fireStore,
          `customer/${customerId}/cart/${docId}`
        );
        return deleteDoc(productRef);
      }
    } catch (error) {
      console.log('Error deleting product from cart', error);
    }
  }

  async clearCart(customerId: string, transaction: any) {
    try {
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const cartItems = await getDocs(cartRef);
      cartItems.docs.forEach(async (docCartItem) => {
        const docId = docCartItem.id;
        const productRef = doc(
          this.fireStore,
          `customer/${customerId}/cart/${docId}`
        );
        await deleteDoc(productRef);
      });
    } catch (error) {
      console.log('Error clearing cart', error);
    }
  }

  async updateProductStock(productId: string, newStock: number) {
    const docRef = doc(this.fireStore, 'products', productId);
    const updatedData = {
      stock: newStock,
    };

    return updateDoc(docRef, updatedData);
  }

  async checkOut(customerId: string) {
    try {
      await runTransaction(this.fireStore, async (transaction) => {
        await this.addToCheckedOutProducts(customerId, transaction);
        await this.clearCart(customerId, transaction);
      });
    } catch (error) {
      console.log('Error checking out', error);
    }
  }
}

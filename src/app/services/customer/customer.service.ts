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
import { NotificationService } from '../toastr/notification.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  collectionInstance = collection(this.fireStore, 'products');

  constructor(
    private fireStore: Firestore,
    private toastr: NotificationService
  ) {}

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

  /* async addToCheckedOutProducts(
    customerId: string,
    transaction: any
  ): Promise<boolean> {
    try {
      const currentDate = new Date();
      const cartRef = collection(this.fireStore, `customer/${customerId}/cart`);
      const cartItems = await getDocs(cartRef);
      for (const docCartItem of cartItems.docs) {
        const productId = docCartItem.data()['id'];
        if (await this.checkProductQuantity(productId)) {
          const checkoutRef = doc(
            this.fireStore,
            `customer/${customerId}/checkout`,
            docCartItem.id
          );
          transaction.set(checkoutRef, {
            ...docCartItem.data(),
            checkedOutAt: currentDate,
          });
          this.updateProductStock(
            productId,
            docCartItem.data()['cartQuantity']
          );
          this.clearCart(customerId, transaction);
          return true;
        } else {
          this.toastr.showError(
            'Error',
            `Checkout failed. ${docCartItem.data()['name']} is out of stock`
          );
          throw new Error(
            `Product ${docCartItem.data()['name']} is out of stock`
          );
        }
      }
      return true;
    } catch (error) {
      console.log('Error adding to checked out products', error);
      return false;
    }
  } */

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
      cartItems.docs.forEach(async (docCartItem: { id: any }) => {
        const docId = docCartItem.id;
        const productRef = doc(
          this.fireStore,
          `customer/${customerId}/cart/${docId}`
        );
        await this.checkProductQuantity(docId);
        await deleteDoc(productRef);
      });
    } catch (error) {
      console.log('Error clearing cart', error);
    }
  }

  /*   async updateProductStock(productId: string, newStock: number) {
    try {
      const docRef = doc(this.fireStore, 'products', productId);
      const product = (await getDoc(docRef)).data() as DocumentData;
      await this.checkProductQuantity(productId);
      const updatedData = {
        quantity: product['quantity'] - newStock,
      };

      return updateDoc(docRef, updatedData);
    } catch (error) {
      console.log('Error updating product stock', error);
    }
  } */

  async checkProductQuantity(productId: string): Promise<boolean> {
    try {
      const productRef = doc(this.fireStore, 'products', productId);
      const productDoc = await getDoc(productRef);
      const productData: DocumentData | undefined = productDoc.data();
      const productQuantity = productData ? productData['quantity'] : 0;
      console.log('Product quantity', productQuantity);
      if (productQuantity <= 0) {
        console.log('Product out of stock');
        return false;
      } else {
        console.log('Product in stock');
        return true;
      }
    } catch (error) {
      console.log('Error checking product quantity', error);
      return false;
    }
  }

  async checkOut(customerId: string) {
    try {
      await runTransaction(
        this.fireStore,
        async (transaction: {
          get: (arg0: any) => any;
          set: (arg0: any, arg1: any) => void;
          update: (arg0: any, arg1: { quantity: number }) => void;
        }) => {
          // runs a transaction
          const cartRef = collection(
            this.fireStore,
            `customer/${customerId}/cart`
          );
          const cartItems = await getDocs(cartRef);
          for (const docCartItem of cartItems.docs) {
            const productId = docCartItem.data()['id'];
            const productRef = doc(this.fireStore, `products/${productId}`);
            const productSnap = await transaction.get(productRef);
            const productData = productSnap.data(); // gets the product data
            if (
              productData &&
              productData['quantity'] >= docCartItem.data()['cartQuantity'] // checks if the product quantity is greater than the cart quantity
            ) {
              const checkoutRef = doc(
                this.fireStore,
                `customer/${customerId}/checkout`,
                docCartItem.id
              ); // creates a reference to the checkout collection

              // sets the checkout data (adds it as a new document in the checkout sub-collection)
              transaction.set(checkoutRef, {
                ...docCartItem.data(),
                checkedOutAt: new Date(),
              });

              // updates the product quantity
              transaction.update(productRef, {
                quantity:
                  productData['quantity'] - docCartItem.data()['cartQuantity'],
              });
              this.clearCart(customerId, transaction);
            } else {
              this.toastr.showError(
                'Error',
                `Checkout failed. ${docCartItem.data()['name']} is out of stock`
              );
              throw new Error(
                `Product ${docCartItem.data()['name']} is out of stock`
              );
            }
          }
          this.toastr.showSuccess('Success', 'Checkout successful');
        }
      );
    } catch (error) {
      /* this.toastr.showError('Error', `${error}`); */
      console.log('Error checking out', error);
    }
  }
}

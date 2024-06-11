import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

admin.initializeApp();

export const updateProduct = onDocumentUpdated(
  'products/{productId}',
  async (event: { data: any }) => {
    try {
      const data = event.data.after.data();

      // Check if a product with the same name already exists
      const productsRef = admin.firestore().collection('products');

      const snapshot = await productsRef.where('name', '==', data.name).get();
      if (!snapshot.empty) {
        console.log('Error: Product with this name already exists');
        return;
      }

      console.log('Product created successfully');
    } catch (error) {
      console.log('Error creating product: ', error);
    }
  }
);

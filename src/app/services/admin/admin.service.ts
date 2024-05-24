import { Injectable } from '@angular/core';
import { NotificationService } from '../toastr/notification.service';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private toastr: NotificationService,
    private fireStore: Firestore
  ) {}

  collectionInstance = collection(this.fireStore, 'products');

  getProducts() {
    return collectionData(this.collectionInstance, { idField: 'id' }).pipe(
      map((actions) => {
        return actions;
      })
    );
  }
}

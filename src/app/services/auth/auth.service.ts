import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, collection, getDoc } from '@angular/fire/firestore';
import { from, switchMap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireStore: Firestore,
    private fireAuth: Auth,
    public jwtHelper: JwtHelperService
  ) {}

  // returns user object from firestore and login response value
  async getUserLogInResponse(
    res: object,
    collectionName: string
  ): Promise<object> {
    try {
      const uid = (res as any).user.uid;
      // Created a document reference given the collection name and document id.
      // NOTE: that our way to determine a user in firestore is using
      //      its uid retrieve from firebase auth.
      const docRef = doc(this.fireStore, collectionName, uid);
      // Retrieves the document data.
      const docData = await getDoc(docRef);
      // Checks if docData returns 'undefined'.
      // We can use this as a temporary solution for when a customer logs in.
      // NOTE: the customer will have its own collection.
      // Here we are focused on the 'admin' collection, therefore if the uid is not
      // found in the documents
      // ,docData will return undefined thus returning an empty object
      if (!docData.exists()) {
        console.log('No such document!');
        return {};
      }
      const userObject = docData.data();
      const userEmail = userObject['email'];
      const isAdmin = userObject['isAdmin'];
      return { res, userEmail, isAdmin };
    } catch (error) {
      console.error('Error retrieving login response:', error);
      return {};
    }
  }

  // from() converts the returned Promise by
  // signInWithEmailAndPassword(this.fireAuth, email, password)
  // into an Observable so that we can apply an observable operator
  // switchMap to the value it emits through the pipe chain
  // the call function getLogInResponse tells the switchMap what emitted value
  // it needs to observe
  userLogin(email: string, password: string, role: string) {
    return from(
      signInWithEmailAndPassword(this.fireAuth, email, password)
    ).pipe(switchMap((res) => this.getUserLogInResponse(res, role)));
  }

  public decodeToken(token: string): any {
    return this.jwtHelper.decodeToken(token);
  }
}

import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Firestore,
  getDoc,
  collection,
  addDoc,
  collectionData,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { from, switchMap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

export const UserRoles = {
  admin: 'admin',
  customer: 'customer',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  email: string = '';
  password: string = '';

  constructor(
    private fireStore: Firestore,
    private fireAuth: Auth,
    private router: Router,
    public jwtHelper: JwtHelperService
  ) {}

  customerCollectionInstance = collection(this.fireStore, 'customer');

  getUserRole() {
    try {
      let userRole = '';
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        userRole = UserRoles.admin;
      } else {
        userRole = UserRoles.customer;
      }
      return userRole;
    } catch (error) {
      console.log('Error getting user role');
      return;
    }
  }

  getUserEmail() {
    try {
      return localStorage.getItem('userEmail');
    } catch (error) {
      console.log('Error getting using email');
      return;
    }
  }

  // this checks if userEmail inside the localStorage is
  // equal to the email decoded from the idToken
  isEmailValid(userEmail: string) {
    try {
      const token = localStorage.getItem('idToken');

      const tokenPayload = token ? this.decodeToken(token) : null;
      if (userEmail === tokenPayload.email) {
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error validating email');
      return false;
    }
  }

  isLoggedIn() {
    const token = localStorage.getItem('idToken');
    if (!token) {
      return false;
    } else {
      return true;
    }
  }

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

  // sign out
  logout(role: string) {
    this.fireAuth.signOut().then(
      () => {
        localStorage.clear();
        this.router.navigate([role + '/login']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  async checkIfDocumentExists(collection: string, docId: string) {
    try {
      const docRef = doc(this.fireStore, collection, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(
          `Document with ID ${docId} exists in collection ${collection}`
        );
        return true;
      } else {
        console.log(
          `Document with ID ${docId} does not exist in collection ${collection}`
        );
        return false;
      }
    } catch (error) {
      console.log('Error checking if document exists');
      return false;
    }
  }

  async addCustomerDocument(uid: string, customerObject: object) {
    try {
      await setDoc(doc(this.fireStore, 'customer', uid), customerObject);
      console.log('Successfully added user to firestore');
    } catch (error) {
      console.log('Error adding customer document', error);
    }
  }

  emailAndPasswordRegistration(email: string, password: string) {
    createUserWithEmailAndPassword(this.fireAuth, email, password)
      .then((res) => {
        this.addCustomerDocument(res.user.uid, {
          email: email,
          isAdmin: false,
        });
        console.log('Resgistration response', res);
        this.router.navigate(['customer/dashboard']);
        alert('Registration Successful');
      })
      .catch((err) => {
        alert('Register failed: ' + err.message);
        console.log('error register', err);
        this.router.navigate(['/register']);
      });
  }

  async googleSignIn() {
    return signInWithPopup(this.fireAuth, new GoogleAuthProvider())
      .then(async (res) => {
        console.log('response google');
        const ifDocExists = await this.checkIfDocumentExists(
          res.user.uid,
          'customer'
        );
        if (!ifDocExists) {
          this.addCustomerDocument(res.user.uid, {
            email: res.user.email ?? '',
            isAdmin: false,
          });
        }
        console.log('resposod', res);
        const tokenId = res.user?.getIdToken();
        localStorage.setItem('idToken', await tokenId);
        localStorage.setItem('userEmail', res.user.email ?? '');
        localStorage.setItem('isAdmin', 'false');
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}

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
import { from, switchMap, Observable } from 'rxjs';
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

  // checks if there is a logged in user
  isLoggedIn() {
    const token = localStorage.getItem('idToken');
    if (!token) {
      return false;
    } else {
      return true;
    }
  }

  // This function retrieves the login response for a user.
  getUserLogInResponse(
    res: object, // The response object from the login request.
    collectionName: string // The name of the Firestore collection where user data is stored.
  ): Observable<object> {
    // The function returns an Observable that emits the login response.
    // The from function is used to convert the Promise returned by the async function into an Observable.
    return from(
      (async () => {
        try {
          // Extract the user's UID from the response object.
          const uid = (res as any).user.uid;
          // Create a reference to the document in Firestore that corresponds to the user.
          const docRef = doc(this.fireStore, collectionName, uid);
          // Retrieve the document data.
          const docData = await getDoc(docRef);
          // If the document doesn't exist, log an error and return an empty object.
          if (!docData.exists()) {
            console.log('No such document!');
            return {};
          }
          // Extract the user data from the document.
          const userObject = docData.data();
          // Extract the user's email and admin status from the user data.
          const userEmail = userObject['email'];
          const isAdmin = userObject['isAdmin'];
          // Return the login response, which includes the original response object, the user's email, and the user's admin status.
          return { res, userEmail, isAdmin };
        } catch (error) {
          // If an error occurs, log it and return an empty object.
          console.error('Error retrieving login response:', error);
          return {};
        }
      })()
    );
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
        const tokenId = res.user?.getIdToken();
        localStorage.setItem('idToken', await tokenId);
        localStorage.setItem('userEmail', res.user.email ?? '');
        localStorage.setItem('isAdmin', 'false');
      })
      .catch((err) => {
        alert(err.message);
      });
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
}

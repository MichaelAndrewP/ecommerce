import { Component } from '@angular/core';
import { AuthService, UserRoles } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-customer-login',
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css'],
})
export class CustomerLoginComponent {
  private subscription: Subscription | undefined;
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.email == '') {
      alert('Please enter email');
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      return;
    }

    // Here we subscribe to the adminLogin function that returns an observable
    // (ergo, we can subscribe to it)
    // then it starts emitting values
    this.subscription = this.authService
      .userLogin(this.email, this.password, UserRoles.customer)
      .subscribe({
        next: (value: any) => {
          const isAdmin = value['isAdmin'];
          if (isAdmin || Object.keys(value).length === 0) {
            alert('Not a customer account!');
            this.router.navigate(['customer/login']);
          } else {
            const res = value['res'];
            const tokenResponse = res['_tokenResponse'];
            const userEmail = value['userEmail'];
            localStorage.setItem('idToken', tokenResponse['idToken']);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('isAdmin', isAdmin);
            this.router.navigate(['customer/dashboard']);
          }
        },
        error: (err: string) => {
          alert('Error logging in: ' + err);
          this.router.navigate(['customer/login']);
        },
      });

    this.email = '';
    this.password = '';
  }

  signInWithGoogle() {
    from(this.authService.googleSignIn()).subscribe({
      next: () => {
        this.router.navigate(['customer/dashboard']);
      },
    });
  }

  ngOnInit() {
    /* console.log('isloggedin', this.authService.isLoggedIn()); */
    if (this.authService.isLoggedIn()) {
      if (localStorage.getItem('isAdmin') === 'true') {
        this.router.navigate(['admin/dashboard']);
      } else this.router.navigate(['customer/dashboard']);
    } else {
      this.router.navigate(['customer/login']);
    }
  }

  // To ensure that the subscription is cleaned up when the component is destroyed.
  // Preventing memory leaks
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

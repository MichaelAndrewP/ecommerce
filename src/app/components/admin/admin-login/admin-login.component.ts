import { Component } from '@angular/core';
import { AuthService, UserRoles } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  private subscription: Subscription | undefined;
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Check if email and password fields are not empty
    if (this.email == '') {
      alert('Please enter email');
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      return;
    }

    // Subscribe to the userLogin function from AuthService
    // This function is expected to return an Observable
    this.subscription = this.authService
      .userLogin(this.email, this.password, UserRoles.admin)
      .subscribe({
        next: (value: any) => {
          // Check if the user is an admin and if the returned value is not empty
          const isAdmin = value['isAdmin'];
          if (!isAdmin || Object.keys(value).length === 0) {
            alert('Not an admin account!');
            this.router.navigate(['admin/login']);
          } else {
            // If the user is an admin, store the token, email, and admin status in localStorage
            const res = value['res'];
            const tokenResponse = res['_tokenResponse'];
            const userEmail = value['userEmail'];
            localStorage.setItem('idToken', tokenResponse['idToken']);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('isAdmin', isAdmin);
            // Navigate to the admin dashboard
            this.router.navigate(['admin/dashboard']);
          }
        },
        error: (err: string) => {
          // Handle any errors that occur during login
          alert('Error logging in: ' + err);
          this.router.navigate(['admin/login']);
        },
      });

    // Clear the email and password fields
    this.email = '';
    this.password = '';
  }

  // Unsubscribe from the AuthService observable when the component is destroyed to prevent memory leaks
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

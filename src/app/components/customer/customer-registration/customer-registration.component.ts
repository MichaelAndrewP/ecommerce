import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
  selector: 'app-customer-registration',
  templateUrl: './customer-registration.component.html',
  styleUrls: ['./customer-registration.component.css'],
})
export class CustomerRegistrationComponent {
  email: string = '';
  password: string = '';
  constructor(private fireAuth: Auth, private authService: AuthService) {}

  onSubmit() {
    if (this.email == '') {
      alert('Please enter email');
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      return;
    }

    this.authService.emailAndPasswordRegistration(this.email, this.password);

    this.email = '';
    this.password = '';
  }
}

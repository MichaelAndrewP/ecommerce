import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
})
export class CustomerDashboardComponent {
  userId = this.authService.getUserId();
  products = this.customerService.getListedProducts();
  cartItems = this.customerService.getCustomerCartItems(this.userId);
  cartQuantity: number = 0;

  constructor(
    private authService: AuthService,
    private customerService: CustomerService
  ) {}

  countCartProducts() {
    this.cartItems.subscribe((items: any) => {
      this.cartQuantity = items.length;
    });
  }

  addToCart(product: any) {
    const userId = this.authService.getUserId();
    return this.customerService.addToCustomerCart(product, userId);
  }

  logout() {
    this.authService.logout('customer');
  }

  ngOnInit() {
    this.countCartProducts();
  }
}

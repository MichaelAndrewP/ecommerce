import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { map, take, switchMap } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
})
export class CustomerDashboardComponent {
  cartDialogRef: MatDialogRef<CartComponent> | undefined;

  userId = this.authService.getUserId();
  products = this.customerService.getListedProducts();
  cartItems = this.customerService.getCustomerCartItems(this.userId);
  uniqueItems = new Set();
  cartQuantity: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  countCartProducts() {
    const sub = this.cartItems
      .pipe(
        map((products) => {
          const uniqueProducts = new Set(
            products.filter(
              (product, index, self) =>
                index ===
                self
                  .map((mapProduct) => mapProduct['name'])
                  .indexOf(product['name'])
            )
          );
          this.uniqueItems = uniqueProducts;
          this.cartQuantity = uniqueProducts.size;
        })
      )
      .subscribe();
    this.subscriptions.push(sub);
  }

  /*  isExistingInCart(productId: string): boolean {
    let isExisting = true;

    return isExisting;
  }
 */
  /*   isExistingInCart(productId: string): boolean {
    let existingArray: any[] = [];
    const sub = this.cartItems
      .pipe(
        map((products) => {
          products.map((product) => {
            if (product['id'] == productId) {
              existingArray.push(product);
            }
          });
        })
      )
      .subscribe();
    this.subscriptions.push(sub);
    if (existingArray.length > 0) {
      return true;
    }
    return false;
  } */

  addToCart(product: any) {
    const userId = this.authService.getUserId();
    return this.customerService.addToCustomerCart(product, userId);
  }

  openCartDialog() {
    if (!this.dialog.openDialogs.length) {
      const uniqueItems$ = of(this.uniqueItems);
      this.cartDialogRef = this.dialog.open(CartComponent, {
        data: {
          close: this.closeDialog.bind(this),
          customerCartItems: this.cartItems,
          uniqueItems: uniqueItems$,
          customerId: this.userId,
        },
      });
    }
  }

  closeDialog() {
    this.cartDialogRef?.close();
  }

  logout() {
    this.authService.logout('customer');
  }

  ngOnInit() {
    this.countCartProducts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { map, take, switchMap, takeUntil } from 'rxjs/operators';
import { Subscription, of, Subject, Observable, combineLatest } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CartComponent } from '../cart/cart.component';
import { NotificationService } from 'src/app/services/toastr/notification.service';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
})
export class CustomerDashboardComponent {
  private unsubscribe$ = new Subject<void>();
  productsWithCartStatus$: Observable<any> | undefined;

  cartDialogRef: MatDialogRef<CartComponent> | undefined;

  userId = this.authService.getUserId();
  products$ = this.customerService.getListedProducts();
  cartItems$ = this.customerService.getCustomerCartItems(this.userId);
  uniqueItems = new Set();
  cartQuantity: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private toastr: NotificationService
  ) {}

  countCartProducts() {
    const sub = this.cartItems$
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

  // Simpler version without making use of combineLatest
  /*   async isExistingInCart(cartProductId: string) {
    try {
      await this.customerService.isProductExistingInCart(
        cartProductId,
        this.userId
      );
    } catch (error) {
      console.log('Error checking if product exists in cart', error);
    }
  } */

  async addToCart(product: any) {
    try {
      const isExisting = await this.customerService.isProductExistingInCart(
        product.id,
        this.userId
      );
      if (isExisting) {
        this.toastr.showError('Error', 'Product already exists in cart');
        return;
      }
      const userId = this.authService.getUserId();
      this.toastr.showSuccess('Success', 'Product added to cart');
      return this.customerService.addToCustomerCart(product, userId);
    } catch (error) {
      console.log('Error adding to cart', error);
      return;
    }
  }

  openCartDialog() {
    if (!this.dialog.openDialogs.length) {
      const uniqueItems$ = of(this.uniqueItems);
      this.cartDialogRef = this.dialog.open(CartComponent, {
        data: {
          close: this.closeDialog.bind(this),
          customerCartItems: this.cartItems$,
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
    this.productsWithCartStatus$ = combineLatest([
      this.customerService.getListedProducts(),
      this.customerService.getCustomerCartItems(this.userId),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(
        map(([products, cartItems]) => {
          return products.map((product) => {
            const cartItem = cartItems.find(
              (item) => item['id'] === product['id']
            );
            return {
              ...product,
              isInCart: !!cartItem,
            };
          });
        })
      );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

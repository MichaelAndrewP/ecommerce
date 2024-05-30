import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable, takeUntil, Subject } from 'rxjs';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { NotificationService } from 'src/app/services/toastr/notification.service';

export interface CartItem {
  name: string;
  image: string;
  addedAt: Date;
  currency: string;
  id: string;
  price: number;
  quantity: number;
  rowTotal: number;
  cartQuantity: number;
}
/* 
const ELEMENT_DATA: CartItem[] = [
  { name: 'Product 1', price: 100, quantity: 1, total: 100 },
  { name: 'Product 2', price: 200, quantity: 1, total: 200 },
  { name: 'Product 3', price: 300, quantity: 1, total: 300 },
  { name: 'Product 1', price: 100, quantity: 1, total: 100 },
  { name: 'Product 2', price: 200, quantity: 1, total: 200 },
  { name: 'Product 3', price: 300, quantity: 1, total: 300 },
  { name: 'Product 1', price: 100, quantity: 1, total: 100 },
  { name: 'Product 2', price: 200, quantity: 1, total: 200 },
  { name: 'Product 3', price: 300, quantity: 1, total: 300 },
  { name: 'Product 3', price: 300, quantity: 1, total: 300 },
  { name: 'Product 1', price: 100, quantity: 1, total: 100 },
  { name: 'Product 2', price: 200, quantity: 1, total: 200 },
  { name: 'Product 3', price: 300, quantity: 1, total: 300 },
]; */

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  totalProgressSpinner: boolean = false;
  totalAmount: number = 0;
  customerId: string = this.data.customerId;
  allCartItems: Observable<any> = this.data.customerCartItems;
  /* uniqueItems: Observable<any> = this.data.uniqueItems; */
  displayedColumns: string[] = ['name', 'price', 'quantity', 'total'];
  dataSource = this.customerService.getCustomerCartItems(this.customerId);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matTableModule: MatTableModule,
    private customerService: CustomerService,
    private toastr: NotificationService /* ,
    public matTableDataSource: MatTableDataSource<CartItem> */
  ) {}

  calculateTotal() {
    try {
      this.dataSource.subscribe((cartItems) => {
        this.totalAmount = 0;
        cartItems.forEach((item: any) => {
          this.totalAmount += item.rowTotal;
        });
      });
    } catch (error) {
      console.log('Error calculating total', error);
    } finally {
      this.totalProgressSpinner = false;
    }
  }

  async changeCartItemQuantity(
    event: Event,
    productId: string,
    currentItemPrice: string
  ) {
    const newQuantity =
      parseInt((event.target as HTMLInputElement)?.value) || 0;
    const parsedCurrentItemPrice = parseInt(currentItemPrice) || 0;
    this.totalProgressSpinner = true;
    this.totalAmount = 0;
    try {
      await this.customerService
        .changeCartQuantity(newQuantity, productId, this.customerId)
        .then(async () => {
          await this.customerService.changeRowTotal(
            parsedCurrentItemPrice,
            newQuantity,
            productId,
            this.customerId
          );
        })
        .then(async () => {
          this.calculateTotal();
        });
    } catch (error) {
      this.toastr.showError('Error', 'Quantity not increased');
    } finally {
      this.totalProgressSpinner = false;
    }
  }

  ngOnInit() {
    this.calculateTotal();
    console.log('Hi');
    console.log('Cart items', this.data.cartItems);
    console.log('Unique items', this.data.uniqueItems);
    console.log('Type of Unique Items', typeof this.data.uniqueItems);
  }

  close() {
    this.data.close();
  }
}

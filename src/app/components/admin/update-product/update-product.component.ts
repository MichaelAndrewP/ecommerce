import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin/admin.service';
import { NotificationService } from 'src/app/services/toastr/notification.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
})
export class UpdateProductComponent {
  id: string = this.data.id;
  name: string = this.data.name;
  price: number = this.data.price;
  quantity: number = this.data.quantity;
  description: string = this.data.description;
  currency: string = this.data.currency;
  imageUrl: string = this.data.imageUrl;
  oldImageUrl: string = this.data.imageUrl;
  toEdit: string = this.data.toEdit;
  eventUpdate: any = null;

  constructor(
    private adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: NotificationService
  ) {}

  uploadFile(event: Event) {
    this.eventUpdate = event;
    this.adminService.uploadImageFile(event).subscribe((url: string) => {
      this.imageUrl = url;
    });
  }

  close() {
    this.data.close();
  }
  onSubmit() {
    if (this.toEdit === 'name') {
      this.adminService.updateProductName(this.id, this.name);
    } else if (this.toEdit === 'price') {
      this.adminService.updateProductPrice(this.id, this.price);
    } else if (this.toEdit === 'quantity') {
      this.adminService.updateProductQuantity(this.id, this.quantity);
    } else if (this.toEdit === 'description') {
      this.adminService.updateProductDescription(this.id, this.description);
    } else if (this.toEdit === 'currency') {
      this.adminService.updateProductCurrency(this.id, this.currency);
    } else if (this.toEdit === 'imageUrl') {
      this.adminService.updateProductImageUrl(
        this.id,
        this.imageUrl,
        this.eventUpdate,
        this.oldImageUrl
      );
    } else {
      console.log('Error updating product');
      this.toastr.showError('Error!', 'Error updating product');
    }
    this.close();
  }
}

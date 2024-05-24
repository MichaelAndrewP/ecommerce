import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(topMsg: string, botMsg: string) {
    this.toastr.success(botMsg, topMsg, {
      timeOut: 3000,
      tapToDismiss: true,
    });
  }

  showError(topMsg: string, botMsg: string) {
    this.toastr.error(botMsg, topMsg, {
      timeOut: 3000,
      tapToDismiss: true,
    });
  }
}

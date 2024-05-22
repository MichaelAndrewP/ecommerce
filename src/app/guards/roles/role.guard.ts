import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let userRole = '';
    const expectedRole = next.data['role'];
    const token = localStorage.getItem('idToken');

    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      userRole = 'admin';
    } else {
      userRole = 'customer';
    }
    const userEmail = localStorage.getItem('userEmail');
    const navigateRout = expectedRole + '/login';
    if (!token || !userEmail) {
      this.router.navigate([navigateRout]);
      return false;
    }

    const tokenPayload = this.authService.decodeToken(token);
    if (expectedRole === userRole && tokenPayload.email === userEmail) {
      return true;
    }

    this.router.navigate(['unauthorized']);
    return false;
  }
}

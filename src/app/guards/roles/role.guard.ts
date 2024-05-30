import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRoles } from 'src/app/services/auth/auth.service';

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
    const expectedRole = next.data['role'];
    const navigateLoginRoute = expectedRole + '/login';
    const navigateDashboardRoute = expectedRole + '/dashboard';

    if (!this.authService.isLoggedIn()) {
      this.router.navigate([navigateLoginRoute]);
      return false;
    }

    try {
      const userRole = this.authService.getUserRole();
      const userEmail = this.authService.getUserEmail() ?? '';
      console.log('userRole', userRole);
      console.log('Expected', expectedRole);
      console.log('userEmail', userEmail);
      console.log('emailValie', this.authService.isEmailValid(userEmail));
      if (
        expectedRole === userRole &&
        this.authService.isEmailValid(userEmail) /* ||
        (expectedRole !== userRole && this.authService.isEmailValid(userEmail)) */
      ) {
        return true;
      }

      if (
        expectedRole !== userRole &&
        this.authService.isEmailValid(userEmail)
      ) {
        const navigateTo = `${userRole}/dashboard`;
        this.router.navigate([navigateTo]);
        return true;
      }
    } catch (error) {
      console.error('Error decoding token', error);
    }

    console.log('Unauthorized access');
    this.router.navigate(['unauthorized']);
    return false;
  }
}

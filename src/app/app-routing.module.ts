import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
// landing page component
import { LandingComponent } from './components/landing/landing.component';
// admin components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
// customer components
import { CustomerDashboardComponent } from './components/customer/customer-dashboard/customer-dashboard.component';
import { CustomerLoginComponent } from './components/customer/customer-login/customer-login.component';
import { CustomerRegistrationComponent } from './components/customer/customer-registration/customer-registration.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized/unauthorized.component';
// role guard
import { RoleGuard } from './guards/roles/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: 'admin' },
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    /* canActivate: [RoleGuard],
    data: { role: 'admin' }, */
  },
  {
    path: 'customer/dashboard',
    component: CustomerDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: 'customer' },
  },
  {
    path: 'customer/login',
    component: CustomerLoginComponent,
    data: { role: 'customer' }, */
  },
  { path: 'customer/registration', component: CustomerRegistrationComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: 'landing' },
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

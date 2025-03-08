import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { HomeComponent } from './home/home.component';
import { UserEmissionsComponent } from './user-emissions/user-emissions.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { UsersManagerComponent } from './users-manager/users-manager.component';
import { UserPaymentComponent } from './user-payment/user-payment.component';
import { CartComponent } from './cart/cart.component';
import { AuthGuard } from './auth.guard';
import { UserPurchasesComponent } from './user-purchases/user-purchases.component';
import { UserSalesComponent } from './user-sales/user-sales.component';
import { UserDetailsComponent } from './user-details/user-details.component';
const routes: Routes = [
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'user-emissions', component: UserEmissionsComponent, canActivate: [AuthGuard] },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'marketplace/project/:id', component: ProjectDetailsComponent },
  { path: 'user-menu', component: UserMenuComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'users-manager', component: UsersManagerComponent, canActivate: [AuthGuard] },
  { path: 'user-payment', component: UserPaymentComponent },
  { path: 'cart', component: CartComponent },
  { path: 'purchases', component: UserPurchasesComponent },
  { path: 'sales', component: UserSalesComponent },
  { path: 'users-manager/user-details/:id', component: UserDetailsComponent,},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

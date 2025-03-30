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
import { ProjectManagerComponent } from './project-manager/project-manager.component';
import { ProjectManagerUserComponent } from './project-manager-user/project-manager-user.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { ProjectAddComponent } from './project-add/project-add.component';
import { ProjectManagerDetailsComponent } from './project-manager-details/project-manager-details.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { ProjectManagerDetailsAdminComponent } from './project-manager-details-admin/project-manager-details-admin.component';
import { AdminTransactionsComponent } from './admin-transactions/admin-transactions.component'
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { SupportManagerAdminComponent } from './support-manager-admin/support-manager-admin.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { UserSupportComponent } from './user-support/user-support.component';
import { UserReportsComponent } from './user-reports/user-reports.component';
import { RequestReportComponent } from './request-report/request-report.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
/*import { EditProjectComponent } from './edit-project/edit-project.component';*/

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
  { path: 'project-manager', component: ProjectManagerComponent },
  { path: 'Account-project-manager/addProject', component: ProjectAddComponent },
  { path: 'Account-project-manager/:id', component: ProjectManagerDetailsComponent },
  { path: 'project-manager/:id', component: ProjectManagerDetailsAdminComponent, canActivate: [AuthGuard] },
  { path: 'Account-project-manager', component: ProjectManagerUserComponent, canActivate: [AuthGuard] },
  { path: 'sales', component: UserSalesComponent },
  { path: 'users-manager/user-details/:id', component: UserDetailsComponent, },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'transaction-details/:id', component: TransactionDetailsComponent },
  { path: 'admin-transactions', component: AdminTransactionsComponent },
  { path: 'settings', component: UserSettingsComponent },
  { path: 'support-manager', component: SupportManagerAdminComponent,canActivate: [AuthGuard]  },
  { path: 'support-manager/:id', component: SupportChatComponent,canActivate: [AuthGuard]  },
  { path: 'user-support', component: UserSupportComponent },
  { path: 'user-reports', component: UserReportsComponent },
  { path: 'request-report', component: RequestReportComponent },
  { path: 'admin-reports', component: AdminReportsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

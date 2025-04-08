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
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { UsersManagerComponent } from './users-manager/users-manager.component';
import { CartComponent } from './cart/cart.component';
import { AuthGuard } from './auth.guard';
import { PermissionGuard } from './permission-guard.guard';
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
import { SupportChatComponent } from './support-chat/support-chat.component';
import { UserSupportComponent } from './user-support/user-support.component';
import { UserReportsComponent } from './user-reports/user-reports.component';
import { RequestReportComponent } from './request-report/request-report.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
import { TicketManagerComponent } from './ticket-manager/ticket-manager.component';
import { UnauthorizedPageComponent } from './unauthorized-page/unauthorized-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { ValidParamGuard } from './valid-param-guard.guard';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

enum AccountType {
  User,
  Admin,
  Evaluator,
  Support
}

const routes: Routes = [
  // Rotas públicas
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'marketplace/project/:id', component: ProjectDetailsComponent, canActivate: [ValidParamGuard] },
  { path: 'terms', component: TermsAndConditionsComponent },

  //Rotas de utilizador autenticado
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'settings', component: UserSettingsComponent, canActivate: [AuthGuard]},

  //Rotas de utilizador comum
  { path: 'user-emissions', component: UserEmissionsComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'purchases', component: UserPurchasesComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'Account-project-manager/addProject', component: ProjectAddComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'Account-project-manager/:id', component: ProjectManagerDetailsComponent, canActivate: [AuthGuard, PermissionGuard, ValidParamGuard], data: { requiredRole: AccountType.User } },
  { path: 'payment-success/:type', component: PaymentSuccessComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'sales', component: UserSalesComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'user-support', component: UserSupportComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'user-reports', component: UserReportsComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'request-report', component: RequestReportComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.User } },
  { path: 'transaction-details/:id', component: TransactionDetailsComponent, canActivate: [AuthGuard, PermissionGuard, ValidParamGuard], data: { requiredRole: [AccountType.User, AccountType.Admin] } }, // Permissão para Admins também

  //Rotas de utilizador administrador
  { path: 'users-manager', component: UsersManagerComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.Admin } },
  { path: 'project-manager', component: ProjectManagerComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.Admin } },
  { path: 'project-manager/:id', component: ProjectManagerDetailsAdminComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.Admin } },
  { path: 'Account-project-manager', component: ProjectManagerUserComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.Admin } },
  { path: 'users-manager/user-details/:id', component: UserDetailsComponent, canActivate: [AuthGuard, PermissionGuard, ValidParamGuard], data: { requiredRole: AccountType.Admin } },
  { path: 'admin-transactions', component: AdminTransactionsComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: AccountType.Admin } },

  //Rotas de utilizador de suporte
  { path: 'support-manager', component: TicketManagerComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: [AccountType.Support, AccountType.Admin] } },
  { path: 'support-manager/:id', component: SupportChatComponent, canActivate: [AuthGuard, PermissionGuard, ValidParamGuard], data: { requiredRole: [AccountType.Support, AccountType.Admin] } },

  //Rotas de utilizador avaliador
  { path: 'admin-reports', component: AdminReportsComponent, canActivate: [AuthGuard, PermissionGuard], data: { requiredRole: [AccountType.Evaluator, AccountType.Admin] } },

  // Rotas de estados
  { path: 'Unauthorized', component: UnauthorizedPageComponent },
  { path: 'NotFound', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

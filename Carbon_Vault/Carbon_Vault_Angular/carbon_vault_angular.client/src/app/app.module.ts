import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { UserEmissionsComponent } from './user-emissions/user-emissions.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { ProjectCardComponent } from './projectCard/projectCard.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { AlertsComponent } from './alerts/alerts.component';
import { UsersManagerComponent } from './users-manager/users-manager.component';
import { MarketPlaceNavigationComponent } from './market-place-navigation/market-place-navigation.component';
import { UserPaymentComponent } from './user-payment/user-payment.component';
import { CartComponent } from './cart/cart.component';
import { UserPurchasesComponent } from './user-purchases/user-purchases.component';
import { UserSalesComponent } from './user-sales/user-sales.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ProjectManagerComponent } from './project-manager/project-manager.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { ProjectManagerUserComponent } from './project-manager-user/project-manager-user.component';
import { ProjectAddComponent } from './project-add/project-add.component';
import { ProjectManagerDetailsComponent } from './project-manager-details/project-manager-details.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { ProjectManagerDetailsAdminComponent } from './project-manager-details-admin/project-manager-details-admin.component';
import { AdminTransactionsComponent } from './admin-transactions/admin-transactions.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserSupportComponent } from './user-support/user-support.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    RecoverPasswordComponent,
    ForgotPasswordComponent,
    UserEmissionsComponent,
    MarketplaceComponent,
    ProjectCardComponent,
    UserMenuComponent,
    AdminDashboardComponent,
    AdminMenuComponent,
    ProjectDetailsComponent,
    AlertsComponent,
    UsersManagerComponent,
    MarketPlaceNavigationComponent,
    UserPaymentComponent,
    CartComponent,
    UserPurchasesComponent,
    UserSalesComponent,
    UserDetailsComponent,
    ProjectManagerComponent,
    PaymentSuccessComponent,
    ProjectManagerUserComponent,
    ProjectAddComponent,
    ProjectManagerDetailsComponent,
    ProjectManagerDetailsAdminComponent,
    AdminTransactionsComponent,
    TransactionDetailsComponent,
    UserSettingsComponent,
    UserSupportComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    BreadcrumbComponent,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('token')
      }
    })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }

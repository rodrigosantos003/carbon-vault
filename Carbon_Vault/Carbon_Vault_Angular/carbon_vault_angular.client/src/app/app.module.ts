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
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';  // Import JwtHelperService
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
import { UserPurchasesComponent } from './user-purchases/user-purchases.component';
import { UserSalesComponent } from './user-sales/user-sales.component';

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
    UserPurchasesComponent,
    UserSalesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
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

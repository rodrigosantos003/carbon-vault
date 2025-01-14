import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmAccountComponent } from './confirm-account/confirm-account.component';

const routes: Routes = [
  { path: 'confirm-account', component: ConfirmAccountComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Other routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

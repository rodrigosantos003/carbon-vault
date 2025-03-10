import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-admin-menu',
  standalone: false,

  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {
  constructor(private authService: AuthService) { }
  onLogout() {
    this.authService.logout();
  }
}

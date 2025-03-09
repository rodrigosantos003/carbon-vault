import { Component } from '@angular/core';

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent {
  showError(message: string) {
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    
    if (errorPopup && errorMessage) {
      errorMessage.textContent = message;
      errorPopup.style.display = 'block';
    }
  }
}

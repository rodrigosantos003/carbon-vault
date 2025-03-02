import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  closePopup() {
    document.querySelectorAll('.close-icon').forEach(closeIcon => {
      closeIcon.addEventListener('click', () => {
        const popup = closeIcon.closest('.popup');
        if (popup instanceof HTMLElement) {
          popup.style.display = 'none';
        }
      });
    });
  }

  enableLoading(newText: string) {
    const loadingButton = document.getElementById('loading');
    if (loadingButton) {
      const textSpan = loadingButton.querySelector('#loading-text');
      if (textSpan) {
        textSpan.textContent = newText;
      }
      loadingButton.style.display = 'inline-flex';
    }
  }

  disableLoading() {
    const loadingButton = document.getElementById('loading');
    if (loadingButton) {
      loadingButton.style.display = 'none';
    }
  }
}

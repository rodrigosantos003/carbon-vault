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

  enableSuccess(message: string, enableTime: number = 3) {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
      const textSpan = successPopup.querySelector('#success-message');
      if (textSpan) {
        textSpan.textContent = message;
      }
      successPopup.style.display = 'inline-flex';

      setTimeout(() => {
        this.disableSuccess();
      }, enableTime);
    }
  }

  private disableSuccess() {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
      successPopup.style.display = 'none';
    }
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


  enableError(message: string, enableTime: number = 3) {
    const errorPopup = document.getElementById('error-popup');
    if (errorPopup) {
      const textSpan = errorPopup.querySelector('#error-message');
      if (textSpan) {
        textSpan.textContent = message;
      }
      errorPopup.style.display = 'inline-flex';

      setTimeout(() => {
        this.disableError();
      }, enableTime*1000);
    }
  }

  private disableError() {
    const errorPopup = document.getElementById('error-popup');
    if (errorPopup) {
      errorPopup.style.display = 'none';
    }
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  /**
   * Associa eventos de clique aos ícones de fechar (`.close-icon`) para
   * permitir que o utilizador feche pop-ups manualmente.
   *
   */
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

  /**
   * Ativa um pop-up de sucesso com uma mensagem personalizada durante um determinado tempo.
   *
   * @param {string} message - Mensagem de sucesso a mostrar.
   * @param {number} [enableTime=6] - Tempo (em segundos) que o pop-up deve permanecer visível.
   */
  enableSuccess(message: string, enableTime: number = 6) {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
      const textSpan = successPopup.querySelector('#success-message');
      if (textSpan) {
        textSpan.textContent = message;
      }
      successPopup.style.display = 'inline-flex';

      setTimeout(() => {
        this.disableSuccess();
      }, enableTime * 1000);
    }
  }

  /**
   * Oculta o pop-up de sucesso.
   *
   * @private
   */
  private disableSuccess() {
    const successPopup = document.getElementById('success-popup');
    if (successPopup) {
      successPopup.style.display = 'none';
    }
  }

  /**
   * Ativa o botão ou indicador de carregamento com texto personalizado.
   *
   * @param {string} newText - Texto a apresentar durante o carregamento.
   */
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

  /**
   * Oculta o botão ou indicador de carregamento.
   *
   */
  disableLoading() {
    const loadingButton = document.getElementById('loading');
    if (loadingButton) {
      loadingButton.style.display = 'none';
    }
  }

  /**
   * Ativa um pop-up de erro com uma mensagem personalizada durante um determinado tempo.
   *
   * @param {string} message - Mensagem de erro a mostrar.
   * @param {number} [enableTime=3] - Tempo (em segundos) que o pop-up deve permanecer visível.
   */
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
      }, enableTime * 1000);
    }
  }

  /**
   * Oculta o pop-up de erro.
   *
   * @private
   */
  private disableError() {
    const errorPopup = document.getElementById('error-popup');
    if (errorPopup) {
      errorPopup.style.display = 'none';
    }
  }

  /**
   * Ativa um pop-up de informação com uma mensagem personalizada durante um determinado tempo.
   *
   * @param {string} message - Mensagem informativa a mostrar.
   * @param {number} [enableTime=3] - Tempo (em segundos) que o pop-up deve permanecer visível.
   */
  enableInfo(message: string, enableTime: number = 3) {
    const infoPopup = document.getElementById('info-popup');
    if (infoPopup) {
      const textSpan = infoPopup.querySelector('#info-message');
      if (textSpan) {
        textSpan.textContent = message;
      }
      infoPopup.style.display = 'inline-flex';

      setTimeout(() => {
        this.disableInfo();
      }, enableTime * 1000);
    }
  }

  /**
   * Oculta o pop-up de informação.
   *
   * @private
   */
  private disableInfo() {
    const infoPopup = document.getElementById('info-popup');
    if (infoPopup) {
      infoPopup.style.display = 'none';
    }
  }
}

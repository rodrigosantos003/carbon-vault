import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-settings',
  standalone: false,

  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent {
  settingsForm: FormGroup;
  editMode = false;
  userId: string;
  _validator: IbanValidator = new IbanValidator();

  // IBANS de Teste:
  // ✅ PT50000201231234567890154
  // ❌ ES7921000813610123456789
  // ❌ PT50000201231234567890150

  /**
   * Construtor do componente.
   * Inicializa o formulário com os campos necessários e obtém o ID do utilizador.
   *
   * @param fb Serviço de FormBuilder para criar o formulário.
   * @param http Serviço HTTP para comunicação com a API.
   * @param authService Serviço de autenticação para obter o ID do utilizador.
   * @param alerts Serviço de alertas para mostrar mensagens de sucesso ou erro.
   * @param router Serviço de navegação para redirecionar o utilizador.
   */
  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private alerts: AlertsService, private router: Router) {

    this.settingsForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      nif: ['', [Validators.required]],
      iban: ['', [Validators.required]],
      password: [''],
      role: [0],

    });

    this.userId = this.authService.getUserId();
  }

  /**
   * Método do ciclo de vida do Angular, chamado quando o componente é inicializado.
   * Obtém as informações do utilizador e as preenche no formulário.
   */
  ngOnInit() {
    const url = `${environment.apiUrl}/Accounts/${this.userId}`;

    this.http.get<Account>(url, { headers: this.authService.getHeaders() }).subscribe({
      next: (data) => {
        this.settingsForm.setValue({
          name: data.name,
          email: data.email,
          nif: data.nif,
          password: data.password,
          iban: data.iban,
          role: data.role
        });
      },
      error: () => {
        this.alerts.enableError("Erro ao obter informações");
      }
    });
  }

  /**
   * Método chamado ao submeter o formulário de definições.
   * Valida o IBAN e envia as informações para atualização.
   */
  onSubmit() {
    this.alerts.enableLoading("A guardar informações");

    const formValue = this.settingsForm.value;

    const _iban = formValue.iban.trim();

    const isIbanValid = this._validator.validatePortugueseIBAN(_iban);

    if (isIbanValid || _iban == "") {
      const settingsData = {
        id: this.userId,
        name: formValue.name,
        email: formValue.email,
        nif: formValue.nif,
        iban: _iban,
        password: formValue.password,
        role: formValue.role
      };

      const url = `${environment.apiUrl}/Accounts/${this.userId}`;

      this.http.put(url, settingsData, { headers: this.authService.getHeaders() }).subscribe({
        next: () => {
          this.alerts.disableLoading();
          this.alerts.enableSuccess("Definições atualizadas com sucesso");
          window.location.reload();
        },
        error: () => {
          this.alerts.disableLoading();
          this.alerts.enableError("Erro ao atualizar definições");
        }
      })
    } else {
      this.alerts.disableLoading();
      this.alerts.enableError("IBAN não é válido, tente de novo..")
    }
  }

  /**
   * Método para eliminar a conta do utilizador.
   * Envia uma solicitação para eliminar a conta e efetua logout.
   */
  deleteAccount() {
    const deleteAccountURL = `${environment.apiUrl}/Accounts/${this.userId}`;

    this.http.delete(deleteAccountURL, { headers: this.authService.getHeaders() }).subscribe({
      next: () => {
        this.alerts.enableSuccess("Conta eliminada com sucesso");
        this.authService.logout();
      },
      error: () => {
        this.alerts.enableError("Erro ao eliminar conta");
      }
    })
  }

  /**
   * Método para alterar a password do utilizador.
   * Envia um link de confirmação para o e-mail do utilizador.
   */
  changePassword() {
    this.alerts.enableLoading("A enviar link de confirmação...");

    const changePasswordURL = `${environment.apiUrl}/Accounts/NewPassword?email=${this.settingsForm.value.email}`;

    this.http.get<{ message: string }>(changePasswordURL).subscribe({
      next: (response) => {
        if (response.message.includes("sucesso")) {
          this.alerts.disableLoading();
          this.alerts.enableSuccess("Link de alteração enviado para o seu e-mail")
        } else {
          this.alerts.disableLoading();
          this.alerts.enableError("E-mail inválido");
        }
      },
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao enviar link de alteração de palavra-passe");
      }
    })
  }

  /**
   * Método para abrir a janela de confirmação de eliminação de conta.
   */
  openDeleteAccount() {
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
   * Método para fechar a janela de confirmação de eliminação de conta.
   */
  closeDeleteAccount() {
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
}

/**
 * Interface que define a estrutura das informações de conta do utilizador.
 */
interface Account {
  id: number;
  name: string;
  email: string;
  password: string;
  nif: string;
  iban: string;
  role: number;
}

/**
 * Classe para validação de IBAN.
 * Contém métodos para validar IBANs portugueses e verificar o checksum.
 */
export class IbanValidator {

  public IbanValidator() { }

  /**
   * Valida um IBAN português.
   * Verifica o formato do IBAN e o checksum.
   *
   * @param iban O IBAN a ser validado.
   * @returns Verdadeiro se o IBAN for válido, falso caso contrário.
   */
  validatePortugueseIBAN(iban: string): boolean {
    iban = iban.replace(/\s+/g, '').toUpperCase();

    // Check length and country code
    if (!/^PT\d{23}$/.test(iban)) {
      return false;
    }

    return this.validateIBANChecksum(iban);
  }

  /**
   * Função para validar o checksum do IBAN.
   * Realiza uma operação de módulo 97 no número do IBAN.
   *
   * @param iban O IBAN a ser validado.
   * @returns Verdadeiro se o checksum for válido, falso caso contrário.
   */
  validateIBANChecksum(iban: string): boolean {
    const rearranged = iban.slice(4) + iban.slice(0, 4);

    const numericIBAN = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());

    let remainder = '';
    for (const char of numericIBAN) {
      remainder = (parseInt(remainder + char, 10) % 97).toString();
    }

    return parseInt(remainder, 10) === 1;
  }
}

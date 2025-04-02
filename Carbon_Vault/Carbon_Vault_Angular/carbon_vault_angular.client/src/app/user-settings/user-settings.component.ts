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

  ngOnInit() {
    const url = `${environment.apiUrl}/Accounts/${this.userId}`;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem("token")}` }

    this.http.get<Account>(url, { headers: headers }).subscribe({
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

  onSubmit() {
    this.alerts.enableLoading("A guardar informações...");

    const formValue = this.settingsForm.value;

    const _iban = formValue.iban.trim();

    const isIbanValid = this._validator.validatePortugueseIBAN(_iban);
    console.log(isIbanValid);

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
      const headers = { 'Authorization': `Bearer ${localStorage.getItem("token")}` }

      this.http.put(url, settingsData, { headers: headers }).subscribe({
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

  toggleEdit() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.onSubmit();
    }
  }

  deleteAccount() {
    const deleteAccountURL = `${environment.apiUrl}/Accounts/${this.userId}`;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem("token")}` }

    this.http.delete(deleteAccountURL, { headers: headers, params: { userID: this.userId } }).subscribe({
      next: () => {
        this.alerts.enableSuccess("Conta eliminada com sucesso");
        this.authService.logout();
      },
      error: () => {
        this.alerts.enableError("Erro ao eliminar conta");
      }
    })
  }

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

  openDeleteAccount() {
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closeDeleteAccount() {
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
}

interface Account {
  id: number;
  name: string;
  email: string;
  password: string;
  nif: string;
  iban: string;
  role: number;
}

export class IbanValidator {

  public IbanValidator() {

  }

  validatePortugueseIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  iban = iban.replace(/\s+/g, '').toUpperCase();

  // Check length and country code
  if (!/^PT\d{23}$/.test(iban)) {
    return false;
  }

  // IBAN checksum validation
  return this.validateIBANChecksum(iban);
}

  // Function to validate IBAN checksum
  validateIBANChecksum(iban: string): boolean {
    // Move the first four characters to the end
    const rearranged = iban.slice(4) + iban.slice(0, 4);

    // Convert letters to numbers (A = 10, B = 11, ..., Z = 35)
    const numericIBAN = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());

    // Perform modulo 97 operation
    let remainder = '';
    for (const char of numericIBAN) {
      remainder = (parseInt(remainder + char, 10) % 97).toString();
    }

    return parseInt(remainder, 10) === 1;
  }
}

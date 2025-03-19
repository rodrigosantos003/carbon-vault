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

  userId: string;

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private alerts: AlertsService, private router: Router) {

    this.settingsForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      nif: ['', [Validators.required]],
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

    const settingsData = {
      id: this.userId,
      name: formValue.name,
      email: formValue.email,
      nif: formValue.nif,
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
  role: number;
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  showTooltip = false;

  passwordLength = false;
  passwordUpperCase = false;
  passwordLowerCase = false;
  passwordSpecialChar = false;

  apiKey: string = 'e867f83dedbf7bac7e8e0bb616afc6ca';
  isNifValid: boolean | null = null;
  nifErrorMessage: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private alerts: AlertsService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      nif: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.showFormErrors();
      return;
    }

    this.alerts.enableLoading("A verificar os dados submetidos...");

    const formData = this.registerForm.value;
    console.log('Dados do formulário:', formData);

    if (!this.validatePassword(formData.password)) {
      return;
    }

    this.validateNif(formData.nif).then(isValid => {
      if (!isValid) {
        return;
      }

      this.http.post(`${environment.apiUrl}/Accounts`, formData).subscribe(
        (response: any) => {
          this.alerts.disableLoading();
          console.log('Registo bem-sucedido!', response);
          this.alerts.enableSuccess("Registro realizado com sucesso");
          window.location.href = "/login";
        },
        (error) => {
          this.alerts.disableLoading();
          console.error('Erro no registo!', error);
          this.alerts.enableError("Erro no registo. Verifique os dados e tente novamente.");
        }
      );
    });
  }

  showFormErrors() {
    const errors = this.registerForm.controls;

    if (errors['name']?.hasError('required')) {
      this.alerts.enableError("Campo obrigatório: Nome");
    } else if (errors['name']?.hasError('minlength')) {
      this.alerts.enableError("O nome deve ter pelo menos 3 caracteres.");
    }

    if (errors['email']?.hasError('required')) {
      this.alerts.enableError("Campo obrigatório: Email");
    } else if (errors['email']?.hasError('email')) {
      this.alerts.enableError("Formato de email inválido");
    }

    if (errors['password']?.hasError('required')) {
      this.alerts.enableError("Campo obrigatório: Senha");
    } else {
      this.validatePassword(this.registerForm.value.password);
    }

    if (errors['nif']?.hasError('required')) {
      this.alerts.enableError("Campo obrigatório: NIF");
    } else if (errors['nif']?.hasError('minlength') || errors['nif']?.hasError('maxlength')) {
      this.alerts.enableError("NIF inválido");
    }
  }

  validatePassword(password: string): boolean {
    if (!password) return false;

    let isValid = true;

    if (password.length < 8) {
      this.alerts.enableError("A senha deve ter pelo menos 8 caracteres");
      isValid = false;
    }

    if (!/[A-Z]/.test(password)) {
      this.alerts.enableError("A senha deve conter pelo menos uma letra maiúscula");
      isValid = false;
    }

    if (!/[a-z]/.test(password)) {
      this.alerts.enableError("A senha deve conter pelo menos uma letra minúscula");
      isValid = false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.alerts.enableError("A senha deve conter pelo menos um caractere especial");
      isValid = false;
    }

    return isValid;
  }
  updatePasswordStrength() {
    const password = this.registerForm.get('password')?.value || '';

    this.passwordLength = password.length >= 8;
    this.passwordUpperCase = /[A-Z]/.test(password);
    this.passwordLowerCase = /[a-z]/.test(password);
    this.passwordSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }
  async validateNif(nif: string): Promise<boolean> {
    const apiUrl = `${environment.apiUrl}/Accounts/ValidateNIF?nif=${nif}`;
    try {
      const response: any = await this.http.get(apiUrl).toPromise();
      console.log('Resposta da API:', response);
  
      if (response.result === 'error') {
        this.isNifValid = false;
        this.nifErrorMessage = response.message || 'Erro ao validar o NIF.';
        this.alerts.enableError("NIF inválido");
        return false;
      }
  
      this.isNifValid = response.valid;
      this.nifErrorMessage = this.isNifValid ? null : 'NIF inválido.';
  
      if (!this.isNifValid) {
        this.alerts.enableError("NIF inválido");
        return false;
      }
  
      return true; // Retorna true quando o NIF é válido
  
    } catch (error) {
      console.error('Erro ao chamar a API:', error);
      this.isNifValid = false;
      this.nifErrorMessage = 'Erro ao validar o NIF. Tente novamente mais tarde.';
      this.alerts.enableError("Erro ao validar o NIF. Tente novamente mais tarde.");
      return false;
    }
  }
  
}






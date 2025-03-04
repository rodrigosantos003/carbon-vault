import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';

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


  apiKey: string = 'e867f83dedbf7bac7e8e0bb616afc6ca'; // Chave da API
  isNifValid: boolean | null = null; // Estado da validação do NIF
  nifErrorMessage: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private alerts: AlertsService) {
    // Inicialização do FormGroup com controlos e validações
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required/*, Validators.email*/]],
      nif: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]]
    });
  }

  onSubmit() {
    if (true) {
      this.alerts.enableLoading("A verificar os dados submetidos..");

      const formData = this.registerForm.value;
      console.log('Dados do formulário:', formData);

      // Validação da password
      if (!this.validatePassword(formData.password)) {
        console.log('Senha inválida! A senha deve atender a todos os critérios.');
        alert("Senha inválida! A senha deve atender a todos os critérios.");
        return;
      }

      // Validação do NIF
      //this.validateNif(formData.nif).then(isValid => {
      //  if (isValid) {
      //    console.log('NIF válido! Prosseguindo com o registo...');
      //  } else {
      //    console.log('NIF inválido!');
      //    alert("NIF inválido!");
      //  }
      //});

      this.http.post("https://localhost:7117/api/Accounts", formData).subscribe(
        (response: any) => {
          this.alerts.disableLoading();
          console.log('Login successful!', response);
          alert("Registo bem sucedido!");
          window.location.href = "/login";
        },
        (error) => {
          this.alerts.disableLoading();
          console.error('Login failed!', error);
          alert("Registo Inválido!");
        }
      )
    } else {
      console.log('Formulário inválido!');
      alert("Dados em falta");
    }
  }

  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password); // Verifica se contém pelo menos uma letra maiúscula
    const hasLowerCase = /[a-z]/.test(password); // Verifica se contém pelo menos uma letra minúscula
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Verifica se contém pelo menos um caractere especial

    // Valida todos os critérios
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasSpecialChar
    );
  }

   updatePasswordStrength() {
    const password = this.registerForm.get('password')?.value || '';

    this.passwordLength = password.length >= 8;
    this.passwordUpperCase = /[A-Z]/.test(password);
    this.passwordLowerCase = /[a-z]/.test(password);
    this.passwordSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  async validateNif(nif: string): Promise<boolean> {
    const apiUrl = `https://localhost:7117/api/Accounts/ValidateNIF?nif=${nif}`;
    try {
      const response: any = await this.http.get(apiUrl).subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.error('Error fetching NIF details:', error);
        });
      console.log('Resposta da API:', response);

      if (response.result === 'error') {
        this.isNifValid = false;
        this.nifErrorMessage = response.message || 'Erro ao validar o NIF.';
        return false;
      }

      if (response.valid) {
        this.isNifValid = true;
        this.nifErrorMessage = null;
        return true;
      } else {
        this.isNifValid = false;
        this.nifErrorMessage = 'NIF inválido.';
        return false;
      }
    } catch (error) {
      console.error('Erro ao chamar a API:', error);
      this.isNifValid = false;
      this.nifErrorMessage = 'Erro ao validar o NIF. Tente novamente mais tarde.';
      return false;
    }
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';


@Component({
  selector: 'app-user-emissions',
  standalone: false,

  templateUrl: './user-emissions.component.html',
  styleUrl: './user-emissions.component.css'
})
export class UserEmissionsComponent {
  emissionsForm: FormGroup;

  totalEmissions: number = 0;

  userId: string;

  /**
   * Construtor do componente.
   *
   * @param fb FormBuilder para criar o formulário.
   * @param http Serviço HTTP para comunicação com a API.
   * @param authService Serviço de autenticação.
   * @param alerts Serviço de alertas para mensagens de sucesso ou erro.
   */
  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private alerts: AlertsService) {

    this.emissionsForm = this.fb.group({
      electricity: ['', [Validators.required]],
      petrol: ['', [Validators.required]],
      diesel: ['', [Validators.required]],
    });

    this.userId = this.authService.getUserId();
  }

  /**
   * Ciclo de vida do componente após inicialização.
   * 
   * Procura os dados de emissões do utilizador. Se não existirem, inicializa com zeros e cria novo registo.
   * Também calcula automaticamente as emissões totais ao alterar qualquer campo.
   */
  ngOnInit() {
    const url = `${environment.apiUrl}/UserEmissions/${this.userId}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
        this.emissionsForm.setValue({
          electricity: data.electricity,
          petrol: data.petrol,
          diesel: data.diesel
        });
      },
      error: (error) => {
        // Caso ocorra um erro, e o status seja 404, define os valores como 0
        if (error.status === 404) {
          this.emissionsForm.setValue({
            electricity: 0,
            petrol: 0,
            diesel: 0
          });
        }
        else {
          this.alerts.enableError("Erro ao obter emissões");
        }
      }
    });

    this.emissionsForm.valueChanges.subscribe(() => {
      ['electricity', 'petrol', 'diesel'].forEach(field => {
        const control = this.emissionsForm.get(field);
        if (control) {
          if (control.value < 0) {
            control.setValue(0);
          } else if (control.value > 99999) {
            control.setValue(99999);
          }
        }
      });

      this.totalEmissions = this.calculateEmissions(this.emissionsForm.value);
    });
  }

  /**
   * Envia os dados do formulário para a API.
   * Se o registo já existir, faz `PUT` (atualização).
   */
  onSubmit() {
    const formValue = this.emissionsForm.value;

    const emissionData = {
      electricity: formValue.electricity,
      petrol: formValue.petrol,
      diesel: formValue.diesel,
      UserId: this.userId
    };

    const url = `${environment.apiUrl}/UserEmissions/${this.userId}`;

    // Verifica se a emissão já existe
    this.http.get(url).subscribe({
      next: () => {
        // Caso a emissão já exista, faz o PUT (atualização)
        this.updateEmissions(url, emissionData);
      },
      error: (error) => {
        // Caso contrário, faz o POST (criação)
        if (error.status === 404) {
          this.createEmissions(emissionData);
        } else {
          this.alerts.enableError("Erro ao obter emissões");
        }
      }
    });
  }

  createEmissions(data: { electricity: number, petrol: number, diesel: number }) {
    const url = `${environment.apiUrl}/UserEmissions`;

    this.http.post(url, data).subscribe({
      next: () => {
        this.alerts.enableSuccess("Emissões atualizadas com sucesso");
      },
      error: () => {
        this.alerts.enableError("Erro ao atualizar emissões");
      }
    });
  }

  updateEmissions(url: string, data: { electricity: number, petrol: number, diesel: number }) {
    this.http.put(url, data).subscribe({
      next: () => {
        this.alerts.enableSuccess("Emissões atualizadas com sucesso");
      },
      error: () => {
        this.alerts.enableError("Erro ao atualizar emissões");
      }
    });
  }

  /**
   * Calcula as emissões totais com base nos dados inseridos.
   * 
   * @param formData Objeto com os valores de eletricidade, gasolina e gasóleo.
   * @returns Total de emissões em kg CO₂e.
   */
  calculateEmissions(formData: { electricity: number, petrol: number, diesel: number }) {
    const electricity = formData.electricity;
    const petrol = formData.petrol;
    const diesel = formData.diesel;

    const electricityEquivalent = electricity * 0.189;
    const petrolEquivalent = petrol * 0.00231;
    const dieselEquivalent = diesel * 0.00268;

    return electricityEquivalent + petrolEquivalent + dieselEquivalent;
  }
}

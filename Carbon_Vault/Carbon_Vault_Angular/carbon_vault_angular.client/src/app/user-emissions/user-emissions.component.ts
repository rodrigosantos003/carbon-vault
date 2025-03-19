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

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private alerts: AlertsService) {

    this.emissionsForm = this.fb.group({
      electricity: ['', [Validators.required]],
      petrol: ['', [Validators.required]],
      diesel: ['', [Validators.required]],
    });

    this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    const url = `${environment.apiUrl}/UserEmissions/${this.userId}`;

    this.http.get(url).subscribe(
      (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
        this.emissionsForm.setValue({
          electricity: data.electricity,
          petrol: data.petrol,
          diesel: data.diesel
        });
      },
      error => {
        // Caso ocorra um erro, e o status seja 404, define os valores como 0
        if (error.status === 404) {
          this.emissionsForm.setValue({
            electricity: 0,
            petrol: 0,
            diesel: 0
          });

          const formValue = this.emissionsForm.value;

          const emissionData = {
            electricity: formValue.electricity,
            petrol: formValue.petrol,
            diesel: formValue.diesel,
            UserId: this.userId
          };

          this.http.post(`${environment.apiUrl}/UserEmissions`, emissionData).subscribe(
            () => {
              this.alerts.enableSuccess("Emissões adicionadas com sucesso");
            },
            (error) => {
              this.alerts.enableError("Erro ao adicionar emissões");
            }
          );
        }
        else {
          // Caso contrário, exibe o erro no console
          console.error("Erro na requisição:", error);
        }
      }
    );

    this.emissionsForm.valueChanges.subscribe((changes) => {
      this.totalEmissions = this.calculateEmissions(changes);
    });
  }


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
    this.http.get(url).subscribe(
      (data: any) => {
        if (data) {
          // Caso a emissão já exista, faz o PUT (atualização)
          this.http.put(url, emissionData).subscribe({
            next: () => {
              this.alerts.enableSuccess("Emissões atualizadas com sucesso");
            },
            error: (error) => {
              this.alerts.enableError("Erro ao atualizar emissões");
            }
          }
          );
        }
      },
      (error) => {
        this.alerts.enableError("Erro ao obter emissões");
      }
    );
  }


  calculateEmissions(formData: { electricity: number, petrol: number, diesel: number }) {
    const electricityEquivalent = formData.electricity * 0.189;
    const petrolEquivalent = formData.petrol * 0.00231;
    const dieselEquivalent = formData.diesel * 0.00268;

    const sumTotal = electricityEquivalent + petrolEquivalent + dieselEquivalent;

    const total = Math.round(sumTotal * 100) / 100;

    return total;
  }
}

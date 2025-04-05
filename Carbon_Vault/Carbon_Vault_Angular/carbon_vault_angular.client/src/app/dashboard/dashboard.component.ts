import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: false,

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userRole: number = 0;
  userId: string;
  lineChart: any;
  circularChart: any;
  emissions: number;
  projects: any[];
  credits: number;
  purchases: Transaction[];
  sales: Transaction[];
  dailyVisits: number = 0;
  userCount: number = 0;
  ProjectCount: number = 0;
  TransactionCount: number = 0;
  CreditCount: number = 0;
  TotalTickets: number = 0;
  TotalOpenTickets: number = 0;
  TotalClosedTickets: number = 0;


  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private auth: AuthService, private alerts: AlertsService) {

    this.userId = this.authService.getUserId();
    this.emissions = 0;
    this.projects = [];
    this.credits = 0;
    this.purchases = [];
    this.sales = [];

  }

  ngOnInit() {
    sessionStorage.clear();

    const url = `${environment.apiUrl}/accounts/${this.userId}`;
    this.http.get(url).subscribe({
      next: (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
        if (data.role == 1) this.fetchAdminDashboardStatistics();
        if (data.role == 3) this.fetchDashboardStatistics_support();
        else this.fetchUserDashboardData();
        this.userRole = data.role
      },
      error: (e) => {
        console.error("Erro na requisição:", e);
      }
    });
    // if (this.userRole != 0) {
    //   this.createLineChart();
    //   this.createCircularChart();
    // }

  }
  fetchDashboardStatistics_support() {
    const url = `${environment.apiUrl}/Tickets/support/stats`;
    this.http.get(url, { headers: this.authService.getHeaders() }).subscribe(
      (data: any) => {
        console.log(data)
        this.TotalTickets = data.totalTickets;
        this.TotalOpenTickets = data.openTickets;
        this.TotalClosedTickets = data.closedTickets;
      },
      error => console.error('Erro ao buscar estatísticas do dashboard:', error)
    );
  }

  fetchAdminDashboardStatistics() {
    const url = `${environment.apiUrl}/accounts/DashboardStatistics`;
    this.http.get(url, { headers: this.authService.getHeaders() }).subscribe(
      (data: any) => {
        console.log(data)
        this.userCount = data.numeroTotalDeUtilizadores;
        this.ProjectCount = data.numeroTotalDeProjetosDisponiveis
        this.TransactionCount = data.numeroDeTransacoesFeitas
        this.CreditCount = data.numeroTotalDeCreditosDeCarbonoDisponiveis
        this.dailyVisits = data.numeroDiarioDeVisitas;

        console.log(this.userCount)
      },
      error => console.error('Erro ao buscar estatísticas do dashboard:', error)
    );
  }

  fetchUserDashboardData() {
    Promise.all([
      this.getProjects(),
      this.getEmissions(),
      this.getTransactions()]);
  }

  getTransactions() {
    this.alerts.enableLoading("A carregar dados");
    const purchasesURL = `${environment.apiUrl}/Transactions/type/0`;
    const salesURL = `${environment.apiUrl}/Transactions/type/1`;

    this.http.get<Transaction[]>(purchasesURL, {
      headers: this.auth.getHeaders()
    }).subscribe({
      next: (data) => {
        this.purchases = data;
      },
      error: (error) => {
        console.error("Erro ao obter compras: ", error);
      }
    });

    this.http.get<Transaction[]>(salesURL, {
      headers: this.auth.getHeaders()
    }).subscribe({
      next: (data) => {
        this.sales = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error("Erro ao obter compras: ", error);
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao carregar os dados");
      }
    });
  }

  getCredits() {
    //const url = `${environment.apiUrl}/CarbonCredits/user/${this.userId}`;

    //this.http.get(url).subscribe({
    //  next: (data: any) => {
    //    this.projects = data.length;
    //    console.log("Data: " + data.length);
    //  }
    //});

    for (let proj of this.projects) {
      this.CreditCount += proj.carbonCredits.length;
    }
  }

  getProjects() {
    const url = `${environment.apiUrl}/Projects/user/${this.userId}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.projects = data;
        this.ProjectCount = data.length;

        this.getCredits();
      }
    });
  }

  getEmissions() {
    const url = `${environment.apiUrl}/UserEmissions/${this.userId}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.emissions = this.calculateEmissions(data);
      }
    });
  }

  calculateEmissions(data: { electricity: number, petrol: number, diesel: number }) {
    const electricityEquivalent = data.electricity * 0.189;
    const petrolEquivalent = data.petrol * 0.00231;
    const dieselEquivalent = data.diesel * 0.00268;

    const sumTotal = electricityEquivalent + petrolEquivalent + dieselEquivalent;

    const total = Math.round(sumTotal * 100) / 100;

    return total;
  }

  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }

  createLineChart(): void {
    this.lineChart = new Chart('MyLineChart', {
      type: 'line',
      data: {
        labels: ['01', '02', '03', '04', '05', '06'],
        datasets: [
          {
            label: 'Últimos 6 dias',
            data: [10, 20, 28, 30, 25, 40],
            borderColor: '#4CAF50',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#4CAF50',
            tension: 0.3
          },
          {
            label: 'Última semana',
            data: [15, 25, 20, 35, 30, 33],
            borderColor: '#CCCCCC',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#CCCCCC',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Compras nos últimos dias'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            title: { display: true, text: 'Dias' }
          },
          y: {
            grid: { color: '#E0E0E0' },
            title: { display: true, text: 'Quantidade' }
          }
        }
      }
    });
  }

  createCircularChart(): void {
    this.circularChart = new Chart('MyCircularChart', {
      type: 'doughnut',
      data: {
        labels: ['Manhã', 'Tarde', 'Noite'],
        datasets: [
          {
            label: 'Utilizadores por período',
            data: [8, 15, 11],
            backgroundColor: ['#A5D99D', '#4EA741', '#72BB67'],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Período de Atividade'
          }
        }
      }
    });
  }
}

interface Transaction {
  id: number,
  projectName: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}

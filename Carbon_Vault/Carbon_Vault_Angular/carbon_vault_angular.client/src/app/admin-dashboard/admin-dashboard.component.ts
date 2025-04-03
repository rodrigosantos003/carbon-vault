import { Component, OnInit ,Input ,SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Papa } from 'ngx-papaparse';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  @Input() dailyVisits!: number;
  @Input() userCount!: number;
  @Input() ProjectCount!: number;
  @Input() TransactionCount!: number;
  @Input() CreditCount!: number;
  activityChart: any;
  lineChart: any;
  transactionsThisWeek: any[] = [];
  transactionsLastWeek: any[] = [];



  constructor(private http: HttpClient, private papa: Papa) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes detected:', changes);
  }
  ngOnInit(): void {
    //this.createLineChart();
    //this.createCircularChart();
    this.fetchActivityData();
    this.fetchWeeklyTransactionData();

  }

  fetchActivityData() {
    const url = `${environment.apiUrl}/accounts/activity-periods`;
    this.http.get<any[]>(url).subscribe(data => {
      this.updateActivityChart(data);
      console.log(data)
    }, error => {
      console.error('Error fetching activity periods:', error);
    });
  }

  fetchWeeklyTransactionData() {
    const url = `${environment.apiUrl}/transactions/weekly`;
    this.http.get<any>(url).subscribe(data => {
      this.transactionsThisWeek = data.thisWeek;
      this.transactionsLastWeek = data.lastWeek;
      this.updateLineChart(data);
    }, error => {
      console.error('Error fetching weekly transaction data:', error);
    });
  }
  updateLineChart(response: any) {
    // Mapeia os dados da semana passada e da semana atual para incluir sempre os dias da semana de segunda a sexta
    const thisWeek = response?.thisWeek || [];
    const lastWeek = response?.lastWeek || [];
  
    // Definindo os dias da semana de segunda a sexta
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  
    // Função para acumular a quantidade total de transações por dia da semana
    const getWeeklyData = (weekData: any[], daysOfWeek: string[]) => {
      const weeklyData: number[] = new Array(5).fill(0);  // Inicializa com 5 dias (segunda a sexta)
  
      weekData.forEach((entry: any) => {
        const entryDate = new Date(entry.date);
        const dayIndex = entryDate.getDay() - 1;  // Ajuste: getDay retorna 0 para Domingo, então subtrai 1 para começar a contagem de Segunda
        if (dayIndex >= 0 && dayIndex < 5) {  // Apenas conta de Segunda a Sexta
          weeklyData[dayIndex] += entry.totalQuantity;
        }
      });
  
      return weeklyData;
    };
  
    // Organize the data for this week and last week
    const thisWeekData = getWeeklyData(thisWeek, daysOfWeek);
    const lastWeekData = getWeeklyData(lastWeek, daysOfWeek);
  
    // Se o gráfico já existir, destrua-o para evitar múltiplas instâncias
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  
    // Criação do gráfico
    this.lineChart = new Chart('MyLineChart', {
      type: 'line',
      data: {
        labels: daysOfWeek,  // Dias da semana (Segunda a Sexta)
        datasets: [
          {
            label: 'Esta semana',
            data: thisWeekData,  // Quantidade de transações para esta semana
            borderColor: '#4CAF50',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#4CAF50',
            tension: 0.3
          },
          {
            label: 'Semana passada',
            data: lastWeekData,  // Quantidade de transações para semana passada
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
            text: 'Compras esta semana vs semana passada'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            title: { display: true, text: 'Dias da semana' }
          },
          y: {
            grid: { color: '#E0E0E0' },
            title: { display: true, text: 'Quantidade de transações' },
            beginAtZero: true,  // Garante que o eixo Y começa do zero
            ticks: {
              stepSize: 1,  // Garante que os valores no eixo Y sejam inteiros
              precision: 0   // Remove casas decimais
            }
          }
        }
      }
    });
  }
  
  


  updateActivityChart(data: any[]) {
    const periods = ['Manhã', 'Tarde', 'Noite'];
    const counts = periods.map(period => {
      return data.filter(d => d.activityPeriod === period).length;
    });

    if (this.activityChart) {
      this.activityChart.destroy();
    }

    const canvas = document.getElementById('ActivityChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }

    // Update the chart with the processed data
    this.activityChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: periods,
        datasets: [{
          data: counts,
          backgroundColor: ['#A5D99D', '#4EA741', '#72BB67'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Período de Atividade' }
        }
      }
    });
  }

  downloadActivityCSV() {
    const url = `${environment.apiUrl}/accounts/activity-periods`;
    this.http.get<any[]>(url).subscribe(data => {
      const csv = this.papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'activity_periods.csv';
      a.click();
    }, error => {
      console.error('Error fetching activity periods:', error);
    });
  }
  downloadTransactionsCSV() {
    const allTransactions = [
      ...this.transactionsThisWeek.flatMap((t: any) => t.transactions),
      ...this.transactionsLastWeek.flatMap((t: any) => t.transactions)
    ];

    const dataToExport = allTransactions.map((transaction: any) => ({
      'Transaction ID': transaction.id,
      'Buyer ID': transaction.buyerId,
      'Seller ID': transaction.sellerId,
      'Project ID': transaction.projectId,
      'Quantity': transaction.quantity,
      'Total Price': transaction.totalPrice,
      'Date': transaction.date,
      'State': transaction.state,
      'Checkout Session': transaction.checkoutSession,
      'Payment Method': transaction.paymentMethod
    }));
    
  
    // Unparse the data to CSV
    const csv = this.papa.unparse(dataToExport);
  
    // Create a blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transactions.csv';  
    a.click();
  }
  

}

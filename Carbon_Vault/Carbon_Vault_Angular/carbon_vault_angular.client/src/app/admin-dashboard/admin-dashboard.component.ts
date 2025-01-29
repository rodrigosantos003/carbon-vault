import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  lineChart: any;
  circularChart: any;

  ngOnInit(): void {
    this.createLineChart();
    this.createCircularChart();
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

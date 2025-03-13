import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-details',
  standalone: false,
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css'
})
export class TransactionDetailsComponent {
  @Input() transactionType: 'compra' | 'venda' = 'venda'; // Define se é compra ou venda
  @Input() transactionId: string = '123456789'; // ID da transação
  @Input() transactionUser: string = 'Rúben Dâmaso'; // Nome do comprador/fornecedor
  @Input() transactionProject: string = 'Plantar arvores na california'; // Nome do projeto

  @Input() transactionTitle: string = 'Compra de Créditos'; // Data da transação
  @Input() transactionDate: string = '9/10/2025 18:36:23'; // Status da transação
  @Input() transactionQuantity: string = '10'; // Processador de pagamento
  @Input() transactionTotal: string = '150'; // Processador de pagamento
  @Input() transactionSession: string = '123456789'; // Sessão de pagamento
  @Input() transactionMethod: string = 'PayPal'; // Processador de pagamento
}

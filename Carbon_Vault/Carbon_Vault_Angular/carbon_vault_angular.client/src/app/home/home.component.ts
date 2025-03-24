import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  faqs = [
    {
      "question": "O que é um crédito de carbono?",
      "answer": "Um crédito de carbono representa a redução ou remoção de uma tonelada métrica de dióxido de carbono (CO2) da atmosfera, geralmente através de iniciativas como plantação de árvores ou projetos de energias renováveis.",
      "open": false
    },
    {
      "question": "Como funciona o marketplace de créditos de carbono?",
      "answer": "O marketplace permite a compra e venda de créditos de carbono entre empresas ou indivíduos que desejam compensar suas emissões de CO2. Os compradores adquirem créditos para neutralizar sua pegada de carbono, enquanto os vendedores (geralmente empresas com projetos de sustentabilidade) oferecem esses créditos.",
      "open": false
    },
    {
      "question": "Como posso adquirir créditos de carbono?",
      "answer": "Pode adquirir créditos de carbono através do nosso marketplace, onde pode escolher entre diversos projetos ambientais que compensam emissões de CO2, como reflorestamento, energia renovável, e agricultura sustentável.",
      "open": false
    },
    {
      "question": "Quem pode vender créditos de carbono no marketplace?",
      "answer": "Projetos que estejam certificados por entidades reconhecidas, como o Verified Carbon Standard (VCS) ou o Gold Standard, podem vender créditos de carbono. Os projetos devem demonstrar que estão efetivamente a reduzir ou remover carbono da atmosfera.",
      "open": false
    },
    {
      "question": "Como posso verificar a autenticidade dos créditos de carbono?",
      "answer": "Todos os créditos de carbono listados no nosso marketplace são provenientes de projetos certificados e possuem documentação e auditorias independentes que garantem a sua autenticidade e a eficácia na compensação de carbono.",
      "open": false
    },
    {
      "question": "Qual é o impacto ambiental de comprar créditos de carbono?",
      "answer": "Ao comprar créditos de carbono, está a apoiar projetos que ajudam a reduzir a concentração de CO2 na atmosfera, contribuindo para a mitigação das alterações climáticas e o desenvolvimento sustentável.",
      "open": false
    },
    {
      "question": "Posso vender créditos de carbono se eu tiver um projeto ambiental?",
      "answer": "Sim, se o seu projeto for certificado por uma das principais normas internacionais de compensação de carbono, pode registar-se no nosso marketplace para oferecer créditos de carbono. A sua iniciativa deve ser verificada por auditores independentes.",
      "open": false
    },
    {
      "question": "O que são as certificações de créditos de carbono?",
      "answer": "As certificações, como VCS e Gold Standard, garantem que os créditos de carbono vendidos no mercado correspondem a reduções reais e verificadas de emissões de CO2. Essas certificações são essenciais para garantir a transparência e a credibilidade no mercado.",
      "open": false
    },
    {
      "question": "Qual é o custo de um crédito de carbono?",
      "answer": "O preço dos créditos de carbono pode variar consoante o projeto, a certificação e a oferta e demanda no mercado. Geralmente, os preços podem ser influenciados pela localização do projeto, tipo de tecnologia utilizada e o impacto ambiental.",
      "open": false
    },
    {
      "question": "Posso compensar toda a minha pegada de carbono através de créditos?",
      "answer": "Sim, pode calcular a sua pegada de carbono e compensar o valor total, adquirindo créditos de carbono suficientes para cobrir as suas emissões. O nosso marketplace fornece ferramentas para calcular e compensar as suas emissões de CO2.",
      "open": false
    }
  ];

  constructor(public router: Router) { }

  toggleFAQ(index: number) {
    this.faqs.forEach((faq, i) => {
      faq.open = i === index ? !faq.open : false; // Fecha os outros e abre apenas um
    });
  }
}

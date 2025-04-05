import jsPDF from 'jspdf';

/**
 * Gera o conteúdo HTML para o certificado de aquisição de créditos de carbono.
 * 
 * @param {Object} info - Informações sobre a aquisição de créditos de carbono.
 * @param {string} info.nomeAdquirente - Nome do adquirente dos créditos de carbono.
 * @param {string} info.dataAquisicao - Data de aquisição dos créditos de carbono.
 * @param {number} info.quantidadeCreditos - Quantidade de créditos adquiridos (em toneladas).
 * @param {string} info.nomeProjeto - Nome do projeto de créditos de carbono.
 * @param {string} info.localizacaoProjeto - Localização do projeto de créditos de carbono.
 * @param {string} info.certificador - Certificador responsável pela verificação do projeto.
 * @param {string} info.descricaoProjeto - Descrição do projeto de créditos de carbono.
 * 
 * @returns {string} O conteúdo HTML gerado para o certificado.
 */
function generateHtml(info: any): string {
  return `
  <body>
  <style>
    body { 
    font-family: Arial, sans-serif; 
    color: #333; 
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: #f0f0f0;
  }

  .certificate {
    width: 885px;
    height: 1250px;
    border: 10px solid #2E7D32; 
    padding: 70px;
    box-sizing: border-box;
    text-align: center; 
    background: white;
    page-break-after: always;
  }

  /* Logo */
  .logo { 
    width: 120px; 
    margin-bottom: 30px; 
  }

  /* Title */
  .title { 
    font-size: 32px; 
    font-weight: bold; 
    color: #2E7D32; 
    margin-bottom: 40px; 
  }

  /* Content */
  .content { 
    text-align: justify; 
    margin: 40 0; 
    line-height: 1.8; 
    font-size: 16px; 
  }

  .content p{
    margin: 40px 0;
  }

  /* Highlight */
  .highlight { 
    font-weight: bold; 
    color: #2E7D32; 
  }

  /* Footer */
  .footer {
    bottom: 30px;
    position: absolute;
    font-size: 12px; 
    color: #777; 
    text-align: center; 
  }

  /* Info Table */
  .info-table {
    width: 100%; 
    margin: 70px 0; 
    border-collapse: collapse;
  }

  .info-table table {
    margin: auto;
  }

  .info-table td { 
    padding: 10px; 
    border: 2px solid #2E7D32; 
    text-align: left; 
  }
  </style> 
  <div class="certificate" id="certificate">
    <img src="../../../../images/CV_Logo.png" alt="Logo Carbon Vault" class="logo">

    <div class="title">Certificado de Aquisição de Créditos de Carbono</div>

    <div class="content">
        <p>A Carbon Vault certifica que <span class="highlight">${info.nomeAdquirente}</span> adquiriu, em <span class="highlight">${info.dataAquisicao}</span>, a quantidade de <span class="highlight">${info.quantidadeCreditos}</span>${(info.quantidadeCreditos > 1) ? 'toneladas' : 'tonelada'} de CO<sub>2</sub>e em créditos de carbono, provenientes do projeto <span class="highlight"> ${info.nomeProjeto} </span>, localizado em <span class="highlight"> ${info.localizacaoProjeto} </span>.</p>
        <p>Os créditos de carbono adquiridos foram verificados através do certificador <span class="highlight">${info.certificador}</span>, assegurando a conformidade com as melhores práticas internacionais. Cada crédito representa a redução ou remoção de uma tonelada de dióxido de carbono equivalente, contribuindo para a mitigação das mudanças climáticas.</p>
        <p>O projeto <span class="highlight">${info.nomeProjeto}</span> tem como propósito <span class="highlight">"${info.descricaoProjeto}"</span>, promovendo práticas sustentáveis, a proteção do meio ambiente e o desenvolvimento das comunidades locais envolvidas. Esse compromisso reflete o empenho em criar um impacto positivo e duradouro no planeta.</p>
        <p>Com a aquisição destes créditos, <span class="highlight">${info.nomeAdquirente}</span> demonstra seu compromisso com a sustentabilidade e a responsabilidade ambiental, contribuindo para um futuro mais verde e consciente.</p>
    </div>

    <!-- Informações adicionais -->
    <div class="info-table">
        <table>
            <tr>
                <td><strong>Projeto:</strong></td>
                <td>${info.nomeProjeto}</td>
            </tr>
            <tr>
                <td><strong>Localização:</strong></td>
                <td>${info.localizacaoProjeto}</td>
            </tr>
            <tr>
                <td><strong>Certificador:</strong></td>
                <td>${info.certificador}</td>
            </tr>
            <tr>
                <td><strong>Data de Aquisição:</strong></td>
                <td>${info.dataAquisicao}</td>
            </tr>
            <tr>
                <td><strong>Quantidade de Créditos:</strong></td>
                <td>${info.quantidadeCreditos + ((info.quantidadeCreditos > 1) ? ' toneladas' : ' tonelada')}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Este certificado é emitido pela Carbon Vault, confirmando a aquisição de créditos de carbono provenientes de projetos certificados que contribuem para a redução global de emissões de carbono.
    </div>
  </div>
  </body>
`;
}

/**
 * Gera e faz o download de um PDF contendo o certificado de aquisição de créditos de carbono.
 * Utiliza a biblioteca jsPDF para gerar o arquivo PDF com as informações do certificado.
 * 
 * @param {Object} info - Informações sobre a aquisição de créditos de carbono.
 * @param {string} info.nomeAdquirente - Nome do adquirente dos créditos de carbono.
 * @param {string} info.dataAquisicao - Data de aquisição dos créditos de carbono.
 * @param {number} info.quantidadeCreditos - Quantidade de créditos adquiridos (em toneladas).
 * @param {string} info.nomeProjeto - Nome do projeto de créditos de carbono.
 * @param {string} info.localizacaoProjeto - Localização do projeto de créditos de carbono.
 * @param {string} info.certificador - Certificador responsável pela verificação do projeto.
 * @param {string} info.descricaoProjeto - Descrição do projeto de créditos de carbono.
 */
export function downloadPDF(
  info: {
    nomeAdquirente: string,
    dataAquisicao: string,
    quantidadeCreditos: number,
    nomeProjeto: string,
    localizacaoProjeto: string,
    certificador: string,
    descricaoProjeto: string,
  }): void {

  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
    orientation: 'portrait'
  });

  doc.html(generateHtml(info), {
    callback: function (doc) {
      doc.save('certificado.pdf');
    },
    x: 0,
    y: 0,
    width: 190,
    windowWidth: 800
  });
}

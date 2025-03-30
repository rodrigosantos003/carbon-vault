import jsPDF from 'jspdf';

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

    <div class="title">Relatório de Emissões</div>

    <div class="content">
        <p>A Carbon Vault apresenta o seu relatório acerca das emissões de carbono apresentadas nos documentos enviados.</p>

        <div>
            ${info.reportText}
        </div>
    </div>

    <!-- Informações adicionais -->
    <div class="info-table">
        <table>
            <tr>
                <td><strong>Data</strong></td>
                <td>${info.reportDate}</td>
            </tr>
            <tr>
                <td><strong>Cliente</strong></td>
                <td>${info.client}</td>
        </table>
    </div>

    <div class="footer">
        Este relatório é emitido pela Carbon Vault após análise dos documentos enviados. A veracidade da informação prestada nos mesmos é da inteira responsabilidade do cliente.
    </div>
  </div>
  </body>
`;
}

export function downloadReportPDF(
  info: {
    client: string,
    reportDate: string,
    reportText: string
  }): void {

  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
    orientation: 'portrait'
  });

  doc.html(generateHtml(info), {
    callback: function (doc) {
      doc.save(`Relatório_${info.reportDate}.pdf`);
    },
    x: 0,
    y: 0,
    width: 190,
    windowWidth: 800
  });
}

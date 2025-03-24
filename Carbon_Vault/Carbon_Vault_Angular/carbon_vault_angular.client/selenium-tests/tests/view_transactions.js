import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import assert from 'assert';

export async function testTransactionsPreview(driver, admin, hasTransactions) {
    // 4️⃣ Aceder à página de transações

    let url = admin ? 'http://localhost:59115/admin-transactions' : 'http://localhost:59115/purchases';
    
    await driver.get(url);

    let tableClass = admin ? '.purchase-history-table' : '.table table';

    // 5️⃣ Esperar pelos elementos da tabela
    await driver.wait(until.elementLocated(By.css(tableClass)), 5000);
    await driver.wait(until.elementLocated(By.css(tableClass + ' tbody')), 5000);

    if(hasTransactions) {
        // 6️⃣ Verificar se a tabela tem pelo menos uma linha
        let rows = await driver.findElements(By.css(tableClass + ' tbody tr'));
        assert(rows.length > 0, "Erro: A tabela de transações está vazia.");
    }
    else {
        // 6️⃣ Verificar se a tabela tem pelo menos uma linha
        let rows = await driver.findElements(By.css(tableClass + ' tbody tr'));
        let firstRowText = await rows[0].getText();
        assert(rows.length === 1 && firstRowText == "Nada a mostrar!", "Erro: A tabela de transações não está vazia.");
    }

    console.log("✅ Teste de visualização de transações concluído! (Admin:", admin," | Com Transações:", hasTransactions, ")");
}

export async function testTransactionDetailsPreview(driver){
    // 4️⃣ Aceder à página de detalhes de uma transação
    await driver.get('http://localhost:59115/transaction-details/1');

    // 5️⃣ Espera pelos elementos que contêm os detalhes da transação
    await driver.wait(until.elementLocated(By.css('.transaction-value')), 5000);

    // 6️⃣ Verificar se os todos campos onde é suposto ter texto tem (todos tem a mesma classe)
    let transactionValue = await driver.findElements(By.css('.transaction-value'));

    for(let i = 0; i < transactionValue.length; i++){
        let text = await transactionValue[i].getText();
        assert(text !== "", "Erro: Campo de texto vazio!");
    }

    // 7️⃣ Verificar se a tabela da fatura contem uma linha
    let rows = await driver.findElements(By.css('table tbody tr'));
    assert(rows.length > 0, "Erro: A tabela de fatura está vazia.");

    console.log("✅ Teste de visualização de detalhes de transação concluído!");
}

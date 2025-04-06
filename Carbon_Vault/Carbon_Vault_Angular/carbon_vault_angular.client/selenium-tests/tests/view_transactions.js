const { By, until } = require('selenium-webdriver');
const assert = require('assert');

async function testTransactionsPreview(driver, admin, hasTransactions) {
    const url = admin ? 'http://localhost:59115/admin-transactions' : 'http://localhost:59115/purchases';
    const tableClass = admin ? '.purchase-history-table' : '.table table';

    console.log(`A aceder à página de transações (${admin ? "admin" : "user"})...`);
    await driver.get(url);

    await driver.wait(until.elementLocated(By.css(tableClass)), 5000);
    await driver.wait(until.elementLocated(By.css(`${tableClass} tbody`)), 5000);

    const rows = await driver.findElements(By.css(`${tableClass} tbody tr`));

    if (hasTransactions) {
        assert(rows.length > 0, "❌ Erro: A tabela de transações está vazia.");
    } else {
        const firstRowText = await rows[0].getText();
        assert(rows.length === 1 && firstRowText === "Nada a mostrar!", "❌ Erro: A tabela de transações não está vazia como esperado.");
    }

    console.log(`✅ Teste de visualização de transações concluído! (Admin: ${admin} | Com Transações: ${hasTransactions})`);
}

async function testTransactionDetailsPreview(driver) {
    console.log("A aceder à página de detalhes da transação...");
    await driver.get('http://localhost:59115/transaction-details/1');

    await driver.wait(until.elementLocated(By.css('.transaction-value')), 5000);
    const transactionValues = await driver.findElements(By.css('.transaction-value'));

    for (let i = 0; i < transactionValues.length; i++) {
        const text = await transactionValues[i].getText();
        assert(text.trim() !== "", `❌ Erro: Campo de texto vazio no índice ${i}!`);
    }

    const rows = await driver.findElements(By.css('table tbody tr'));
    assert(rows.length > 0, "❌ Erro: A tabela de fatura está vazia.");

    console.log("✅ Teste de visualização de detalhes de transação concluído!");
}

module.exports = {
    testTransactionsPreview,
    testTransactionDetailsPreview
};

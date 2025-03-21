import { Builder, By, until } from 'selenium-webdriver';
import { testLogin } from './tests/login.js';
import { testEmissionsForm } from './tests/user_emissions.js';
import { testRegister } from './tests/register.js'
import { testTransactionsPreview, testTransactionDetailsPreview } from './tests/view_transactions.js';
import { testCreditsSellCriterion } from './tests/credits-criterion.js';
import { testAddProject } from './tests/add-project.js';

(async function appTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  console.log("WebDriver iniciado com sucesso");

  try {
    // Testar o registo com credenciais validas
    await testRegister(driver, "selenium user", "Selenium@123", "testing@example.com", "987654321");

    // Fazer login e obter o token
    let token = await testLogin(driver, 'user@carbonvault.com', 'User@111');

    // Definir manualmente o token no localStorage
    await driver.executeScript(`localStorage.setItem('token', '${token}');`);

    // Recarregar a página para garantir que o token é aplicado
    await driver.navigate().refresh();

    // Testar inserção de projeto
    await testAddProject(driver);

    // Testar form de emissões
    await testEmissionsForm(driver);

    // Testar critérios de venda de créditos
    await testCreditsSellCriterion(driver, 2);

    // Testar a visualização de transações de um user com transações
    await testTransactionsPreview(driver, false, true);

    // Remove o token do localStorage
    await driver.executeScript(`localStorage.removeItem('token');`);

    // Recarregar a página para garantir que o token é removido
    await driver.navigate().refresh();

    // Loga com o admin
    token = await testLogin(driver, 'user2@carbonvault.com', 'User@222');

    // Definir manualmente o token no localStorage
    await driver.executeScript(`localStorage.setItem('token', '${token}');`);

    // Recarregar a página para garantir que o token é aplicado
    await driver.navigate().refresh();

    // Testar a visualização de transações de um user
    await testTransactionsPreview(driver, false, false);

    // Remove o token do localStorage
    await driver.executeScript(`localStorage.removeItem('token');`);

    // Recarregar a página para garantir que o token é removido
    await driver.navigate().refresh();

    // Loga com o admin
    token = await testLogin(driver, 'admin@carbonvault.com', 'Admin@123');

    // Definir manualmente o token no localStorage
    await driver.executeScript(`localStorage.setItem('token', '${token}');`);

    // Recarregar a página para garantir que o token é aplicado
    await driver.navigate().refresh();

    // Testar a visualização de transações de um admin
    await testTransactionsPreview(driver, true, true);

    // Testar a visualização de detalhes de uma transação
    await testTransactionDetailsPreview(driver);

    console.log("Testes concluído com sucesso!");

  } catch (error) {
    console.error("Erro nos testes:", error);
  } finally {
    await driver.quit();
  }
})();

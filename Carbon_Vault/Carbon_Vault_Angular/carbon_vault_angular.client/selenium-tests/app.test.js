const { Builder } = require('selenium-webdriver');
const { Guid } = require('js-guid');
const { testLogin } = require('./tests/login.js');
const { testEmissionsForm } = require('./tests/user_emissions.js');
const { testRegister } = require('./tests/register.js');
const { testTransactionsPreview, testTransactionDetailsPreview } = require('./tests/view_transactions.js');
const { testCreditsSellCriterion } = require('./tests/credits-criterion.js');
const { testAddProject } = require('./tests/add-project.js');
const { testBuyCredits } = require('./tests/buy_credits.js');
const { testCart } = require('./tests/cart.js');
const { testUserManager } = require('./tests/user-manager.js');

(async function appTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  console.log("WebDriver iniciado com sucesso");

  try {
    // Testar o registo com credenciais válidas
    await testRegister(driver, "selenium user", "Selenium@123", `testing-${Guid.newGuid()}@example.com`, "987654321");

    // Fazer login e obter o token
    let token = await testLogin(driver, 'user@carbonvault.com', 'User@111');

    // Definir manualmente o token no localStorage
    await driver.executeScript(`localStorage.setItem('token', '${token}');`);

    // Recarregar a página para garantir que o token é aplicado
    await driver.navigate().refresh();

    // Testar inserção de projeto
    await testAddProject(driver);

    // Testar a aquisição de créditos
    await testBuyCredits(driver);

    // Testar Carrinho
    await testCart(driver);

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

    // Loga com o user 2
    token = await testLogin(driver, 'user2@carbonvault.com', 'User@222');

    await driver.executeScript(`localStorage.setItem('token', '${token}');`);
    await driver.navigate().refresh();

    await testTransactionsPreview(driver, false, false);

    await driver.executeScript(`localStorage.removeItem('token');`);
    await driver.navigate().refresh();

    // Loga com o admin
    token = await testLogin(driver, 'admin@carbonvault.com', 'Admin@123');

    await driver.executeScript(`localStorage.setItem('token', '${token}');`);
    await driver.navigate().refresh();

    await testTransactionsPreview(driver, true, true);
    await testTransactionDetailsPreview(driver);
    await testUserManager(driver);

    console.log("Testes concluídos com sucesso!");

  } catch (error) {
    console.error("Erro nos testes:", error);
  } finally {
    await driver.quit();
  }
})();

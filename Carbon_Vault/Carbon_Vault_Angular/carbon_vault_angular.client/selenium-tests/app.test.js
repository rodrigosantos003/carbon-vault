import { Builder, By, until } from 'selenium-webdriver';
import { testLogin } from './tests/login.js';
import { testEmissionsForm } from './tests/user_emissions.js';
import { testRegister } from './tests/register.js'

(async function appTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  console.log("WebDriver iniciado com sucesso");

  try {
    // Testar o registo com credenciais validas
    await testRegister(driver, "selenium user", "Selenium@123", "testing@example.com", "987654321");

    // Fazer login e obter o token
    let token = await testLogin(driver, 'user1@carbonvault.com', 'User@111');

    // Definir manualmente o token no localStorage
    await driver.executeScript(`localStorage.setItem('token', '${token}');`);

    // Recarregar a página para garantir que o token é aplicado
    await driver.navigate().refresh();

    // Testar form de emissões
    await testEmissionsForm(driver);

    console.log("Testes concluído com sucesso!");

  } catch (error) {
    console.error("Erro nos testes:", error);
  } finally {
    await driver.quit();
  }
})();

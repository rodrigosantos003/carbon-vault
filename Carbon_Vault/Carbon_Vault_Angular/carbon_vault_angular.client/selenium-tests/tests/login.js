const { By, until } = require('selenium-webdriver');

async function testLogin(driver, email, password) {
    await driver.get('http://localhost:59115/login');

    let emailInput = await driver.wait(until.elementLocated(By.id('email')), 5000);
    let passwordInput = await driver.wait(until.elementLocated(By.id('password')), 5000);
    let loginButton = await driver.wait(until.elementLocated(By.css('.login-button')), 5000);

    await emailInput.sendKeys(email);
    await passwordInput.sendKeys(password);
    await loginButton.click();

    // Lidar com alerta (se aparecer)
    try {
        await driver.wait(until.alertIsPresent(), 5000);
        let alert = await driver.switchTo().alert();
        console.log("Alerta encontrado:", await alert.getText());
        await alert.accept();
    } catch (e) {
        //console.log("Nenhum alerta encontrado.");
    }

    // Esperar pelo redirecionamento
    await driver.wait(until.urlContains('/dashboard'), 10000);

    // Capturar o token do localStorage
    let token = await driver.executeScript("return localStorage.getItem('token');");

    if (!token) {
        throw new Error("❌ Erro: O token não foi armazenado no localStorage.");
    }

    console.log("✅ Login bem-sucedido! Token armazenado:", token);
    return token;
}

module.exports = {
    testLogin
};

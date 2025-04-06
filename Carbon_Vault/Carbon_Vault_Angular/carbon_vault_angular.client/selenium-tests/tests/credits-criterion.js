const { By, until } = require('selenium-webdriver');
const assert = require('assert');

async function testCreditsSellCriterion(driver, projectId) {
    // 4️⃣ Aceder à página de emissões
    let url = 'http://localhost:59115/Account-project-manager/' + projectId;
    await driver.get(url);

    // 5️⃣ Esperar pelo botão de venda de créditos
    await driver.wait(until.elementLocated(By.css(".credits-button")), 5000);

    // 6️⃣ Clicar no botão de venda de créditos
    await driver.findElement(By.css(".credits-button")).click();

    // 7️⃣ Esperar pelo form de venda de créditos
    await driver.wait(until.elementLocated(By.css(".credits-form")), 5000);

    // 8️⃣ Obter a quantidade de créditos
    await driver.wait(until.elementLocated(By.css(".credits-form-field")), 5000);
    let creditsAmountElement = await driver.findElement(By.css(".credits-form-field")).getText();
    let creditsAmount = parseInt(creditsAmountElement.replace("Créditos totais do Projeto: ", ""));

    // 9️⃣ Obtém os inputs do form
    let inputs = await driver.findElements(By.css(".credits-form input"));
    let button = await driver.findElement(By.css(".credits-form .primary"));

    // O primeiro é quantidade e o segundo o preço
    let quantityInput = inputs[0];
    let priceInput = inputs[1];
    let validQuantity = Math.floor(Math.random() * creditsAmount);
    let validPrice = Math.floor(Math.random() * 100);

    // 1️⃣0️⃣ Testa se deixa números negativos na quantidade
    await quantityInput.clear();
    await quantityInput.sendKeys("-1");
    await priceInput.clear();
    await priceInput.sendKeys(validPrice);
    await button.click();

    await driver.wait(until.alertIsPresent(), 5000);
    let alert = await driver.switchTo().alert();
    let alertText = await alert.getText();
    assert.strictEqual(alertText, "A quantidade de créditos para venda não pode ser negativa");
    console.log("✅ Teste de quantidade negativa passou");
    await alert.accept();

    // 1️⃣1️⃣ Testa se deixa números negativos no preço
    await priceInput.clear();
    await priceInput.sendKeys("-1");
    await quantityInput.clear();
    await quantityInput.sendKeys(validQuantity);
    await button.click();

    await driver.wait(until.alertIsPresent(), 5000);
    alert = await driver.switchTo().alert();
    alertText = await alert.getText();
    assert.strictEqual(alertText, "O preço por crédito tem que ser positivo");
    console.log("✅ Teste de preço negativo passou");
    await alert.accept();

    // 1️⃣2️⃣ Testa se deixa preço igual a 0
    await priceInput.clear();
    await priceInput.sendKeys("0");
    await quantityInput.clear();
    await quantityInput.sendKeys(validQuantity);
    await button.click();

    await driver.wait(until.alertIsPresent(), 5000);
    alert = await driver.switchTo().alert();
    alertText = await alert.getText();
    assert.strictEqual(alertText, "O preço por crédito tem que ser positivo");
    console.log("✅ Teste de preço igual a 0 passou");
    await alert.accept();

    // 1️⃣3️⃣ Testa se deixa vender mais créditos do que os disponíveis
    await quantityInput.clear();
    await quantityInput.sendKeys(creditsAmount * 2);
    await priceInput.clear();
    await priceInput.sendKeys(validPrice);
    await button.click();

    await driver.wait(until.alertIsPresent(), 5000);
    alert = await driver.switchTo().alert();
    alertText = await alert.getText();
    assert.strictEqual(alertText, "Não pode vender mais créditos do que os que tem disponíveis");
    console.log("✅ Teste de vender mais créditos que os disponíveis passou");
    await alert.accept();

    // 1️⃣4️⃣ Insere valores válidos    
    await quantityInput.clear();
    await quantityInput.sendKeys(validQuantity);
    await priceInput.clear();
    await priceInput.sendKeys(validPrice);
    await button.click();

    // 1️⃣5️⃣ Esperar pelo alert de sucesso
    await driver.wait(until.alertIsPresent(), 5000);
    alert = await driver.switchTo().alert();
    alertText = await alert.getText();
    assert.strictEqual(alertText, "Informações de créditos atualizadas com sucesso!");
    await alert.accept();

    // 1️⃣6️⃣ Obter novas informações de créditos
    await driver.wait(until.elementLocated(By.css(".credits-info")), 5000);
    let creditsInfoElement = await driver.findElement(By.css(".credits-info"));
    let creditsInfo = await creditsInfoElement.findElements(By.css("b"));

    let creditsAmountAfter = parseInt(await creditsInfo[0].getText());
    let creditsAmountForSaleAfter = parseInt(await creditsInfo[1].getText());
    let creditsPriceAfter = parseInt(await creditsInfo[2].getText());

    // 1️⃣7️⃣ Verificar se os créditos foram atualizados
    assert.strictEqual(creditsAmount, creditsAmountAfter);
    assert.strictEqual(creditsPriceAfter, validPrice);
    assert.strictEqual(creditsAmountForSaleAfter, validQuantity);

    console.log("✅ Teste de critérios de venda de créditos passou");
}

module.exports = {
    testCreditsSellCriterion
};

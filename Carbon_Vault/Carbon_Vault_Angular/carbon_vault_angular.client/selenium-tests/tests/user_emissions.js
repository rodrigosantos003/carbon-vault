const { By, until } = require('selenium-webdriver');
const assert = require('assert');

async function testEmissionsForm(driver) {
    // Aceder à página de emissões
    await driver.get('http://localhost:59115/user-emissions');

    // Preencher o formulário de emissões
    let electricityInput = await driver.wait(until.elementLocated(By.id('electricity')), 5000);
    let petrolInput = await driver.wait(until.elementLocated(By.id('petrol')), 5000);
    let dieselInput = await driver.wait(until.elementLocated(By.id('diesel')), 5000);

    // Preencher os valores
    await electricityInput.clear();
    await electricityInput.sendKeys('100'); // 100 MWh

    await petrolInput.clear();
    await petrolInput.sendKeys('50'); // 50 Litros

    await dieselInput.clear();
    await dieselInput.sendKeys('75'); // 75 Litros

    console.log("✅ Formulário preenchido!");

    // Submeter o formulário
    let saveButton = await driver.wait(until.elementLocated(By.css('.save-button')), 5000);
    await saveButton.click();

    // Capturar e validar o total de emissões
    let totalEmissions = await driver.wait(until.elementLocated(By.id('form-total')), 5000);
    let emissionsText = await totalEmissions.getText();
    console.log("Total de Emissões:", emissionsText);

    // Validar que o total de emissões não é 0
    assert.notStrictEqual(emissionsText, "0 tCO2e", "❌ Erro: Total de emissões não foi atualizado!");

    console.log("✅ Teste de emissões concluído!");
}

module.exports = {
    testEmissionsForm
};

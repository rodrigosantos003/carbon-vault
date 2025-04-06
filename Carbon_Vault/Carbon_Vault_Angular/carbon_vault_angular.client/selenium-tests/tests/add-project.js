const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function testAddProject(driver) {
    let url = 'http://localhost:59115/Account-project-manager/addProject';
    await driver.get(url);

    await driver.wait(until.elementLocated(By.css(".add-project-form")), 5000);

    let nameInput = await driver.findElement(By.name("nome"));
    let priceInput = await driver.findElement(By.name("preco"));
    let locationInput = await driver.findElement(By.name("localizacao"));
    let descriptionInput = await driver.findElement(By.name("descricao"));
    let benefitsInput = await driver.findElement(By.name("benefits"));
    let startDateInput = await driver.findElement(By.name("dataInicio"));
    let endDateInput = await driver.findElement(By.name("dataFim"));
    let developerInput = await driver.findElement(By.name("desenvolvedor"));
    let certifierInput = await driver.findElement(By.name("certificador"));
    let categoriesInput = await driver.findElements(By.css(".custom-checkbox"));
    let createButton = await driver.findElement(By.css(".submit-button-top"));

    await nameInput.clear();
    await nameInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "O nome é obrigatório.");
    console.log("✅ Teste de nome vazio passou");

    await nameInput.clear();
    await nameInput.sendKeys("Projeto Teste");
    await priceInput.clear();
    await priceInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "O preço tem que ser maior que 0.");
    console.log("✅ Teste de preço vazio passou");

    await priceInput.clear();
    await priceInput.sendKeys("100");
    await locationInput.clear();
    await locationInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "A localização é obrigatória.");
    console.log("✅ Teste de localização vazia passou");

    await locationInput.clear();
    await locationInput.sendKeys("Porto");
    await descriptionInput.clear();
    await descriptionInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "A descrição é obrigatória.");
    console.log("✅ Teste de descrição vazia passou");

    await descriptionInput.clear();
    await descriptionInput.sendKeys("Projeto de teste");
    await benefitsInput.clear();
    await benefitsInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "Os benefícios são obrigatórios.");
    console.log("✅ Teste de benefícios vazios passou");

    await benefitsInput.clear();
    await benefitsInput.sendKeys("Beneficios de teste");
    await startDateInput.clear();
    await startDateInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "A data de início é obrigatória.");
    console.log("✅ Teste de data de início vazia passou");

    await startDateInput.clear();
    await startDateInput.sendKeys("12122021");
    await endDateInput.clear();
    await endDateInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "A data de fim é obrigatória.");
    console.log("✅ Teste de data de fim vazia passou");

    await endDateInput.clear();
    await endDateInput.sendKeys("12122022");
    await developerInput.clear();
    await developerInput.sendKeys("");
    await createButton.click();
    await testErrorMessage(driver, "A indicação do desenvolvedor é obrigatória.");
    console.log("✅ Teste de desenvolvedor vazio passou");

    await developerInput.clear();
    await developerInput.sendKeys("Desenvolvedor Teste");
    await createButton.click();
    await testErrorMessage(driver, "A indicação da certificação é obrigatória.");
    console.log("✅ Teste de certificador vazio passou");

    await certifierInput.sendKeys("VERRA");
    await createButton.click();
    await testErrorMessage(driver, "Deve selecionar pelo menos uma categoria.");
    console.log("✅ Teste de categorias vazias passou");

    await endDateInput.clear();
    await endDateInput.sendKeys("12122011");
    await categoriesInput[0].click();
    await createButton.click();
    await testErrorMessage(driver, "A data de início não pode ser posterior à data de fim.");
    console.log("✅ Teste de data de início maior que a data de fim passou");

    await startDateInput.clear();
    await startDateInput.sendKeys("12122021");
    await endDateInput.clear();
    await endDateInput.sendKeys("12122022");
    await createButton.click();
    await driver.wait(until.urlIs('http://localhost:59115/dashboard'), 10000);
    console.log("✅ Teste de inserção de projetos passou");
}

async function testErrorMessage(driver, message) {
    await driver.wait(until.elementLocated(By.css(".error-message")), 5000);
    let errorMessage = await driver.findElement(By.css(".error-message")).getText();
    assert.strictEqual(errorMessage, message);
}

module.exports = {
    testAddProject
};

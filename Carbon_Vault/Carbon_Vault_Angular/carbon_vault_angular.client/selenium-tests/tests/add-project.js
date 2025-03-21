import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import assert from 'assert';

export async function testAddProject(driver) {
    // 4️⃣ Aceder à página de adicionar um projeto

    let url = 'http://localhost:59115/Account-project-manager/addProject';

    await driver.get(url);

    // 5️⃣ Esperar pelo form de adicionar um projeto
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

    // 6️⃣ Testa se deixa nome vazio

    await nameInput.clear();
    await nameInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "O nome é obrigatório.");

    console.log("✅ Teste de nome vazio passou");

    // 7️⃣ Testa se deixa preço vazio

    await nameInput.clear();
    await nameInput.sendKeys("Projeto Teste");
    await priceInput.clear();
    await priceInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "O preço tem que ser maior que 0.");

    console.log("✅ Teste de preço vazio passou");

    // 8️⃣ Testa se deixa localização vazia

    await priceInput.clear();
    await priceInput.sendKeys("100");
    await locationInput.clear();
    await locationInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "A localização é obrigatória.");

    console.log("✅ Teste de localização vazia passou");

    // 9️⃣ Testa se deixa descrição vazia
    
    await locationInput.clear();
    await locationInput.sendKeys("Porto");
    await descriptionInput.clear();
    await descriptionInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "A descrição é obrigatória.");

    console.log("✅ Teste de descrição vazia passou");

    // 1️⃣0️⃣ Testa se deixa benefícios vazios

    await descriptionInput.clear();
    await descriptionInput.sendKeys("Projeto de teste");
    await benefitsInput.clear();
    await benefitsInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "Os benefícios são obrigatórios.");

    console.log("✅ Teste de benefícios vazios passou");

    // 1️⃣1️⃣ Testa se deixa data de início vazia

    await benefitsInput.clear();
    await benefitsInput.sendKeys("Beneficios de teste");
    await startDateInput.clear();
    await startDateInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "A data de início é obrigatória.");

    console.log("✅ Teste de data de início vazia passou");

    // 1️⃣2️⃣ Testa se deixa data de fim vazia

    await startDateInput.clear();
    await startDateInput.sendKeys("12122021");
    await endDateInput.clear();
    await endDateInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "A data de fim é obrigatória.");

    console.log("✅ Teste de data de fim vazia passou");

    // 1️⃣3️⃣ Testa se deixa desenvolvedor vazio

    await endDateInput.clear();
    await endDateInput.sendKeys("12122022");
    await developerInput.clear();
    await developerInput.sendKeys("");
    await createButton.click();

    await testErrorMessage(driver, "A indicação do desenvolvedor é obrigatória.");

    console.log("✅ Teste de desenvolvedor vazio passou");

    // 1️⃣5️⃣ Testa se deixa certificador vazio

    await developerInput.clear();
    await developerInput.sendKeys("Desenvolvedor Teste");
    await createButton.click();

    await testErrorMessage(driver, "A indicação da certificação é obrigatória.");

    console.log("✅ Teste de certificador vazio passou");

    // 1️⃣5️⃣ Testa se deixa categorias vazias
    await certifierInput.sendKeys("VERRA");
    await createButton.click();

    await testErrorMessage(driver, "Deve selecionar pelo menos uma categoria.");

    console.log("✅ Teste de categorias vazias passou");

    // 1️⃣6️⃣ Testa se deixa data de início maior que a data de fim

    await endDateInput.clear();
    await endDateInput.sendKeys("12122011");
    await categoriesInput[0].click();
    await createButton.click();

    await testErrorMessage(driver, "A data de início não pode ser posterior à data de fim.");

    console.log("✅ Teste de data de início maior que a data de fim passou");

    // 1️⃣7️⃣ Teste de valores válidos

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
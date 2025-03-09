import { By, until, WebDriver } from 'selenium-webdriver';

export async function testRegister(driver, username, password, email, nif) {
  await driver.get('http://localhost:59115/register');

  // Esperar pelos elementos do formulário
  await driver.wait(until.elementLocated(By.id('username')), 5000);
  await driver.wait(until.elementLocated(By.id('password')), 5000);
  await driver.wait(until.elementLocated(By.id('email')), 5000);
  await driver.wait(until.elementLocated(By.id('nif')), 5000);
  let registerBtn = await driver.wait(until.elementLocated(By.css('.register-button')), 5000);

  console.log("A testar os campos obrigatórios...");

  // Testar campos obrigatórios
  await driver.findElement(By.id('username')).clear();
  await driver.findElement(By.id('password')).clear();
  await driver.findElement(By.id('email')).clear();
  await driver.findElement(By.id('nif')).clear();
  await registerBtn.click();

  let errors = await driver.findElements(By.css('.error-message'));
  if (errors.length === 0) throw new Error("Erro: Nenhuma mensagem de campo obrigatório exibida.");
  console.log("✅ Campos obrigatórios testados corretamente!");


  console.log("A testar o formato de e-mail...");
  let emailInput = await driver.findElement(By.id('email'));
  await emailInput.clear();
  await emailInput.sendKeys("email-invalido");
  await registerBtn.click();

  let emailError = await driver.findElements(By.xpath("//*[contains(text(), 'Formato de email inválido')]")).length;
  if (emailError === 0) throw new Error("Erro: Formato de email inválido não detectado.");

  await emailInput.clear();
  await emailInput.sendKeys(email);
  console.log("✅ Formato de e-mail validado!");



  console.log("A testar critérios de password...");
  let passwordInput = await driver.findElement(By.id('password'));

  const passwordTests = [
    { value: "short", message: "A senha deve ter pelo menos 8 caracteres" },
    { value: "lowercase1!", message: "A senha deve conter pelo menos uma letra maiúscula" },
    { value: "UPPERCASE1!", message: "A senha deve conter pelo menos uma letra minúscula" },
    { value: "Uppercase1", message: "A senha deve conter pelo menos um caractere especial" }
  ];

  for (let test of passwordTests) {
    await passwordInput.clear();
    await passwordInput.sendKeys(test.value);
    await registerBtn.click();
    let errorPresent = await driver.findElements(By.xpath(`//*[contains(text(), '${test.message}')]`)).length;
    if (errorPresent === 0) throw new Error(`Erro: ${test.message} não detectada.`);
  }

  await passwordInput.clear();
  await passwordInput.sendKeys(password);
  console.log("✅ Critérios de password validados!");



  console.log("Testando NIF...");
  let nifInput = await driver.findElement(By.id('nif'));

  await nifInput.clear();
  await nifInput.sendKeys("12345");
  await registerBtn.click();
  let nifError = await driver.findElements(By.xpath("//*[contains(text(), 'NIF inválido')]")).length;
  if (nifError === 0) throw new Error("Erro: NIF inválido não detectado.");

  await nifInput.clear();
  await nifInput.sendKeys(nif);

  console.log("Testando envio do formulário...");
  let usernameInput = await driver.findElement(By.id('username'));
  await usernameInput.clear();
  await usernameInput.sendKeys(username);

  await registerBtn.click();

  try {
    await driver.wait(until.alertIsPresent(), 5000);
    let alert = await driver.switchTo().alert();
    console.log("Alerta encontrado:", await alert.getText());
    await alert.accept();
  } catch (e) {
    console.log("Nenhum alerta encontrado.");
  }

  await driver.wait(until.urlContains('/login'), 10000);
  console.log("Registro realizado com sucesso e redirecionado para login!");
}

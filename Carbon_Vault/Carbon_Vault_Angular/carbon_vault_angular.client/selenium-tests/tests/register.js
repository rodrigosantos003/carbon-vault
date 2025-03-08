import { By, until, WebDriver } from 'selenium-webdriver';

export async function testRegister(driver, username, password, email, nif) {
  await driver.get('http://localhost:59115/register');

  // Wait for the form elements to be visible
  await driver.wait(until.elementLocated(By.id('username')), 5000);
  await driver.wait(until.elementLocated(By.id('password')), 5000);
  await driver.wait(until.elementLocated(By.id('email')), 5000);
  await driver.wait(until.elementLocated(By.id('nif')), 5000);
  let registerBtn = await driver.wait(until.elementLocated(By.css('.register-button')), 5000);

  // Fill in the form fields
  await driver.findElement(By.id('username')).sendKeys(username);
  await driver.findElement(By.id('password')).sendKeys(password);
  await driver.findElement(By.id('email')).sendKeys(email);
  await driver.findElement(By.id('nif')).sendKeys(nif);

  // Click the register button
  await registerBtn.click();

  // Lidar com alerta (se aparecer)
  try {
    await driver.wait(until.alertIsPresent(), 5000);
    let alert = await driver.switchTo().alert();
    console.log("Alerta encontrado:", await alert.getText());
    await alert.accept();
  } catch (e) {
    console.log("Nenhum alerta encontrado.");
  }

  // Wait for redirection to the login page
  await driver.wait(until.urlContains('/login'), 10000);
}

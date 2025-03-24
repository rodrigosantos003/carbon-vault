import { By, until, WebDriver } from 'selenium-webdriver';

export async function testBuyCredits(driver) {
    console.log("A iniciar aquisição...");
    await driver.get('http://localhost:59115/marketplace');

    let buyBtn = await driver.wait(until.elementLocated(By.css(".buy-btn")), 5000);
    await buyBtn.click();
    console.log("Adicionou projeto")

    await driver.get('http://localhost:59115/cart');

    let checkoutBtn = await driver.wait(until.elementLocated(By.css(".checkout")), 5000);
    checkoutBtn.click();
    console.log("Realizou checkout")

    await driver.wait(until.urlContains('stripe'), 10000);

    console.log("✅ Aquisição bem sucedida");
}
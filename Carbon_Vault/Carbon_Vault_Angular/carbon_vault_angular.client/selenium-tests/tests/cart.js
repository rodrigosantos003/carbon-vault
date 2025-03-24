import { By, until, WebDriver } from 'selenium-webdriver';

export async function testCart(driver) {
    console.log("A iniciar teste carrinho...");
    await driver.get('http://localhost:59115/cart');

    let increment = await driver.wait(until.elementLocated(By.id("increment-btn")), 5000);

    await increment.click();
    console.log("Incrementou item");

    let decrement = await driver.wait(until.elementLocated(By.id("decrement-btn")), 5000);
    await decrement.click();
    console.log("Decrementou item");

    let remove = await driver.wait(until.elementLocated(By.css(".cart-remove")), 5000);
    await remove.click();
    console.log("Removeu item");

    console.log("✅ Gestão do carrinho bem sucedida");
}
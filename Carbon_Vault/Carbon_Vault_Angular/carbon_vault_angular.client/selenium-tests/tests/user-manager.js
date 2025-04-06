const { By, until } = require('selenium-webdriver');

async function testUserManager(driver) {
    console.log("A iniciar gestão de utilizadores...");
    await driver.get('http://localhost:59115/users-manager');

    let viewBtn = await driver.findElement(By.css(".view-btn"));
    await viewBtn.click();

    await driver.wait(until.urlContains('/user-details'), 10000);
    console.log("✅ Visualização passou");

    await driver.get('http://localhost:59115/users-manager');

    let deleteBtn = await driver.findElement(By.css(".delete-btn"));
    await deleteBtn.click();

    let confirmDelete = await driver.findElement(By.css(".delete-button"));
    console.log("✅ Confirmação passou");
    await confirmDelete.click();
    console.log("✅ Eliminação de conta passou");

    let addBtn = await driver.findElement(By.css(".add-btn"));
    await addBtn.click();

    let name = await driver.findElement(By.id("userName"));
    await name.sendKeys("António");

    let email = await driver.findElement(By.id("userEmail"));
    await email.sendKeys("antonio@carbonvault.com");

    let nif = await driver.findElement(By.id("userNIF"));
    await nif.sendKeys("123456789");

    let type = await driver.findElement(By.id("userRole"));
    await type.findElement(By.css("option[value='admin']")).click(); // Substitui o uso de Select

    let saveBtn = await driver.findElement(By.css(".save"));
    await saveBtn.click();
    console.log("✅ Admin adicionado com sucesso");

    console.log("✅ Gestão bem sucedida");
}

module.exports = {
    testUserManager
};

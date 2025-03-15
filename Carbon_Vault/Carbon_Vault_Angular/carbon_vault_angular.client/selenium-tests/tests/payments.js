import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import assert from 'assert';

export async function testPayment(driver) {
    await driver.get('http://localhost:59115/')
}
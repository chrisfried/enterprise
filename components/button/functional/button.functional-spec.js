const r2 = require('r2');

const username = process.env.BROWSER_STACK_USERNAME;
const accessKey = process.env.BROWSER_STACK_ACCESS_KEY;

const browserStackErrorReporter = async (done, error) => {
  const session = await browser.driver.getSession();
  const sessionId = session.getId();
  const url = `https://${username}:${accessKey}@api.browserstack.com/automate/sessions/${sessionId}.json`;
  const obj = {
    status: 'error',
    reason: error.name
  };
  await r2.put(url, { json: obj }).json;
  done.fail(error);
};

const setupButton = async (url, el) => {
  await browser.waitForAngularEnabled(false);
  await browser.driver.get(url);
  const buttonEl = await element(by.css(el));
  await browser.driver.wait(protractor.ExpectedConditions.presenceOf(buttonEl), 5000);
};

describe('Button tests', () => {
  it('Should open menu on return', async (done) => {
    try {
      await setupButton('http://localhost:4000/components/button/example-with-icons', '#menu-button-alone');
      const buttonEl = await element(by.id('menu-button-alone'));

      await buttonEl.sendKeys(protractor.Key.ENTER);

      expect(await element(by.css('.btn-menu.is-open')).isDisplayed()).toBe(true);
      expect(await element(by.css('button#menu-button-alone[aria-haspopup="true"]')).isDisplayed()).toBe(true);
      done();
    } catch (error) {
      await browserStackErrorReporter(done, error);
    }
  });

  it('Should open menu on click', async (done) => {
    try {
      await setupButton('http://localhost:4000/components/button/example-with-icons', '#menu-button-alone');
      const buttonEl = await element(by.id('menu-button-alone'));

      await buttonEl.click();

      expect(await element(by.css('.btn-menu.is-open')).isDisplayed()).toBe(true);
      expect(await element(by.css('button#menu-button-alone[aria-haspopup="true"]')).isDisplayed()).toBe(true);
      done();
    } catch (error) {
      await browserStackErrorReporter(done, error);
    }
  });
});
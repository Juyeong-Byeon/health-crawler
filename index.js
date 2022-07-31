const { Builder, Browser, By, Key, until } = require('selenium-webdriver');

async function download(searchCode) {
    let driver = new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('http://opendata.hira.or.kr/op/opc/olapMaterial.do');
        await driver.findElement(By.id('m3')).click();
        //Store the ID of the original window
        const originalWindow = await driver.getWindowHandle();

        await driver.findElement(By.id('searchWrd2')).click();

        // //Wait for the new window or tab
        await driver.wait(
            async () => (await driver.getAllWindowHandles()).length === 2,
            500
        );

        //Loop through until we find a new window handle
        const windows = await driver.getAllWindowHandles();
        windows.forEach(async handle => {
            if (handle !== originalWindow) {
                await driver.switchTo().window(handle);
            }
        });



        //Wait for the new tab to finish loading content
        await driver.wait(until.titleIs("중분류코드조회 팝업 | HIRA"), 1000000);
        await driver.findElement(By.id('searchWrd2')).click();
        await driver.actions().sendKeys(searchCode).perform()
        await driver.findElement(By.id('searchBtn2')).click();

        const resultElement = driver.findElement(By.className('select'))
        await driver.wait(until.elementIsVisible(resultElement), 1000000);
        await resultElement.click();

        await driver.switchTo().window(originalWindow);

        // Store the web element
        const iframe = driver.findElement(By.css('.olap-box > iframe'));

        // Switch to the frame
        await driver.switchTo().frame(iframe);
        await driver.wait(until.elementLocated(By.className('dt-btn-search')), 1000000);
        await driver.findElement(By.className('dt-btn-search')).click();


        await driver.wait(until.elementLocated(By.className('m-datagrid-cell')), 1000000);
        await driver.wait(until.elementLocated(By.className('dock_title_btnarea')), 1000000);


        await driver.findElement(By.xpath('//*[@id="panel-1104-body"]/div/div[1]/div[1]/div[2]/div[1]')).click();

    } catch(e){
        console.error(`${searchCode} fail`)
        await driver.quit()
    }finally {
        console.log(`${searchCode} success`)
        return setTimeout(() => driver.quit(), 10000);

    }
}


function main(){
    const codeList=process.argv[2].split(',');
    return codeList.forEach((code)=>download(code))
}

main();
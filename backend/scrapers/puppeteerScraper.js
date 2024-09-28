const puppeteer = require("puppeteer");

exports.scrape = async (url) => {
  const browser = await puppeteer.launch({
    headless: true, // Set to true if you don't want to see the browser
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set a user-agent to mimic a regular browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );

  const website = url.websiteId;
  const wrapperSelector = website.wrapperSelector;
  const fieldSelectors = website.scrapFields; // Array of field selectors
  const nextPageSelector = url.nextPageSelector; // Selector for the "Next" button
  const pageLimit = url.pageLimit || 10;

  let scrapedDataArray = [];

  let hasNextPage = true;
  let pageNum = 1; // You can limit the number of pages by incrementing this

  while (hasNextPage) {
    // Navigate to the current page
    await page.goto(url.url, { waitUntil: "networkidle2" });

    try {
      await page.waitForSelector(wrapperSelector, { timeout: 15000 });
    } catch (error) {
      console.error(`Error: Wrapper selector "${wrapperSelector}" not found!`);
      await browser.close();
      return scrapedDataArray; // Return the data scraped so far
    }

    // Scrape data using evaluate
    const currentPageData = await page.evaluate((wrapperSelector, fieldSelectors) => {
      const wrapper = document.querySelector(wrapperSelector);

      if (!wrapper || wrapper.childNodes.length < 1) return [];

      // Ensure you get multiple wrappers
      return Array.from(wrapper.childNodes).map((wrapper, index) => {
        const scrapedItem = {};

        // Iterate through each field selector
        fieldSelectors.forEach((field) => {
          const dynamicSelector = field.selector.replace("{{index}}", index + 1);
          const element = wrapper.querySelector(dynamicSelector);

          // Handle different content types based on field.contentType
          if (element) {
            switch (field.contentType) {
              case "href":
                scrapedItem[field.fieldTitle] = element.href ? element.href.trim() : "";
                break;
              case "src":
                scrapedItem[field.fieldTitle] = element.src ? element.src.trim() : "";
                break;
              case "value":
                scrapedItem[field.fieldTitle] = element.value ? element.value.trim() : "";
                break;
              case "innerText":
              default:
                scrapedItem[field.fieldTitle] = element.innerText ? element.innerText.trim() : "";
                break;
            }
          } else {
            scrapedItem[field.fieldTitle] = ""; // Empty if element not found
          }
        });

        return scrapedItem;
      });
    }, wrapperSelector, fieldSelectors);

    // Append current page data to the scraped data array
    scrapedDataArray = [...scrapedDataArray, ...currentPageData];

    // Check if there is a next page button
    hasNextPage = await page.evaluate((nextPageSelector) => {
      const nextButton = document.querySelector(nextPageSelector);
      return nextButton ? true : false;
    }, nextPageSelector);

    if (hasNextPage) {
      // Click on the "Next" button
      await Promise.all([page.click(nextPageSelector), page.waitForNavigation({ waitUntil: "networkidle2" })]);

      // Optionally limit pages to avoid infinite loops or excessive scraping
      pageNum++;
      if (pageNum > pageLimit) { // Example limit to 10 pages
        hasNextPage = false;
      }
    }
  }

  await browser.close();
  return scrapedDataArray;
};

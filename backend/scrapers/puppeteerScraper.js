const puppeteer = require("puppeteer");
const ScrapeData = require("../models/ScrapeData");

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

exports.scrape = async (url) => {
  const browser = await puppeteer.launch({
    headless: true, // Set to true if you don't want to see the browser
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Set a user-agent to mimic a regular browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );

  const website = url.websiteId;
  const urlId = url._id;
  const wrapperSelector = website.wrapperSelector;
  const fieldSelectors = website.scrapFields; // Array of field selectors
  const nextPageSelector = url.nextPageSelector; // Selector for the "Next" button
  const popupCloseSelector = url.popupCloseSelector;
  const isOnScroll = url.isOnScroll || false;
  const pageLimit = url.pageLimit || 10;

  let scrapedItemsCount = { wrappersCount: 0, ItemsCount: 0 }; // Track the number of already scraped items
  let pageNum = 1;
  let hasNextPage = true;

  const closePopup = async () => {
    const isPopupVisible = await page.$(popupCloseSelector); // Check if popup is present
    if (isPopupVisible) {
      await page.click(popupCloseSelector); // Click on the close button
      await delay(1000);
    }
  };

  // Function to scrape data from the page
  const scrapeData = async (startFromIndex = scrapedItemsCount) => {
    if (popupCloseSelector) await closePopup();

    return await page.evaluate(
      (wrapperSelector, fieldSelectors, startFromIndex) => {
        const wrappers = document.querySelectorAll(wrapperSelector); // Get all matching elements
        if (!wrappers || wrappers.length < 1)
          return { scrapedItems: [], wrappersLength: 0 }; // Check if wrappers exist

        let scrapedItems = []; // Array to hold all scraped items
        
        const { wrappersCount, ItemsCount } = startFromIndex;
        // Loop through each wrapper found by the selector, starting from the wrappersCount
        for (
          let wrapperIndex = wrappersCount;
          wrapperIndex < wrappers.length;
          wrapperIndex++
        ) {
          const wrapper = wrappers[wrapperIndex]; // Get the current wrapper
          

          if (!wrapper) continue;
       
          // Get the child nodes and slice based on already scraped ItemsCount
          const childNodes = Array.from(wrapper.childNodes).slice(ItemsCount);
         

          if (!childNodes || childNodes.length < 1) continue;
        
          // Loop through the remaining (new) child nodes
          childNodes.forEach((childNode) => {

            let scrapedItem = {};
            // Check if the childNode is an element (to avoid text nodes, etc.)
            if (childNode.nodeType === Node.ELEMENT_NODE) {
              fieldSelectors.forEach((field) => {
                const dynamicSelector = field.selector.replace(
                  "{{index}}",
                  wrapperIndex + 1 // Use the wrapper index for dynamic selectors
                );

                // Check if this childNode matches the dynamicSelector
                const element = childNode.querySelector(dynamicSelector);
                if (element) {
                  switch (field.contentType) {
                    case "href":
                    
                      scrapedItem[field.fieldTitle] = element.href
                        ? element.href.trim()
                        : "";
                      break;
                    case "src":
              
                      scrapedItem[field.fieldTitle] = element.src
                        ? element.src.trim()
                        : "";
                      break;
                    case "value":
                      
                      scrapedItem[field.fieldTitle] = element.value
                        ? element.value.trim()
                        : "";
                      break;
                    case "innerText":
                    default:
                      
                      scrapedItem[field.fieldTitle] = element.innerText
                        ? element.innerText.trim()
                        : "";
                      break;
                  }
                    
                } 
              });

              if(Object.keys(scrapedItem).length > 0)
                scrapedItems.push(scrapedItem);
              
            }

          

          });
        }
       
        return { scrapedItems, wrappersLength: wrappers.length }; // Return all scraped items
      },
      wrapperSelector,
      fieldSelectors,
      startFromIndex
    );
  };

  // Navigate to the initial page
  await page.goto(url.url, { waitUntil: "networkidle2" });

  try {
    await page.waitForSelector(wrapperSelector, { timeout: 15000 }); // Wait until the wrapper appears
  } catch (error) {
    console.error(`Error: Wrapper selector "${wrapperSelector}" not found!`);
   
    await browser.close();
    throw new Error(`Error: Wrapper selector "${wrapperSelector}" not found!`);
  }

  if (isOnScroll) {
    // Handle infinite scrolling with a limit on scrolls
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);

    while (hasNextPage && pageNum <= pageLimit) {
      // Scrape the current content of the page, but only scrape new items
      const currentPageData = await scrapeData(scrapedItemsCount);
      const scrapedItems = currentPageData.scrapedItems;
      
      if (currentPageData.wrappersLength <= 1) {
        scrapedItemsCount.wrappersCount = 0;
        scrapedItemsCount.ItemsCount += scrapedItems.length;
      } else {
        scrapedItemsCount.wrappersCount = currentPageData.wrappersLength;
        scrapedItemsCount.ItemsCount = 0;
      }

      // Merge the newly scraped items with the existing ones
      for (let scrapedItem of scrapedItems) {
        await new ScrapeData({ urlId, data: scrapedItem }).save();
        }
      // Scroll down to load more content
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for new content to load, or time out if nothing new appears
      await page.waitForFunction(
        `document.body.scrollHeight > ${lastHeight}`, // Wait for page height to increase
        { timeout: 10000 }
      );

      // Optionally wait for new elements to load inside the wrapper
      await page.waitForSelector(wrapperSelector, { timeout: 10000 });
      await delay(1000);
      // Check if new content was loaded
      let newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === lastHeight) {
        hasNextPage = false; // No more content to load
      } else {
        lastHeight = newHeight;
        pageNum++;
      }
    }
  } else {
    // Handle pagination with "Next" button
    while (hasNextPage && pageNum <= pageLimit) {
      // Scrape data using the shared function, only new items
      const currentPageData = await scrapeData(scrapedItemsCount);
      const scrapedItems = currentPageData.scrapedItems;

      scrapedItemsCount.wrappersCount = 0;
      scrapedItemsCount.ItemsCount = 0;
      // Merge the newly scraped items with the existing ones
      for (let scrapedItem of scrapedItems) {
        await new ScrapeData({ urlId, data: scrapedItem }).save();
        }
      // Check if there is a next page button
      hasNextPage = await page.evaluate((nextPageSelector) => {
        const nextButton = document.querySelector(nextPageSelector);
        return nextButton ? true : false;
      }, nextPageSelector);

      if (hasNextPage) {
        // Click on the "Next" button
        await Promise.all([
          page.click(nextPageSelector),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);

        // Wait for the new content to load after clicking "Next"
        await page.waitForSelector(wrapperSelector, { timeout: 15000 }); // Wait for the wrapper to load again
        await delay(1000);
        pageNum++;
      }
    }
  }

   await browser.close();
};

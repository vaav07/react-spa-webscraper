const puppeteer = require("puppeteer");
const fs = require("fs").promises;

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = process.env.URL;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Function to scroll and load more content
    async function loadMoreContent() {
      const previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      ); // 2 second delay
      const newHeight = await page.evaluate("document.body.scrollHeight");
      return newHeight > previousHeight;
    }

    // Keep scrolling until all content is loaded
    let hasMoreContent = true;
    while (hasMoreContent) {
      hasMoreContent = await loadMoreContent();
      console.log("Loading more content...");
    }

    const hrefs = await page.evaluate(() => {
      const anchors = document.querySelectorAll(
        ".flexible-content .company-info a"
      );
      return Array.from(anchors).map((anchor) => anchor.href);
    });

    // Create a JavaScript file with the array of links
    const jsContent = `const companyLinks = ${JSON.stringify(hrefs, null, 2)};

module.exports = companyLinks;
`;

    // Save the array to a new JavaScript file
    await fs.writeFile("companyLinks.js", jsContent);

    await browser.close();
    console.log(
      `Scraping completed. ${hrefs.length} links saved to companyLinks.js`
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

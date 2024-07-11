const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

// Import the array of links
const companyLinks = require("./limitedArray.js");

async function scrapeCompanyDetails(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    const companyDetails = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : "N/A";
      };

      const getHref = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.href : "N/A";
      };

      return {
        name: getTextContent(".details-header h1"),
        country:
          document
            .querySelector("#exhibitor_details_address p span:last-child")
            ?.textContent.trim() || "N/A",
        email: getTextContent("#exhibitor_details_email p"),
        website: getHref("#exhibitor_details_website p a"),
        telephone: getTextContent("#exhibitor_details_phone p"),
        address: Array.from(
          document.querySelectorAll("#exhibitor_details_address p span")
        )
          .map((span) => span.textContent.trim())
          .join(", "),
        stand: getTextContent(".display-stands p"),
        linkedin:
          getHref('.social-media-logo-container a[href*="linkedin.com"]') ||
          "N/A",
      };
    });

    return companyDetails;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function scrapeAllCompanies() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (let i = 0; i < companyLinks.length; i++) {
    console.log(`Scraping company ${i + 1} of ${companyLinks.length}`);

    const details = await scrapeCompanyDetails(page, companyLinks[i]);

    if (details) {
      results.push({
        url: companyLinks[i],
        // ...details
        "Company Name": details.name,
        "Contact Person": "", // Empty field
        Designation: "", // Empty field
        Country: details.country,
        Email: details.email,
        Website: details.website,
        Telephone: details.telephone,
        Mobile: "", // Empty field
        Address: details.address,
        Hall: "", // Empty field
        Stand: details.stand,
        "Linkedin Company Page": details.linkedin,
      });
    } else {
      results.push({
        url: companyLinks[i],
        "Company Name": "N/A",
        "Contact Person": "", // Empty field
        Designation: "", // Empty field
        Country: "N/A",
        Email: "N/A",
        Website: "N/A",
        Telephone: "N/A",
        Mobile: "", // Empty field
        Address: "N/A",
        Hall: "", // Empty field
        Stand: "N/A",
        "Linkedin Company Page": "N/A",
        error: "Failed to scrape",
      });
    }

    // Optional: add a delay to avoid overloading the server
    // await page.waitForTimeout(1000);
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 3000))
    ); // 3 second delay
  }

  await browser.close();
  return results;
}

function saveToExcel(data) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Company Details");
  XLSX.writeFile(workbook, "companyDetails.xlsx");
}

(async () => {
  try {
    const scrapedData = await scrapeAllCompanies();
    saveToExcel(scrapedData);
    console.log("Scraping completed. Data saved to companyDetails.xlsx");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

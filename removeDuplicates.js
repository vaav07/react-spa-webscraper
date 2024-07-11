const fs = require("fs");
const array = require("./companyLinks");

// Function to remove duplicates using Set
const removeDuplicates = (arr) => [...new Set(arr)];

const uniqueArray = removeDuplicates(array);

// Write the unique array to a new file
fs.writeFile(
  "uniqueArray.js",
  `const uniqueArray = ${JSON.stringify(
    uniqueArray
  )};\n\nmodule.exports = uniqueArray;`,
  (err) => {
    if (err) throw err;
    console.log("The file has been saved with unique array!");
  }
);

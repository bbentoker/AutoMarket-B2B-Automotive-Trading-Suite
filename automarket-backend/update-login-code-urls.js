const fs = require('fs');
const path = require('path');

// Read the weekly report template file
const filePath = path.join(__dirname, 'src/templates/emails/stages/weeklyDealerReport.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining occurrences of loginCode with userLoginCode in carSoldContainer calls
const updatedContent = content.replace(
  /carSoldContainer\(\{ car, index: index \+ 1, language, loginCode \}\)/g,
  'carSoldContainer({ car, index: index + 1, language, loginCode: userLoginCode })'
);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('✅ Updated all loginCode references to userLoginCode in weekly report template');

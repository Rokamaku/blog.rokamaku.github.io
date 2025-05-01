/**
 * Script to add the config.js reference to HTML files
 * Run with: node .github/scripts/add-config-to-html.js
 */

const fs = require('node:fs')
const path = require('node:path')

// Directories to scan for HTML files
const directories = ['public', 'dist']

// Find HTML files in the given directories
function findHtmlFiles(dir) {
  const results = []

  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, skipping.`)
    return results
  }

  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      results.push(...findHtmlFiles(itemPath))
    }
    else if (item.isFile() && item.name.endsWith('.html')) {
      results.push(itemPath)
    }
  }

  return results
}

// Add config.js to HTML files before random-background.js
function addConfigToHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Check if random-background.js is included in the file
  if (content.includes('random-background.js') && !content.includes('config.js')) {
    // Add config.js before random-background.js
    content = content.replace(
      /<script.*?src=["'](.+?)random-background\.js["'].*?><\/script>/i,
      '<script src="/js/config.js"></script>\n    $&',
    )

    // Write the modified content back to the file
    fs.writeFileSync(filePath, content)
    console.log(`✅ Added config.js to ${filePath}`)
    return true
  }

  return false
}

// Main function
function main() {
  let htmlFiles = []
  let modifiedFiles = 0

  // Find all HTML files
  for (const dir of directories) {
    htmlFiles.push(...findHtmlFiles(dir))
  }

  console.log(`Found ${htmlFiles.length} HTML files to process.`)

  // Process each HTML file
  for (const file of htmlFiles) {
    if (addConfigToHtml(file)) {
      modifiedFiles++
    }
  }

  console.log(`\nModified ${modifiedFiles} HTML files to include config.js.`)

  if (modifiedFiles === 0) {
    console.log(`
No files were modified. This could be because:
1. The config.js script is already included in all HTML files
2. No HTML files include random-background.js
3. The HTML files are using a different structure than expected

You may need to manually add the config.js script before random-background.js in your HTML files:

<script src="/js/config.js"></script>
<script src="/js/random-background.js"></script>
`)
  }
}

main()

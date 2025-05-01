/**
 * Local test script for background image scanning
 * Run with: node .github/scripts/test-background-scanning.js
 *
 * This script scans the backgrounds directories and creates index.json files
 * in a temp directory, simulating what the GitHub Action would do.
 */

const fs = require('node:fs')
const path = require('node:path')

// Directories to scan
const lightDir = 'public/images/backgrounds/light'
const darkDir = 'public/images/backgrounds/dark'

// Function to scan a directory and create index.json
function scanDirectory(dirPath) {
  console.log(`Scanning directory: ${dirPath}`)

  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory does not exist: ${dirPath}`)
    return { images: [] }
  }

  // Get all files with supported image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  const images = fs.readdirSync(dirPath)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return validExtensions.includes(ext) && fs.statSync(path.join(dirPath, file)).isFile()
    })

  // Create index.json content
  const indexContent = {
    images,
    lastUpdated: new Date().toISOString(),
  }

  // Create temp directory if it doesn't exist
  const tempDir = '.tmp-r2-upload'
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  // Write index.json to temp directory
  const indexFilePath = path.join(tempDir, `${path.basename(dirPath)}-index.json`)
  fs.writeFileSync(indexFilePath, JSON.stringify(indexContent, null, 2))

  console.log(`✅ Created ${indexFilePath} with ${images.length} images`)
  console.log('Images found:')
  images.forEach(img => console.log(`  - ${img}`))

  return { images, indexFilePath }
}

// Scan both directories
console.log('\n📁 Scanning Light Mode Background Images:')
const lightResult = scanDirectory(lightDir)

console.log('\n📁 Scanning Dark Mode Background Images:')
const darkResult = scanDirectory(darkDir)

console.log('\n✅ Summary:')
console.log(`Light mode images: ${lightResult.images.length}`)
console.log(`Dark mode images: ${darkResult.images.length}`)
console.log(`\nTo see the generated index files, check the .tmp-r2-upload directory.`)
console.log(`\nIn a real deployment, these would be uploaded to Cloudflare R2 at:`)
console.log(`- /backgrounds/light/index.json`)
console.log(`- /backgrounds/dark/index.json`)

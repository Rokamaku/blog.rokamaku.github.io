// Base paths for light and dark background folders on Cloudflare R2
const r2BaseUrl = `https://${window.ENV_CLOUDFLARE_DOMAIN}` || ''
const lightBackgroundPath = `${r2BaseUrl}/backgrounds/light/`
const darkBackgroundPath = `${r2BaseUrl}/backgrounds/dark/`

// Arrays to store the discovered images
let lightBackgroundImages = []
let darkBackgroundImages = []

// Function to fetch available images from a directory
async function fetchBackgroundImages() {
  try {
    // Fetch light mode images
    const lightResponse = await fetch(`${lightBackgroundPath}index.json`)
    if (lightResponse.ok) {
      const lightData = await lightResponse.json()
      lightBackgroundImages = lightData.images.map(img => `${lightBackgroundPath}${img}`)
    }
    else {
      console.warn('Could not load light background index, using fallback images')
      // Fallback to some hardcoded images if index.json is not available
      lightBackgroundImages = [
        '/images/backgrounds/light/carolinie-cavalli-Qw3w0oBH63s-unsplash.jpg',
      ]
    }

    // Fetch dark mode images
    const darkResponse = await fetch(`${darkBackgroundPath}index.json`)
    if (darkResponse.ok) {
      const darkData = await darkResponse.json()
      darkBackgroundImages = darkData.images.map(img => `${darkBackgroundPath}${img}`)
    }
    else {
      console.warn('Could not load dark background index, using fallback images')
      // Fallback to some hardcoded images if index.json is not available
      darkBackgroundImages = [
        '/images/backgrounds/dark/bence-halmosi-tOJlSyyOtPU-unsplash.jpg',
      ]
    }

    // Load existing background if stored, but don't set a new random one
    loadStoredBackground()
  }
  catch (error) {
    console.error('Error fetching background images:', error)
    // Use hardcoded fallbacks in case of error
    lightBackgroundImages = [
      '/images/backgrounds/light/carolinie-cavalli-Qw3w0oBH63s-unsplash.jpg',
    ]
    darkBackgroundImages = [
      '/images/backgrounds/dark/bence-halmosi-tOJlSyyOtPU-unsplash.jpg',
    ]
    loadStoredBackground()
  }
}

// Function to set a random background image
function setRandomBackground() {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const imageArray = isDarkMode ? darkBackgroundImages : lightBackgroundImages

  // If there are no images for the current mode, don't change anything
  if (imageArray.length === 0)
    return

  const randomIndex = Math.floor(Math.random() * imageArray.length)
  const selectedImage = imageArray[randomIndex]

  // Create a CSS rule to override the background image
  const styleSheet = document.createElement('style')
  styleSheet.id = 'random-background-style'
  styleSheet.textContent = `
    html${isDarkMode ? '.dark' : ''}::before {
      background-image: url('${selectedImage}') !important;
    }
  `

  // Remove any existing style element
  const existingStyle = document.getElementById('random-background-style')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Append the new style to the head
  document.head.appendChild(styleSheet)

  // Store the chosen image in local storage
  localStorage.setItem(isDarkMode ? 'selectedDarkBackground' : 'selectedLightBackground', selectedImage)
}

// Load background from storage if it exists
function loadStoredBackground() {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const storedKey = isDarkMode ? 'selectedDarkBackground' : 'selectedLightBackground'
  const storedBackground = localStorage.getItem(storedKey)

  if (storedBackground) {
    // Use the stored background
    const styleSheet = document.createElement('style')
    styleSheet.id = 'random-background-style'
    styleSheet.textContent = `
      html${isDarkMode ? '.dark' : ''}::before {
        background-image: url('${storedBackground}') !important;
      }
    `
    document.head.appendChild(styleSheet)
  }
  // Don't set a random background if no stored one exists
}

// Fetch background images when the page loads
document.addEventListener('DOMContentLoaded', fetchBackgroundImages)

// Reload stored background when theme changes
document.addEventListener('theme-changed', loadStoredBackground)

// Function to manually trigger a new random background
window.changeBackground = function () {
  setRandomBackground()
}

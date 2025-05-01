// Base paths for light and dark background folders on Cloudflare R2
const r2BaseUrl = window.ENV_CLOUDFLARE_DOMAIN ? `https://${window.ENV_CLOUDFLARE_DOMAIN}` : ''
const lightBackgroundPath = `${r2BaseUrl}/backgrounds/light/`
const darkBackgroundPath = `${r2BaseUrl}/backgrounds/dark/`

// Arrays to store the discovered images
let lightBackgroundImages = []
let darkBackgroundImages = []

// Create and append base style for background transitions if not already present
function setupBackgroundTransitions() {
  if (!document.getElementById('background-transition-style')) {
    const transitionStyle = document.createElement('style')
    transitionStyle.id = 'background-transition-style'
    transitionStyle.textContent = `
      html::before,
      html.dark::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition: opacity 0.8s ease;
        opacity: 1;
      }
    `
    document.head.appendChild(transitionStyle)

    // Force the creation of the pseudo-elements if they don't exist yet
    if (!document.getElementById('background-placeholders')) {
      const placeholderStyle = document.createElement('style')
      placeholderStyle.id = 'background-placeholders'
      placeholderStyle.textContent = `
        html::before { background-color: rgba(240, 240, 240, 0.1); }
        html.dark::before { background-color: rgba(20, 20, 20, 0.1); }
      `
      document.head.appendChild(placeholderStyle)
    }
  }
}

// Function to fetch available images from a directory
async function fetchBackgroundImages() {
  // Setup transition styles first
  setupBackgroundTransitions()

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

  // Apply with fade animation
  setBackgroundWithAnimation(selectedImage, isDarkMode)

  // Store the chosen image in local storage
  localStorage.setItem(isDarkMode ? 'selectedDarkBackground' : 'selectedLightBackground', selectedImage)
}

// Load background from storage if it exists, or set a random one
function loadStoredBackground() {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const storedKey = isDarkMode ? 'selectedDarkBackground' : 'selectedLightBackground'
  const storedBackground = localStorage.getItem(storedKey)

  if (storedBackground) {
    // Use the stored background with animation
    setBackgroundWithAnimation(storedBackground, isDarkMode)
  }
  else {
    // No stored background for this theme, set a random one
    setRandomBackground()
  }
}

// Helper function to apply background with fade animation
function setBackgroundWithAnimation(imageUrl, isDarkMode) {
  // Get existing style element or create new one
  let styleElement = document.getElementById('random-background-style')
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'random-background-style'
    document.head.appendChild(styleElement)
  }

  // Start the fade-out animation
  const selector = `html${isDarkMode ? '.dark' : ''}::before`
  document.querySelector(selector)?.style.setProperty('opacity', '0')

  // After fade-out completes, update the background image and fade back in
  setTimeout(() => {
    styleElement.textContent = `
      ${selector} {
        background-image: url('${imageUrl}') !important;
      }
    `
    document.querySelector(selector)?.style.setProperty('opacity', '1')
  }, 400) // Half of the total transition time for a smooth crossfade
}

// Fetch background images when the page loads
document.addEventListener('DOMContentLoaded', fetchBackgroundImages)

// Reload stored background when theme changes
document.addEventListener('theme-changed', loadStoredBackground)

// Function to manually trigger a new random background
window.changeBackground = function () {
  setRandomBackground()
}

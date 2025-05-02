// Base paths for light and dark background folders on Cloudflare R2
const r2BaseUrl = window.PUBLIC_CLOUDFLARE_DOMAIN
  ? `https://${window.PUBLIC_CLOUDFLARE_DOMAIN}`
  : "";
const lightBackgroundPath = `${r2BaseUrl}/backgrounds/light/`;
const darkBackgroundPath = `${r2BaseUrl}/backgrounds/dark/`;

// Arrays to store the discovered images
let lightBackgroundImages = [];
let darkBackgroundImages = [];
let preloadedImages = new Map(); // Cache for preloaded images

// Make initialization more robust and add a debug flag
let isBackgroundLoading = false;
const DEBUG = true;

// Flag to track if initial background is already set
let isBackgroundInitialized = false;

// Immediately set up the loading overlay when the script loads for the first time
// This ensures the loading overlay appears before any images are loaded
window.addEventListener("DOMContentLoaded", function () {
  if (!isBackgroundInitialized) {
    createLoadingOverlay();
  }
});

// Setup loading overlay
function createLoadingOverlay() {
  // Check if the overlay already exists
  if (!document.getElementById("background-loading-overlay")) {
    const overlay = document.createElement("div");
    overlay.id = "background-loading-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-color, rgba(255, 255, 255, 0.6));
      z-index: 100000;
      opacity: 1;
      transition: opacity 0.5s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: all;
      backdrop-filter: blur(3px);
    `;

    // Create a simple, natural loading indicator
    const loader = document.createElement("div");
    loader.className = "natural-loader";
    overlay.appendChild(loader);

    // Detect initial dark mode and set appropriate background color
    if (document.documentElement.classList.contains("dark")) {
      overlay.style.setProperty("--bg-color", "rgba(0, 0, 0, 0.6)");
    }

    // Make sure we append to body if it exists, otherwise wait
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      // Add it to document if body doesn't exist yet
      document.documentElement.appendChild(overlay);
      // Move it to body when the body is available
      if (DEBUG) console.log("Body not available, adding overlay to document");
      const bodyObserver = new MutationObserver((mutations) => {
        if (document.body) {
          if (overlay.parentNode === document.documentElement) {
            document.body.appendChild(overlay);
            if (DEBUG) console.log("Moved overlay to body");
          }
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
    }

    // Add a style tag for theme transitions of the overlay and loader
    const overlayStyle = document.createElement("style");
    overlayStyle.id = "background-loading-overlay-style";
    overlayStyle.textContent = `
      html.dark #background-loading-overlay {
        --bg-color: rgba(0, 0, 0, 0.6);
        --loader-color: rgba(255, 255, 255, 0.8);
      }
      html:not(.dark) #background-loading-overlay {
        --bg-color: rgba(255, 255, 255, 0.6);
        --loader-color: rgba(0, 0, 0, 0.8);
      }

      .natural-loader {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: radial-gradient(circle, transparent 40%, var(--loader-color) 40%);
        opacity: 0.8;
        animation: pulse 1.5s ease-in-out infinite alternate;
      }

      @keyframes pulse {
        0% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        100% {
          transform: scale(1.2);
          opacity: 0.9;
        }
      }
    `;
    document.head.appendChild(overlayStyle);

    // Make sure the overlay is visible by logging
    console.log("Background loading overlay created and visible");
  } else {
    // If the overlay already exists, make sure it's visible
    const overlay = document.getElementById("background-loading-overlay");
    overlay.style.opacity = "1";
    overlay.style.display = "flex";
    console.log("Background loading overlay reused and made visible");
  }

  return document.getElementById("background-loading-overlay");
}

// Remove loading overlay with a fade effect
function removeLoadingOverlay() {
  const overlay = document.getElementById("background-loading-overlay");
  if (overlay) {
    if (DEBUG) console.log("Removing loading overlay with fade animation");
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
        if (DEBUG) console.log("Loading overlay removed from DOM");
      }
    }, 500);
  } else {
    if (DEBUG) console.log("No loading overlay found to remove");
  }
}

// Create and append base style for background transitions right at the start
function setupBackgroundTransitions() {
  if (!document.getElementById("background-transition-style")) {
    const transitionStyle = document.createElement("style");
    transitionStyle.id = "background-transition-style";
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
        transition: opacity 1s ease;
        opacity: 1;
      }

      /* Start with a subtle background color to prevent white flash */
      html::before {
        background-color: rgba(245, 245, 245, 0.2);
      }

      html.dark::before {
        background-color: rgba(20, 20, 20, 0.2);
      }
    `;
    document.head.appendChild(transitionStyle);

    // Force the creation of the pseudo-elements if they don't exist yet
    if (!document.getElementById("background-placeholders")) {
      const placeholderStyle = document.createElement("style");
      placeholderStyle.id = "background-placeholders";
      placeholderStyle.textContent = `
        html::before { background-color: rgba(245, 245, 245, 0.2); }
        html.dark::before { background-color: rgba(20, 20, 20, 0.2); }
      `;
      document.head.appendChild(placeholderStyle);
    }
  }
}

// Call this immediately to prevent flickering
setupBackgroundTransitions();

// Preload an image and cache it
async function preloadImage(url) {
  // Skip if already preloaded
  if (preloadedImages.has(url)) {
    return preloadedImages.get(url);
  }

  // Create a new promise for preloading
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  // Store in cache
  preloadedImages.set(url, promise);
  return promise;
}

// Helper function to apply background with fade animation
async function setBackgroundWithAnimation(
  imageUrl,
  isDarkMode,
  showLoadingOverlay = true,
) {
  return new Promise(async (resolve) => {
    try {
      // Get existing style element or create new one
      let styleElement = document.getElementById("random-background-style");
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "random-background-style";
        document.head.appendChild(styleElement);
      }

      // Start the fade-out animation
      const selector = `html${isDarkMode ? ".dark" : ""}::before`;
      document.querySelector(selector)?.style.setProperty("opacity", "0.1");

      // Preload the image to ensure it's ready before showing
      await preloadImage(imageUrl).catch((err) => {
        console.error(err);
      });

      // After fade-out completes, update the background image and fade back in
      setTimeout(() => {
        styleElement.textContent = `
          ${selector} {
            background-image: url('${imageUrl}') !important;
          }
        `;

        // Small delay before fading in to ensure the new background is applied
        setTimeout(() => {
          document.querySelector(selector)?.style.setProperty("opacity", "1");

          // Wait for the transition to finish
          setTimeout(resolve, 800);
        }, 50);
      }, 300); // Reduced time for a faster transition
    } catch (error) {
      console.error("Error setting background:", error);
      resolve(); // Resolve anyway to prevent hanging
    }
  });
}

// Function to fetch available images from a directory
async function fetchBackgroundImages() {
  // Prevent multiple initializations
  if (isBackgroundLoading) {
    if (DEBUG)
      console.log(
        "Background loading already in progress, skipping duplicate initialization",
      );
    return;
  }

  isBackgroundLoading = true;

  // Create loading overlay first - must be called before any async operations
  const overlay = createLoadingOverlay();
  if (DEBUG)
    console.log(
      "Loading overlay created, starting background loading sequence",
    );

  try {
    if (DEBUG) console.log("Fetching light mode background images...");
    // Fetch light mode images
    const lightResponse = await fetch(`${lightBackgroundPath}index.json`);
    if (lightResponse.ok) {
      const lightData = await lightResponse.json();
      lightBackgroundImages = lightData.images.map(
        (img) => `${lightBackgroundPath}${img}`,
      );
      if (DEBUG)
        console.log(`Loaded ${lightBackgroundImages.length} light mode images`);

      // Preload the first light image
      if (lightBackgroundImages.length > 0) {
        preloadImage(lightBackgroundImages[0]).catch(() => {});
      }
    } else {
      console.warn(
        "Could not load light background index, using fallback images",
      );
      // Fallback to some hardcoded images if index.json is not available
      lightBackgroundImages = [
        "/images/backgrounds/light/carolinie-cavalli-Qw3w0oBH63s-unsplash.jpg",
      ];
      if (DEBUG) console.log("Using fallback light mode images");

      // Preload the fallback image
      preloadImage(lightBackgroundImages[0]).catch(() => {});
    }

    if (DEBUG) console.log("Fetching dark mode background images...");
    // Fetch dark mode images
    const darkResponse = await fetch(`${darkBackgroundPath}index.json`);
    if (darkResponse.ok) {
      const darkData = await darkResponse.json();
      darkBackgroundImages = darkData.images.map(
        (img) => `${darkBackgroundPath}${img}`,
      );
      if (DEBUG)
        console.log(`Loaded ${darkBackgroundImages.length} dark mode images`);

      // Preload the first dark image
      if (darkBackgroundImages.length > 0) {
        preloadImage(darkBackgroundImages[0]).catch(() => {});
      }
    } else {
      console.warn(
        "Could not load dark background index, using fallback images",
      );
      // Fallback to some hardcoded images if index.json is not available
      darkBackgroundImages = [
        "/images/backgrounds/dark/bence-halmosi-tOJlSyyOtPU-unsplash.jpg",
      ];
      if (DEBUG) console.log("Using fallback dark mode images");

      // Preload the fallback image
      preloadImage(darkBackgroundImages[0]).catch(() => {});
    }

    if (DEBUG) console.log("Loading stored background or setting random one");
    // Load existing background if stored, but don't set a new random one
    await loadStoredBackground(true);
  } catch (error) {
    console.error("Error fetching background images:", error);
    // Use hardcoded fallbacks in case of error
    lightBackgroundImages = [
      "/images/backgrounds/light/carolinie-cavalli-Qw3w0oBH63s-unsplash.jpg",
    ];
    darkBackgroundImages = [
      "/images/backgrounds/dark/bence-halmosi-tOJlSyyOtPU-unsplash.jpg",
    ];
    if (DEBUG) console.log("Using fallback images due to error");
    await loadStoredBackground(true);
  } finally {
    isBackgroundLoading = false;
  }
}

// Fetch background images when the page loads
// Use window.onload to ensure the body is available for the overlay
window.onload = function () {
  if (DEBUG) console.log("Window loaded, initializing background loading");

  // Only fetch and set backgrounds if not already initialized
  if (!isBackgroundInitialized) {
    fetchBackgroundImages();
  } else if (DEBUG) {
    console.log("Background already initialized, skipping load");
  }
};

// Support for Astro's view transitions - ensure background style is preserved, but don't change the background
document.addEventListener("astro:page-load", function () {
  if (DEBUG) console.log("Astro page load detected");

  // Don't reload background on navigation, just ensure styles are applied
  applyExistingBackground();
});

// Support for Astro's before page load event - prepare for transition
document.addEventListener("astro:before-swap", function () {
  if (DEBUG) console.log("Astro page transition starting");
  // We could add transition-specific logic here if needed
});

// Function to apply existing background from localStorage without changing it
function applyExistingBackground() {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const storedKey = isDarkMode
    ? "selectedDarkBackground"
    : "selectedLightBackground";
  const storedBackground = localStorage.getItem(storedKey);

  if (storedBackground) {
    // Just apply the existing background without animation or loading overlay
    if (DEBUG) console.log("Applying existing background:", storedBackground);

    // Get existing style element or create new one
    let styleElement = document.getElementById("random-background-style");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "random-background-style";
      document.head.appendChild(styleElement);
    }

    // Apply the background directly
    const selector = `html${isDarkMode ? ".dark" : ""}::before`;
    styleElement.textContent = `
      ${selector} {
        background-image: url('${storedBackground}') !important;
      }
    `;
  }
}

// Reload stored background when theme changes
document.addEventListener("theme-changed", () => {
  if (DEBUG) console.log("Theme changed, loading appropriate background");
  // Don't show loading overlay for theme changes
  // We still need to handle theme changes to switch between light/dark backgrounds
  loadStoredBackground(false);
});

// Load background from storage if it exists, or set a random one
async function loadStoredBackground(isInitialLoad = false) {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const storedKey = isDarkMode
    ? "selectedDarkBackground"
    : "selectedLightBackground";
  const storedBackground = localStorage.getItem(storedKey);

  // Only show loading overlay for initial page load, not theme changes
  const useLoadingOverlay = isInitialLoad;

  if (storedBackground) {
    // Use the stored background with animation
    await setBackgroundWithAnimation(
      storedBackground,
      isDarkMode,
      useLoadingOverlay,
    );
  } else {
    // No stored background for this theme, set a random one
    await setRandomBackground(useLoadingOverlay);
  }

  // Mark that background is initialized
  isBackgroundInitialized = true;

  // Remove the loading overlay when initial load is complete
  if (isInitialLoad) {
    removeLoadingOverlay();
  }
}

// Function to set a random background image
async function setRandomBackground(showLoadingOverlay = true) {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const imageArray = isDarkMode ? darkBackgroundImages : lightBackgroundImages;

  // If there are no images for the current mode, don't change anything
  if (imageArray.length === 0) return Promise.resolve();

  const randomIndex = Math.floor(Math.random() * imageArray.length);
  const selectedImage = imageArray[randomIndex];

  // Apply with fade animation
  await setBackgroundWithAnimation(
    selectedImage,
    isDarkMode,
    showLoadingOverlay,
  );

  // Store the chosen image in local storage
  localStorage.setItem(
    isDarkMode ? "selectedDarkBackground" : "selectedLightBackground",
    selectedImage,
  );
}

// Function to manually trigger a new random background
window.changeBackground = function () {
  createLoadingOverlay(); // Show loading overlay during manual change
  // We need to handle this as an async function
  setRandomBackground(true).then(() => {
    removeLoadingOverlay(); // Remove overlay when done
  });
};

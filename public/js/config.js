// Configuration variables for the blog
const config = {
  // Cloudflare R2 custom domain URL for background images
  r2BucketUrl: 'https://YOUR_CUSTOM_DOMAIN',
}

// Export configuration for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config
}
else {
  window.siteConfig = config
}

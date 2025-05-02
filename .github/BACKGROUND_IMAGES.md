# Background Images Automation

This document explains how to set up and use the background image automation feature that syncs images to Cloudflare R2.

## Overview

The GitHub Action workflow in this repository automates:

1. Scanning background images in the `public/images/backgrounds/light` and `public/images/backgrounds/dark` directories
2. Generating `index.json` files with lists of available images
3. Uploading all images and index files to Cloudflare R2 (index files are only stored on R2, not in the source code)

## Setup

### 1. Cloudflare R2 Setup

1. Create an R2 bucket in your Cloudflare account
2. Create an API token with R2 Admin permissions
3. Configure public access for the bucket so images can be loaded directly
4. Set up a custom domain for your R2 bucket if you prefer to use one

### 2. GitHub Variables and Secrets

Add the following to your GitHub repository:

Variables:

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_R2_BUCKET_NAME`: The name of your R2 bucket
- `CLOUDFLARE_DOMAIN`: Your domain for serving assets
- `CLOUDFLARE_ZONE_ID`: Your Cloudflare Zone ID (for cache purging)
- `CLOUDFLARE_EMAIL`: Your Cloudflare account email

Secrets:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with R2 permissions

### 3. Configure the site

Update the R2 bucket URL in `public/js/config.js`:

```js
const config = {
  // If using a custom domain:
  r2BucketUrl: "https://YOUR_DOMAIN",

  // Or if using the default R2 domain:
  // r2BucketUrl: 'https://YOUR_BUCKET_NAME.YOUR_ACCOUNT_ID.r2.dev',
};
```

## How It Works

The automation uses Cloudflare Wrangler to upload files to R2 directly, which is more efficient than using the AWS S3 compatibility layer. This approach requires only your Cloudflare account ID and API token.

## Scripts

The automation uses the following scripts:

- `.github/scripts/scan-backgrounds.cjs`: Scans the background directories and generates index.json files
- `.github/scripts/upload-to-r2.sh`: A utility script for manual uploads to R2
- `.github/scripts/update-backgrounds.sh`: Master script that runs the entire pipeline locally

## Usage

The workflow triggers automatically when changes are made to the background image directories. You can also trigger it manually from the Actions tab in GitHub.

## Manual Testing

To run the entire pipeline locally with one command:

```bash
.github/scripts/update-backgrounds.sh YOUR_BUCKET_NAME YOUR_ACCOUNT_ID [YOUR_DOMAIN]
```

Or you can run the individual steps:

1. To test just the image scanning:

```bash
node .github/scripts/scan-backgrounds.cjs
```

2. To manually upload images after scanning:

```bash
.github/scripts/upload-to-r2.sh YOUR_BUCKET_NAME YOUR_ACCOUNT_ID [YOUR_DOMAIN]
```

## Adding New Background Images

1. Add new background images to the appropriate directory:
   - `public/images/backgrounds/light/` for light mode
   - `public/images/backgrounds/dark/` for dark mode
2. Push the changes to GitHub, which will trigger the workflow
3. The workflow will generate index.json files and upload everything to R2

## Troubleshooting

If images aren't appearing:

1. Check that the GitHub Action workflow ran successfully
2. Verify the R2 bucket URL in `public/js/config.js`
3. Ensure public access is enabled for your R2 bucket
4. Check browser console for any errors loading the index.json or image files
5. Verify R2 contents through the Cloudflare dashboard

## Using a Custom Domain

If you're using a custom domain for your R2 bucket:

1. Set up the custom domain in Cloudflare R2 settings
2. Configure the necessary DNS records to point to your R2 bucket
3. Update the `r2BucketUrl` in `public/js/config.js` to use your domain
4. Make sure your paths are correct - you may need to adjust folder paths depending on your custom domain configuration

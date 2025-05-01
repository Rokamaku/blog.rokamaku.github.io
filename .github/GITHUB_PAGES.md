# GitHub Pages Deployment

This document explains how to deploy your blog to GitHub Pages and integrate it with the Cloudflare R2 background images.

## Overview

The GitHub Action workflow in this repository automates:
1. Building your blog for production
2. Deploying the built files to GitHub Pages
3. Configuring the R2 background image URLs automatically during the build process

## Setup

### 1. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
   - This will allow our custom workflow to handle the deployment

### 2. Configure Required Secrets and Variables

In your repository settings, add these:

Variables:
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_R2_BUCKET_NAME`: The name of your R2 bucket
- `CLOUDFLARE_DOMAIN`: Your domain for serving assets
- `CLOUDFLARE_ZONE_ID`: Your Cloudflare Zone ID
- `CLOUDFLARE_EMAIL`: Your Cloudflare account email

Secrets:
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with R2 permissions

### 3. Configure Branch

By default, the workflow is set to run on the `main` branch. If your primary branch has a different name (like `master`), update the workflow file in `.github/workflows/deploy-to-pages.yml`:

```yaml
on:
  push:
    branches:
      - main # Change this to your branch name if different
```

## How It Works

1. When you push to your main branch, the workflow automatically:
   - Checks out your code
   - Sets up Node.js
   - Installs dependencies
   - Updates the R2 configuration in `public/js/config.js` with your variables
   - Builds the site
   - Deploys to GitHub Pages

2. The deployment step will provide a URL where your site is accessible

## Cloudflare Integration

This deployment system is designed to work with Cloudflare R2 for background images using Wrangler, Cloudflare's official CLI tool. This approach:

- Uses native Cloudflare APIs rather than the S3-compatible APIs
- Requires only your Cloudflare Account ID and API token
- Provides better performance and reliability

## Custom Domain for GitHub Pages

If you want to use a custom domain for your GitHub Pages site:

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Under "Custom domain", enter your domain name
4. Configure your DNS settings as instructed by GitHub
5. Check "Enforce HTTPS" once your certificate is issued

## Troubleshooting

If your deployment fails, check:

1. Workflow logs in the Actions tab of your repository
2. Make sure all required secrets and variables are set correctly
3. Verify that the build command in the workflow matches what your project needs
4. Check that the path to your dist directory is correct in the workflow

## Manual Deployment

You can manually trigger the deployment by:

1. Going to the "Actions" tab in your repository
2. Selecting the "Deploy to GitHub Pages" workflow
3. Clicking "Run workflow" and selecting your branch

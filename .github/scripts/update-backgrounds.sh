#!/bin/bash

# Master script to update background images
# This script combines scanning and uploading in one step
# Usage: .github/scripts/update-backgrounds.sh <r2_bucket_name> <cloudflare_account_id> [domain]

# Check command line arguments
if [ $# -lt 2 ]; then
  echo "Usage: $0 <r2_bucket_name> <cloudflare_account_id> [domain]"
  echo "Example with R2 domain: $0 my-bucket 1234abcdef"
  echo "Example with custom domain: $0 my-bucket 1234abcdef cdn.example.com"
  exit 1
fi

CLOUDFLARE_R2_BUCKET_NAME=$1
CLOUDFLARE_ACCOUNT_ID=$2
CLOUDFLARE_DOMAIN=$3

echo "==== Background Image Update Pipeline ===="
echo "R2 Bucket: $CLOUDFLARE_R2_BUCKET_NAME"
echo "Account ID: $CLOUDFLARE_ACCOUNT_ID"

if [ -n "$CLOUDFLARE_DOMAIN" ]; then
  echo "Domain: $CLOUDFLARE_DOMAIN"
fi

echo ""
echo "=== Step 1: Scanning background directories ==="
# Run the scan script
node .github/scripts/scan-backgrounds.cjs

# Check if the scan was successful
if [ ! -f .tmp-r2-upload/light-index.json ] || [ ! -f .tmp-r2-upload/dark-index.json ]; then
  echo "❌ Failed to generate index files"
  exit 1
fi

echo ""
echo "=== Step 2: Uploading to Cloudflare R2 ==="
# Run the upload script with the provided arguments
.github/scripts/upload-to-r2.sh "$CLOUDFLARE_R2_BUCKET_NAME" "$CLOUDFLARE_ACCOUNT_ID" "$CLOUDFLARE_DOMAIN"

echo ""
echo "=== Completed background image update ==="

#!/bin/bash

# Script to manually upload background images to Cloudflare R2 using Wrangler
# Usage: .github/scripts/upload-to-r2.sh <r2_bucket_name> <cloudflare_account_id> [domain]

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler is not installed. Installing it now..."
  npm install -g wrangler || {
    echo "Failed to install Wrangler. Please install it manually with: npm install -g wrangler"
    exit 1
  }
fi

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

# Create wrangler.toml config
echo "Creating wrangler.toml configuration..."
cat > wrangler.toml << EOF
name = "background-uploader"
account_id = "$CLOUDFLARE_ACCOUNT_ID"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "$CLOUDFLARE_R2_BUCKET_NAME"
EOF

# First, generate the index files
echo "📁 Generating index.json files..."
node .github/scripts/test-background-scanning.cjs

# Check if the script was successful
if [ ! -f .tmp-r2-upload/light-index.json ] || [ ! -f .tmp-r2-upload/dark-index.json ]; then
  echo "❌ Failed to generate index files"
  exit 1
fi

# Check if Wrangler is authenticated
if [ ! -f ~/.wrangler/token ] || [ ! -s ~/.wrangler/token ]; then
  echo "Wrangler is not authenticated. Please enter your Cloudflare API token:"
  read -r CLOUDFLARE_API_TOKEN

  # Create wrangler config directory if it doesn't exist
  mkdir -p ~/.wrangler

  # Save the token
  echo "$CLOUDFLARE_API_TOKEN" > ~/.wrangler/token

  echo "✅ Wrangler configured with your API token"
else
  echo "Using existing Wrangler authentication"
fi

# Upload images with Wrangler
echo "🚀 Uploading to R2 bucket: $CLOUDFLARE_R2_BUCKET_NAME..."

# Upload light mode images
echo "📤 Uploading light mode images..."
for file in public/images/backgrounds/light/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "  Uploading: $filename"
    wrangler r2 object put "$CLOUDFLARE_R2_BUCKET_NAME/backgrounds/light/$filename" --file "$file" --content-type "$(file --mime-type -b "$file")"
  fi
done

# Upload dark mode images
echo "📤 Uploading dark mode images..."
for file in public/images/backgrounds/dark/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "  Uploading: $filename"
    wrangler r2 object put "$CLOUDFLARE_R2_BUCKET_NAME/backgrounds/dark/$filename" --file "$file" --content-type "$(file --mime-type -b "$file")"
  fi
done

# Upload index.json files
echo "📤 Uploading index.json files..."
wrangler r2 object put "$CLOUDFLARE_R2_BUCKET_NAME/backgrounds/light/index.json" --file ".tmp-r2-upload/light-index.json" --content-type "application/json"
wrangler r2 object put "$CLOUDFLARE_R2_BUCKET_NAME/backgrounds/dark/index.json" --file ".tmp-r2-upload/dark-index.json" --content-type "application/json"

echo "✅ All background images and index files uploaded to Cloudflare R2"
echo ""

if [ -n "$CLOUDFLARE_DOMAIN" ]; then
  echo "🌐 Your images are now available at:"
  echo "   https://$CLOUDFLARE_DOMAIN/backgrounds/light/index.json"
  echo "   https://$CLOUDFLARE_DOMAIN/backgrounds/dark/index.json"
  echo ""
  echo "Don't forget to update your config.js with the correct URL:"
  echo "   r2BucketUrl: 'https://$CLOUDFLARE_DOMAIN'"
else
  echo "🌐 Your images are now available at:"
  echo "   https://$CLOUDFLARE_R2_BUCKET_NAME.$CLOUDFLARE_ACCOUNT_ID.r2.dev/backgrounds/light/index.json"
  echo "   https://$CLOUDFLARE_R2_BUCKET_NAME.$CLOUDFLARE_ACCOUNT_ID.r2.dev/backgrounds/dark/index.json"
  echo ""
  echo "Don't forget to update your config.js with the correct URL:"
  echo "   r2BucketUrl: 'https://$CLOUDFLARE_R2_BUCKET_NAME.$CLOUDFLARE_ACCOUNT_ID.r2.dev'"
fi

# Clean up the temporary wrangler.toml if the user wishes
read -p "Do you want to remove the temporary wrangler.toml file? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm wrangler.toml
  echo "Removed wrangler.toml"
fi

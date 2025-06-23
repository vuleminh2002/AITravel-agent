#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Puppeteer Chrome
echo "Installing Puppeteer Chrome..."
npx puppeteer browsers install chrome

# Build the TypeScript code
echo "Building TypeScript..."
npm run build-ts

# Store/pull Puppeteer cache with build cache
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then 
  echo "...Copying Puppeteer Cache from Build Cache" 
  mkdir -p $PUPPETEER_CACHE_DIR
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR
else 
  echo "...Storing Puppeteer Cache in Build Cache" 
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi 
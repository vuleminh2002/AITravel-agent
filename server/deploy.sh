#!/bin/bash

# Install Chrome for puppeteer
echo "Installing Chrome for puppeteer..."
npx puppeteer browsers install chrome

# Build the project
echo "Building the project..."
npm run build

# Start the server
echo "Starting the server..."
npm start 
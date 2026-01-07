#!/bin/bash

echo "🚀 Starting fresh PM2 process..."

pm2 kill

pm2 start  C://Users/Hello/OneDrive/Desktop/TechVibe/ecosystem.config.cjs

pm2 save
pm2 status

echo "✅ PM2 started cleanly and saved successfully."

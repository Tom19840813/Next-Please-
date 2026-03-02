

# Add ads.txt for Google AdSense

## Problem
The `ads.txt` file is missing from the `public/` directory. Google AdSense requires this file at the root of your domain (`/ads.txt`) to authorize your account to serve ads. Without it, ad serving may be limited or blocked entirely.

## Plan

### 1. Create `public/ads.txt`
Add a single-line file with your AdSense publisher ID:

```
google.com, pub-2911267693656956, DIRECT, f08c47fec0942fa0
```

This line tells ad exchanges:
- **google.com** is the advertising system
- **pub-2911267693656956** is your publisher ID (already used in your code)
- **DIRECT** means you own this inventory directly
- **f08c47fec0942fa0** is Google's TAG ID (standard for all AdSense publishers)

### 2. Verify existing AdSense integration
The current setup already includes:
- AdSense script in `index.html` with client ID `ca-pub-2911267693656956`
- Dynamic script loading in `AdContext.tsx`
- Banner, sidebar, and interstitial ad components
- Admin settings page for controlling ads

The only missing piece is the `ads.txt` file itself.

## Technical Details
- Vite serves files from `public/` at the root path, so `public/ads.txt` will be accessible at `/ads.txt`
- No build configuration changes needed
- This is a one-file addition


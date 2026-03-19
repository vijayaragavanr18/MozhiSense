# 📱 Mobile & PWA Quick Start

## Run on Mobile (Pick One)

### Option 1: Local Network (Best for Testing)
```bash
# Terminal 1: Start dev server
npm run dev

# Find your machine's IP address:
# macOS/Linux:
ifconfig | grep inet

# Windows:
ipconfig

# On mobile browser, visit:
http://192.168.X.X:3000  # Replace with your IP
```

### Option 2: Browser DevTools
```bash
npm run dev

# In Chrome/Firefox:
1. Press F12 (DevTools)
2. Click mobile icon (top left)
3. See real-time mobile view
4. Select device: iPhone 12, Pixel 5, iPad, etc.
```

### Option 3: ngrok (Easy Sharing)
```bash
# Install once:
npm install -g ngrok

# Run:
ngrok http 3000

# Get public URL from terminal output
# Share with anyone worldwide!
```

---

## Install as PWA (Mobile App)

### 📱 iPhone / iPad
1. Open **Safari**
2. Visit: `http://YOUR_IP:3000`
3. Tap **Share** button (box icon)
4. Scroll down
5. Tap **"Add to Home Screen"**
6. Tap **"Add"** → Done! ✅

### 📱 Android Phone
1. Open **Chrome**
2. Visit: `http://YOUR_IP:3000`
3. Tap **⋮** (menu button)
4. Tap **"Install app"** (or "Add to Home Screen")
5. Confirm → Done! ✅

### 💻 Windows / macOS / Linux
1. Open **Chrome** / **Brave** / **Edge**
2. Visit: `http://localhost:3000`
3. See install icon in address bar (if not visible, check DevTools for PWA)
4. Click icon → Install → Done! ✅

---

## Features Once Installed

✅ **Works Offline** - App functions without internet  
✅ **Full Screen** - No browser bars  
✅ **Native Feel** - Like a real app  
✅ **Fast Loading** - Cached instantly  
✅ **Home Screen Icon** - Just like native apps  

---

## Responsive Behavior

### Mobile (< 768px width)
```
┌─────────────────┐
│  Phone Shell    │
│  • 100% width   │
│  • Full screen  │
│  • One page     │
│  • Bottom nav   │
└─────────────────┘
```

### Tablet & Desktop (≥ 768px width)
```
┌─────────┬─────────┐
│ Page 1  │ Page 2  │
├─────────┼─────────┤
│ Page 3  │ Page 4  │
└─────────┴─────────┘
Or: Toggle to single page view
```

---

## Responsive Width Breakpoints

| Size | Width | Device |
|------|-------|--------|
| **xs** | 320px | Tiny phones |
| **sm** | 640px | iPhones, Android |
| **md** | 768px | iPad Mini, tablets |
| **lg** | 1024px | iPad Pro, desktops |
| **xl** | 1280px | Laptops |

---

## Test on Real Phone

### Same WiFi Network
```bash
# Computer Terminal:
npm run dev

# Find IP (macOS/Linux):
ifconfig | grep "inet " | grep -v "127.0"

# Result: 192.168.1.100 or 10.0.0.5

# On phone browser (same WiFi):
http://192.168.1.100:3000
```

### Different Networks (Remote)
```bash
npm install -g ngrok
ngrok http 3000

# Copy public URL from terminal
# Share with anyone:
https://abc123-def456.ngrok.io
```

---

## Testing Checklist

- [ ] App loads on both iPhone and Android
- [ ] Responsive layout works (try landscape mode)
- [ ] Can install as PWA on mobile
- [ ] Works offline after installation
- [ ] Touch interactions smooth (no lag)
- [ ] Buttons are easy to tap (≥44px)
- [ ] Text readable without zoom
- [ ] Performance acceptable (<3s load)

---

## Performance Tips

```javascript
// Check performance on mobile:
// DevTools → Lighthouse → Generate Report

// Look for:
✅ PWA Installable (8/8)
✅ Mobile Friendly (yes)
✅ Performance (>90)
✅ Accessibility (>90)
```

---

## Troubleshooting

**Q: Can't visit from mobile on same network?**
- A: Check firewall settings
- Allow port 3000 through firewall
- Both devices on same WiFi
- Try: `http://localhost:3000` from computer first

**Q: Install button doesn't appear?**
- A: Only appears on HTTPS or localhost
- Desktop: Run on `localhost` ✅
- Mobile: Run on local IP ✅
- Production: Use HTTPS (Vercel/Netlify) ✅

**Q: App works offline but shows blank page?**
- A: Service worker may not be registered
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+Delete+R on Windows)
- Check DevTools → Application → Service Workers

**Q: Content gets cut off by notch?**
- A: App automatically handles iPhone notch
- Uses safe area insets
- Should work automatically

---

## Deploy to Production

### Vercel (Recommended)
```bash
npm run build
vercel
```
✅ Instant HTTPS  
✅ Global CDN  
✅ PWA ready  

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```
✅ Free SSL  
✅ Works worldwide  
✅ PWA ready  

### GitHub Pages
Set `base` in `vite.config.js`:
```javascript
export default {
  base: '/mohisense/',
}
```

---

## What Now?

1. ✅ **Run locally**: `npm run dev`
2. ✅ **Visit on mobile**: `http://YOUR_IP:3000`
3. ✅ **Install as PWA**: Use native install prompt
4. ✅ **Test offline**: Disable internet, app still works!
5. ✅ **Deploy**: Push to Vercel/Netlify when ready

---

**Your MozhiSense app is now ready for mobile! 📱✨**

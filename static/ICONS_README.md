# PWA Icons

This directory should contain the following icon files for Progressive Web App support:

## Required Files

1. **icon-192.png** - 192x192 pixels
   - Used for app icon on mobile home screens
   - Standard PWA icon size

2. **icon-512.png** - 512x512 pixels
   - Used for splash screens and larger displays
   - High-resolution PWA icon

## Creating Icons

You can create these icons from the project logo:

### Using ImageMagick (Command Line)
```bash
# Convert an existing logo to 192x192
convert logo.png -resize 192x192 icon-192.png

# Convert an existing logo to 512x512
convert logo.png -resize 512x512 icon-512.png
```

### Using Online Tools
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://progressier.com/pwa-icons-generator)
- [App Icon Generator](https://www.appicon.co/)

### Design Guidelines
- Use a simple, recognizable design
- Ensure the icon is readable at small sizes
- Use the project's primary color (#4CAF50)
- Include padding around the main icon (safe area)
- Support both light and dark backgrounds

## Icon Content Suggestions

For this Papers Portal project, the icon could feature:
- A terminal/console icon
- A document/paper icon
- The text "Papers" or "PYP"
- Combination of terminal prompt (>) with a document

## Placeholder Icons

Until custom icons are created, you can use temporary placeholder icons:

```bash
# Create simple colored placeholders with ImageMagick
convert -size 192x192 xc:#4CAF50 \
        -gravity center -pointsize 72 -fill white -annotate +0+0 "P" \
        icon-192.png

convert -size 512x512 xc:#4CAF50 \
        -gravity center -pointsize 192 -fill white -annotate +0+0 "P" \
        icon-512.png
```

## Testing PWA Icons

After adding icons:
1. Deploy the application
2. Open in Chrome/Edge on mobile
3. Check "Add to Home Screen" functionality
4. Verify icons appear correctly on home screen
5. Test app launch from home screen icon

## File Format

- **Format**: PNG (required)
- **Transparency**: Optional but recommended
- **Color Space**: RGB
- **Compression**: Optimized for web

## Additional Resources

- [Web App Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [PWA Icons Guidelines](https://web.dev/add-manifest/)
- [Maskable Icons](https://maskable.app/) - For adaptive icons

---

**Note**: This directory already contains `.gitkeep` to track it in Git. Add your icon files here and remove the `.gitkeep` if desired.

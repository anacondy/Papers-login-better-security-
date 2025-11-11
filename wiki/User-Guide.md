# User Guide

Welcome to the Previous Year Papers Portal user guide! This page will help you navigate and use all features of the portal.

## 🌐 Accessing the Portal

### Static Version (GitHub Pages)
Visit: [https://anacondy.github.io/Papers-login-better-security-/](https://anacondy.github.io/Papers-login-better-security-/)

This version includes:
- ✅ Full terminal interface
- ✅ Interactive commands
- ✅ Search functionality
- ✅ Mobile optimization
- ✅ Device detection
- ⚠️ Sample data only (no real backend)

### Full Version (Flask Backend)
For the complete experience with real paper storage, run the Flask application locally or on a server.

## 🖥️ Using the Terminal Interface

### Desktop Experience

When you open the portal on a desktop, you'll see a terminal-style interface with:

1. **Welcome Message**: Shows detected device information
2. **Command Prompt**: `guest@papers:~$` where you can type commands
3. **Available Papers**: List of papers in the database
4. **Quick Search**: Press `Ctrl+K` to open the search modal

### Mobile Experience

On mobile devices, the interface adapts with:

1. **Fixed Bottom Search Bar**: Always accessible at the bottom of the screen
2. **Touch-Optimized**: Larger tap targets and mobile-friendly spacing
3. **Responsive Layout**: Adapts to portrait and landscape modes
4. **Auto-Detection**: Automatically applies mobile optimizations

## 🔍 Searching for Papers

### Method 1: Terminal Command

Type in the terminal:
```
search [keyword]
```

Examples:
- `search Physics` - Find all Physics papers
- `search 2024` - Find papers from 2024
- `search MCA` - Find all MCA papers

### Method 2: Desktop Quick Search (Ctrl+K)

1. Press `Ctrl+K` (or `Cmd+K` on Mac)
2. Type your search query
3. Press `Enter` to search
4. Press `Esc` to close the modal

### Method 3: Mobile Search Bar

1. Scroll to the bottom of the page
2. Use the fixed search bar
3. Type your query
4. Search updates in real-time as you type

## 📋 Terminal Commands

### Basic Commands

#### `help`
Displays all available commands and their descriptions.
```
help
```

#### `list`
Shows all available papers in the database.
```
list
```
Alias: `ls`

#### `search [query]`
Search for papers by subject, class, or year.
```
search Physics
search 2024
search MCA
```
Alias: `find`

#### `subjects`
Lists all available subjects with paper counts.
```
subjects
```
Alias: `subject`

#### `years`
Shows all available years with paper counts.
```
years
```
Alias: `year`

#### `device`
Displays detailed device and system information including:
- Device type (Android, iPhone, Mac, Windows, Linux, etc.)
- Operating system
- Browser information
- Screen resolution
- Form factor (mobile/tablet/desktop)
```
device
```
Aliases: `info-device`, `system`

#### `clear`
Clears the terminal screen.
```
clear
```
Alias: `cls`

#### `about`
Shows information about the portal.
```
about
```
Alias: `info`

#### `github`
Opens the GitHub repository in a new tab.
```
github
```
Alias: `repo`

## 📱 Device-Specific Features

### Android Devices 🐶
- Optimized touch targets
- Chrome-specific optimizations
- Pull-to-refresh support

### iPhone/iOS 🍎
- Prevents zoom on input focus (16px font)
- Safe area support for notched devices
- iOS keyboard optimizations

### iPad/Tablets 🍏
- Larger viewport optimizations
- Split-screen support
- Touch and keyboard support

### Desktop (Windows 🪟, Mac 🍏, Linux 🐧)
- Keyboard shortcuts (Ctrl+K)
- Command history with arrow keys
- Mouse hover effects
- Larger screen layouts

## 🎯 Tips & Tricks

### Fast Navigation
1. Use arrow keys (↑/↓) to navigate command history
2. Press `Ctrl+K` for quick search on desktop
3. On mobile, the search bar is always at the bottom

### Efficient Searching
- Use specific keywords: "Physics 2024" instead of just "Physics"
- Search by class: "MCA", "BCA", "BSc", "BA"
- Search by year: "2024", "2023", etc.

### Command History
The terminal remembers your commands:
- Press `↑` to recall previous command
- Press `↓` to move forward in history
- Edit and re-run previous commands

### Mobile Tips
- Use landscape mode for wider terminal view
- Fixed search bar stays accessible while scrolling
- Real-time search updates as you type

## 🔐 Security While Using

The portal includes several security features to protect you:

1. **HTTPS**: All connections are encrypted
2. **XSS Protection**: User input is sanitized
3. **Rate Limiting**: Prevents abuse
4. **No Tracking**: Your privacy is respected

## ❓ Troubleshooting

### Search Not Working
- Check your internet connection
- Ensure query has 2+ characters
- Use only alphanumeric characters

### Mobile Search Bar Not Visible
- Scroll to the bottom of the page
- Refresh if needed
- Check that JavaScript is enabled

### Terminal Not Responding
- Refresh the page
- Check browser console for errors
- Try a different browser

### Device Not Detected Correctly
- Type `device` command to see detection details
- Update your browser to the latest version
- Report the issue on GitHub

## 📞 Need More Help?

- Check [Hidden Features](Hidden-Features.md) for advanced functionality
- See [Terminal Commands](Terminal-Commands.md) for command reference
- Read [Mobile Optimization](Mobile-Optimization.md) for mobile-specific help
- Visit [Troubleshooting](#troubleshooting) section above

---

**Next**: Learn about [Hidden Features](Hidden-Features.md) to discover secret functionality!

/**
 * Interactive Terminal for Previous Year Papers Portal
 * Provides a functional terminal interface for static GitHub Pages
 */

(function() {
    'use strict';

    // Sample paper database for demonstration
    const PAPERS_DATABASE = [
        { subject: 'Physics', year: '2024', semester: 'Fall', code: 'PHY101', url: '#physics-2024-fall' },
        { subject: 'Physics', year: '2023', semester: 'Spring', code: 'PHY101', url: '#physics-2023-spring' },
        { subject: 'Mathematics', year: '2024', semester: 'Fall', code: 'MATH201', url: '#math-2024-fall' },
        { subject: 'Mathematics', year: '2023', semester: 'Spring', code: 'MATH201', url: '#math-2023-spring' },
        { subject: 'Chemistry', year: '2024', semester: 'Fall', code: 'CHEM101', url: '#chem-2024-fall' },
        { subject: 'Chemistry', year: '2023', semester: 'Spring', code: 'CHEM101', url: '#chem-2023-spring' },
        { subject: 'Computer Science', year: '2024', semester: 'Fall', code: 'CS201', url: '#cs-2024-fall' },
        { subject: 'Computer Science', year: '2023', semester: 'Spring', code: 'CS201', url: '#cs-2023-spring' },
        { subject: 'Biology', year: '2024', semester: 'Fall', code: 'BIO101', url: '#bio-2024-fall' },
        { subject: 'Biology', year: '2023', semester: 'Spring', code: 'BIO101', url: '#bio-2023-spring' },
    ];

    // Command history
    let commandHistory = [];
    let historyIndex = -1;

    // Terminal state
    let isProcessing = false;

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add a line to the terminal output
     */
    function addLine(text, className = '') {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = `line ${className}`;
        line.innerHTML = text;
        output.appendChild(line);
        
        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
    }

    /**
     * Clear the terminal
     */
    function clearTerminal() {
        document.getElementById('output').innerHTML = '';
    }

    /**
     * Display welcome message
     */
    function displayWelcome() {
        const device = detectDevice();
        
        addLine('');
        addLine('<span class="highlight">╔════════════════════════════════════════════════════════════════╗</span>');
        addLine('<span class="highlight">║                                                                ║</span>');
        addLine('<span class="highlight">║       Welcome to Previous Year Papers Portal - v1.0           ║</span>');
        addLine('<span class="highlight">║                                                                ║</span>');
        addLine('<span class="highlight">╚════════════════════════════════════════════════════════════════╝</span>');
        addLine('');
        addLine(`<span class="comment"># Detected Device: ${device.emoji} ${escapeHtml(device.type)} (${escapeHtml(device.os)})</span>`);
        addLine('');
        addLine('<span class="comment"># Type "help" to see available commands</span>');
        addLine('<span class="comment"># Press Ctrl+K to open quick search</span>');
        addLine('<span class="comment"># Type "device" for detailed system information</span>');
        addLine('');
    }

    /**
     * Display help message
     */
    function displayHelp() {
        addLine('');
        addLine('<span class="highlight">Available Commands:</span>');
        addLine('');
        addLine('  <span class="prompt">help</span>           - Display this help message');
        addLine('  <span class="prompt">list</span>           - List all available papers');
        addLine('  <span class="prompt">search [query]</span> - Search for papers (e.g., search Physics)');
        addLine('  <span class="prompt">subjects</span>       - List all subjects');
        addLine('  <span class="prompt">years</span>          - List available years');
        addLine('  <span class="prompt">device</span>         - Show device and system information');
        addLine('  <span class="prompt">clear</span>          - Clear the terminal');
        addLine('  <span class="prompt">about</span>          - About this portal');
        addLine('  <span class="prompt">github</span>         - View GitHub repository');
        addLine('');
        addLine('<span class="comment"># Quick Search: Press Ctrl+K</span>');
        addLine('<span class="comment"># Hidden Feature: Press F+S for 2 seconds for stats</span>');
        addLine('');
    }

    /**
     * List all papers
     */
    function listPapers(papers = PAPERS_DATABASE) {
        if (papers.length === 0) {
            addLine('<span class="comment"># No papers found</span>');
            return;
        }

        addLine('');
        addLine('<span class="highlight">Available Papers:</span>');
        addLine('');
        
        papers.forEach((paper, index) => {
            addLine(`  ${index + 1}. <a href="${paper.url}">${paper.subject} - ${paper.code} (${paper.semester} ${paper.year})</a>`);
        });
        addLine('');
    }

    /**
     * Search papers
     */
    function searchPapers(query) {
        if (!query || query.trim() === '') {
            addLine('<span class="comment"># Usage: search [query]</span>');
            addLine('<span class="comment"># Example: search Physics</span>');
            return;
        }

        const searchTerm = query.toLowerCase();
        const results = PAPERS_DATABASE.filter(paper => 
            paper.subject.toLowerCase().includes(searchTerm) ||
            paper.code.toLowerCase().includes(searchTerm) ||
            paper.year.includes(searchTerm) ||
            paper.semester.toLowerCase().includes(searchTerm)
        );

        if (results.length === 0) {
            addLine(`<span class="comment"># No results found for "${escapeHtml(query)}"</span>`);
        } else {
            addLine(`<span class="comment"># Found ${results.length} result(s) for "${escapeHtml(query)}"</span>`);
            listPapers(results);
        }
    }

    /**
     * List all subjects
     */
    function listSubjects() {
        const subjects = [...new Set(PAPERS_DATABASE.map(p => p.subject))];
        addLine('');
        addLine('<span class="highlight">Available Subjects:</span>');
        addLine('');
        subjects.forEach(subject => {
            const count = PAPERS_DATABASE.filter(p => p.subject === subject).length;
            addLine(`  • ${subject} (${count} papers)`);
        });
        addLine('');
    }

    /**
     * List all years
     */
    function listYears() {
        const years = [...new Set(PAPERS_DATABASE.map(p => p.year))].sort().reverse();
        addLine('');
        addLine('<span class="highlight">Available Years:</span>');
        addLine('');
        years.forEach(year => {
            const count = PAPERS_DATABASE.filter(p => p.year === year).length;
            addLine(`  • ${year} (${count} papers)`);
        });
        addLine('');
    }

    /**
     * Display about information
     */
    function displayAbout() {
        addLine('');
        addLine('<span class="highlight">About Previous Year Papers Portal</span>');
        addLine('');
        addLine('A secure, terminal-style interface for accessing previous year academic papers.');
        addLine('');
        addLine('<span class="comment"># Features:</span>');
        addLine('  • Terminal-style interface with command-line interaction');
        addLine('  • Search functionality (Ctrl+K for quick search)');
        addLine('  • Mobile responsive design');
        addLine('  • Enterprise-grade security measures');
        addLine('  • Comprehensive device detection');
        addLine('');
        addLine('<span class="comment"># Repository:</span>');
        addLine('  <a href="https://github.com/anacondy/Papers-login-better-security-" target="_blank">https://github.com/anacondy/Papers-login-better-security-</a>');
        addLine('');
    }

    /**
     * Display device information
     * Shows comprehensive device, OS, and browser details
     */
    function displayDeviceInfo() {
        const device = detectDevice();
        
        addLine('');
        addLine('<span class="highlight">Device Information</span>');
        addLine('');
        addLine(`<span class="comment"># Device Type:</span> ${device.emoji} ${escapeHtml(device.type)}`);
        addLine(`<span class="comment"># Operating System:</span> ${escapeHtml(device.os)}`);
        addLine(`<span class="comment"># Browser:</span> ${escapeHtml(device.browser)}`);
        addLine('');
        addLine('<span class="comment"># Form Factor:</span>');
        addLine(`  • Mobile: ${device.isMobile ? 'Yes' : 'No'}`);
        addLine(`  • Tablet: ${device.isTablet ? 'Yes' : 'No'}`);
        addLine(`  • Desktop: ${device.isDesktop ? 'Yes' : 'No'}`);
        addLine('');
        addLine('<span class="comment"># Screen Information:</span>');
        addLine(`  • Screen Resolution: ${window.screen.width}x${window.screen.height}`);
        addLine(`  • Viewport Size: ${window.innerWidth}x${window.innerHeight}`);
        addLine(`  • Color Depth: ${window.screen.colorDepth}-bit`);
        addLine('');
    }

    /**
     * Process command
     */
    function processCommand(input) {
        const trimmedInput = input.trim();
        
        if (!trimmedInput) {
            return;
        }

        // Add command to output
        addLine(`<span class="prompt">guest@papers:~$</span> <span class="command">${escapeHtml(trimmedInput)}</span>`);

        // Add to history
        commandHistory.push(trimmedInput);
        historyIndex = commandHistory.length;

        // Parse command
        const parts = trimmedInput.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        // Execute command
        switch (command) {
            case 'help':
            case '?':
                displayHelp();
                break;

            case 'list':
            case 'ls':
                listPapers();
                break;

            case 'search':
            case 'find':
                searchPapers(args);
                break;

            case 'subjects':
            case 'subject':
                listSubjects();
                break;

            case 'years':
            case 'year':
                listYears();
                break;

            case 'clear':
            case 'cls':
                clearTerminal();
                break;

            case 'about':
            case 'info':
                displayAbout();
                break;

            case 'github':
            case 'repo':
                addLine('');
                addLine('<span class="comment"># Opening GitHub repository...</span>');
                addLine('  <a href="https://github.com/anacondy/Papers-login-better-security-" target="_blank">https://github.com/anacondy/Papers-login-better-security-</a>');
                addLine('');
                window.open('https://github.com/anacondy/Papers-login-better-security-', '_blank');
                break;

            case 'device':
            case 'info-device':
            case 'system':
                displayDeviceInfo();
                break;

            case '':
                // Empty command, just add newline
                break;

            default:
                addLine(`<span class="comment"># Command not found: ${escapeHtml(command)}</span>`);
                addLine(`<span class="comment"># Type "help" for available commands</span>`);
        }
    }

    /**
     * Initialize terminal
     */
    function initTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        
        if (!terminalInput) {
            console.error('Terminal input not found');
            return;
        }

        // Display welcome message
        displayWelcome();

        // Handle input
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const input = terminalInput.value;
                terminalInput.value = '';
                processCommand(input);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex] || '';
                } else {
                    historyIndex = commandHistory.length;
                    terminalInput.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion could be implemented here
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                clearTerminal();
                displayWelcome();
            }
        });

        // Keep focus on input (desktop only)
        if (!isMobileDevice()) {
            document.addEventListener('click', () => {
                terminalInput.focus();
            });
        }

        // Initial focus (desktop only)
        if (!isMobileDevice()) {
            terminalInput.focus();
        }
    }

    /**
     * Initialize mobile search bar
     */
    function initMobileSearch() {
        const mobileSearchInput = document.getElementById('mobile-search-input');
        
        if (!mobileSearchInput) return;

        // Handle search on Enter
        mobileSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = mobileSearchInput.value.trim();
                if (query) {
                    // Add to terminal output
                    addLine(`<span class="prompt">guest@papers:~$</span> <span class="command">search ${escapeHtml(query)}</span>`);
                    searchPapers(query);
                    // Scroll to show results
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
            }
        });

        // Real-time suggestions (optional enhancement)
        let searchTimeout;
        mobileSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            // Only show suggestions if query is at least 2 characters
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    // Could implement autocomplete suggestions here
                }, 300);
            }
        });
    }

    /**
     * Comprehensive device detection with device type identification
     * Detects: Android 🐶, iPhone 🍎, Apple devices 🍏, Windows 🪟, Others 👽
     * @returns {Object} Device information including type, OS, browser, and form factor
     */
    function detectDevice() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        
        // Device info object to return
        const deviceInfo = {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            type: '',
            emoji: '',
            os: '',
            browser: ''
        };
        
        // Detect Android devices 🐶
        if (/Android/i.test(ua)) {
            deviceInfo.isMobile = /Mobile/i.test(ua);
            deviceInfo.isTablet = !deviceInfo.isMobile && /Android/i.test(ua);
            deviceInfo.type = 'Android';
            deviceInfo.emoji = '🐶';
            deviceInfo.os = 'Android';
        }
        // Detect iPhone 🍎
        else if (/iPhone/i.test(ua)) {
            deviceInfo.isMobile = true;
            deviceInfo.type = 'iPhone';
            deviceInfo.emoji = '🍎';
            deviceInfo.os = 'iOS';
        }
        // Detect iPad (modern iPads report as Mac, so check for touch capability)
        else if (/iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            deviceInfo.isTablet = true;
            deviceInfo.type = 'iPad';
            deviceInfo.emoji = '🍏';
            deviceInfo.os = 'iPadOS';
        }
        // Detect iPod 🍏
        else if (/iPod/i.test(ua)) {
            deviceInfo.isMobile = true;
            deviceInfo.type = 'iPod';
            deviceInfo.emoji = '🍏';
            deviceInfo.os = 'iOS';
        }
        // Detect Mac computers 🍏
        else if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua) || platform.includes('Mac')) {
            deviceInfo.isDesktop = true;
            deviceInfo.type = 'Mac';
            deviceInfo.emoji = '🍏';
            deviceInfo.os = 'macOS';
        }
        // Detect Windows devices 🪟
        else if (/Windows|Win32|Win64|WinCE/i.test(ua) || platform.includes('Win')) {
            deviceInfo.isDesktop = true;
            deviceInfo.type = 'Windows';
            deviceInfo.emoji = '🪟';
            deviceInfo.os = 'Windows';
        }
        // Detect Linux
        else if (/Linux/i.test(ua) || platform.includes('Linux')) {
            deviceInfo.isDesktop = true;
            deviceInfo.type = 'Linux';
            deviceInfo.emoji = '🐧';
            deviceInfo.os = 'Linux';
        }
        // Detect other mobile devices
        else if (/webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            deviceInfo.isMobile = true;
            deviceInfo.type = 'Other Mobile';
            deviceInfo.emoji = '👽';
            deviceInfo.os = 'Other';
        }
        // Unknown/Other devices 👽
        else {
            deviceInfo.isDesktop = true;
            deviceInfo.type = 'Other';
            deviceInfo.emoji = '👽';
            deviceInfo.os = 'Unknown';
        }
        
        // Detect browser
        if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) {
            deviceInfo.browser = 'Chrome';
        } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
            deviceInfo.browser = 'Safari';
        } else if (/Firefox/i.test(ua)) {
            deviceInfo.browser = 'Firefox';
        } else if (/Edge|Edg/i.test(ua)) {
            deviceInfo.browser = 'Edge';
        } else if (/MSIE|Trident/i.test(ua)) {
            deviceInfo.browser = 'Internet Explorer';
        } else {
            deviceInfo.browser = 'Other';
        }
        
        return deviceInfo;
    }

    /**
     * Detect mobile device (legacy function for backward compatibility)
     * Now uses enhanced device detection and also checks screen width
     */
    function isMobileDevice() {
        const device = detectDevice();
        return device.isMobile || device.isTablet || (window.innerWidth <= 768);
    }

    /**
     * Apply mobile optimizations
     */
    function applyMobileOptimizations() {
        if (isMobileDevice()) {
            document.body.classList.add('is-mobile');
            
            // Adjust viewport height for mobile browsers
            const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', setViewportHeight);
            
            // Prevent double-tap zoom on mobile
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, { passive: false });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyMobileOptimizations();
            initTerminal();
            initMobileSearch();
        });
    } else {
        applyMobileOptimizations();
        initTerminal();
        initMobileSearch();
    }

})();

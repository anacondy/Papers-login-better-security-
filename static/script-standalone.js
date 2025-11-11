/**
 * Previous Year Papers Portal - Standalone Client-side JavaScript
 * This is a static demo version for GitHub Pages
 * 
 * Features:
 * - Comprehensive device detection (Android, iPhone, iOS, Windows, Mac, Linux, Others)
 * - Mobile-optimized fixed bottom search bar
 * - Desktop search modal (Ctrl+K)
 * - Hidden stats page (F+S for 2+ seconds)
 * - Real-time search with debouncing
 * - Security: XSS prevention through HTML escaping
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    
    /**
     * Application configuration constants
     * These values control search behavior and validation
     */
    const CONFIG = {
        searchDelay: 300,        // Milliseconds to wait before executing search (debounce)
        maxSearchLength: 100,    // Maximum allowed search query length
        minSearchLength: 2       // Minimum required search query length
    };

    /**
     * Mock papers data for demo
     * In production, this would be fetched from a backend API or database
     * Each paper object contains: class, subject, semester, exam_year, and url
     */
    const MOCK_PAPERS = [
        {
            class: 'MCA',                    // Master of Computer Applications
            subject: 'Data Structures',      // Course subject name
            semester: 1,                     // Semester number
            exam_year: 2025,                 // Year of examination
            url: '#'                         // Link to paper (placeholder in demo)
        },
        {
            class: 'MCA',
            subject: 'Computer Networks',
            semester: 2,
            exam_year: 2024,
            url: '#'
        },
        {
            class: 'BCA',                    // Bachelor of Computer Applications
            subject: 'Programming in C',
            semester: 1,
            exam_year: 2025,
            url: '#'
        },
        {
            class: 'BSc',                    // Bachelor of Science
            subject: 'Physics',
            semester: 1,
            exam_year: 2025,
            url: '#'
        },
        {
            class: 'BSc',
            subject: 'Chemistry',
            semester: 2,
            exam_year: 2024,
            url: '#'
        },
        {
            class: 'BA',                     // Bachelor of Arts
            subject: 'English Literature',
            semester: 1,
            exam_year: 2025,
            url: '#'
        },
        {
            class: 'BA',
            subject: 'History',
            semester: 3,
            exam_year: 2023,
            url: '#'
        },
        {
            class: 'MCA',
            subject: 'Database Management',
            semester: 3,
            exam_year: 2024,
            url: '#'
        }
    ];

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Escape HTML to prevent XSS (Cross-Site Scripting) attacks
     * This function converts potentially dangerous characters into safe HTML entities
     * Example: "<script>" becomes "&lt;script&gt;"
     * 
     * @param {string} text - Raw text that may contain HTML characters
     * @returns {string} Escaped text safe for HTML insertion
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;  // textContent automatically escapes HTML
        return div.innerHTML;     // Return the escaped HTML
    }

    /**
     * Validate search query against security and length constraints
     * Ensures query meets minimum requirements and doesn't contain malicious patterns
     * 
     * @param {string} query - Search query entered by user
     * @returns {boolean} True if valid, false otherwise
     */
    function validateSearchQuery(query) {
        // Check if query exists and meets minimum length
        if (!query || query.length < CONFIG.minSearchLength) {
            return false;
        }
        // Check if query exceeds maximum length
        if (query.length > CONFIG.maxSearchLength) {
            return false;
        }
        // Allow only alphanumeric characters, spaces, hyphens, underscores, and periods
        // This prevents SQL injection and other malicious input
        const validPattern = /^[a-zA-Z0-9\s\-_.]+$/;
        return validPattern.test(query);
    }

    /**
     * Debounce function to limit the rate of function execution
     * Useful for search-as-you-type to avoid excessive API calls or processing
     * 
     * How it works:
     * - User types, timer starts
     * - If user types again before timer expires, reset timer
     * - Only execute function when user stops typing for 'wait' milliseconds
     * 
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds before executing
     * @returns {Function} Debounced version of the function
     */
    function debounce(func, wait) {
        let timeout;  // Stores the timer ID
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);     // Clear the timer
                func(...args);             // Execute the function with arguments
            };
            clearTimeout(timeout);         // Clear any existing timer
            timeout = setTimeout(later, wait);  // Start new timer
        };
    }

    // ============================================================================
    // SEARCH FUNCTIONALITY
    // ============================================================================

    /**
     * Search papers in mock data using case-insensitive partial matching
     * Searches across multiple fields: subject, class, and exam year
     * 
     * @param {string} query - Search query (will be converted to lowercase)
     * @returns {Array} Array of paper objects matching the query
     */
    function searchPapers(query) {
        // If no query provided, return all papers
        if (!query) {
            return MOCK_PAPERS;
        }
        
        // Convert query to lowercase for case-insensitive search
        const queryLower = query.toLowerCase();
        
        // Filter papers where query matches subject, class, or year
        return MOCK_PAPERS.filter(paper => 
            paper.subject.toLowerCase().includes(queryLower) ||
            paper.class.toLowerCase().includes(queryLower) ||
            paper.exam_year.toString().includes(queryLower)
        );
    }

    /**
     * Perform search (static version)
     * Validates query, searches mock data, and displays results
     * @param {string} query - Search query
     */
    function performSearch(query) {
        // Validate search query against configured rules
        if (!validateSearchQuery(query)) {
            displayError('Invalid search query. Please use alphanumeric characters only.');
            return;
        }

        // Update statistics
        stats.searches++;
        stats.lastSearch = query;

        // Search the mock papers database
        const results = searchPapers(query);
        
        // Display results or "no results" message
        if (results.length === 0) {
            displayMessage(`No results found for "${escapeHtml(query)}"`);
        } else {
            displayResults(results, query);
        }
    }

    /**
     * Display search results
     * @param {Array} results - Search results
     * @param {string} query - Original query
     */
    function displayResults(results, query) {
        const output = document.getElementById('output');
        if (!output) return;

        // Clear previous results and show search header
        const searchHeader = `
            <div class="line">
                <span class="prompt">user@papers:~$</span>
                <span class="command"> search "${escapeHtml(query)}"</span>
            </div>
            <div class="line">
                <span class="comment"># Found ${results.length} result(s)</span>
            </div>
        `;
        output.innerHTML = searchHeader;

        const resultsHtml = results.map(result => {
            const className = escapeHtml(result.class || 'Unknown');
            const subject = escapeHtml(result.subject || 'Unknown');
            const semester = escapeHtml(result.semester ? `Sem ${result.semester}` : 'N/A');
            const year = escapeHtml(result.exam_year ? result.exam_year.toString() : 'N/A');
            const url = escapeHtml(result.url || '#');
            
            return `
                <div class="line search-result">
                    <a href="${url}" rel="noopener noreferrer">
                        [${className}] ${subject} - ${semester} (${year})
                    </a>
                </div>
            `;
        }).join('');

        output.innerHTML += resultsHtml;
    }

    /**
     * Display error message
     * @param {string} message - Error message
     */
    function displayError(message) {
        const output = document.getElementById('output');
        if (!output) return;

        const errorHtml = `
            <div class="line">
                <span class="comment"># Error: ${escapeHtml(message)}</span>
            </div>
        `;
        output.innerHTML += errorHtml;
    }

    /**
     * Display general message
     * @param {string} message - Message
     */
    function displayMessage(message) {
        const output = document.getElementById('output');
        if (!output) return;

        const messageHtml = `
            <div class="line">
                <span class="comment"># ${escapeHtml(message)}</span>
            </div>
        `;
        output.innerHTML += messageHtml;
    }

    // ============================================================================
    // TERMINAL INITIALIZATION
    // ============================================================================

    /**
     * Initialize terminal with welcome message
     * Shows available papers and device-specific instructions
     */
    function initTerminal() {
        const output = document.getElementById('output');
        if (!output) return;

        // Detect current device for personalized welcome message
        const device = detectDevice();
        const deviceLine = `<span class="comment"># Detected Device: ${device.emoji} ${escapeHtml(device.type)} (${escapeHtml(device.os)})</span>`;

        const welcomeMessage = `
            <div class="line">
                <span class="comment"># ================================================</span>
            </div>
            <div class="line">
                <span class="comment">#  Previous Year Papers Portal - Terminal Mode</span>
            </div>
            <div class="line">
                <span class="comment"># ================================================</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                ${deviceLine}
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># Welcome! Search for academic papers below.</span>
            </div>
            <div class="line">
                <span class="comment"># Desktop: Press Ctrl+K to open search</span>
            </div>
            <div class="line">
                <span class="comment"># Mobile: Use search bar at bottom</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># Available Papers:</span>
            </div>
        `;
        
        output.innerHTML = welcomeMessage;

        // Display all papers initially
        const allPapers = MOCK_PAPERS.map(paper => {
            return `
                <div class="line">
                    <span class="comment">#   • [${escapeHtml(paper.class)}] ${escapeHtml(paper.subject)} - Sem ${paper.semester} (${paper.exam_year})</span>
                </div>
            `;
        }).join('');
        
        output.innerHTML += allPapers;

        output.innerHTML += `
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="prompt">user@papers:~$</span>
                <span class="command"> _</span>
            </div>
        `;
    }

    // ============================================================================
    // SEARCH MODAL
    // ============================================================================

    /**
     * Initialize search modal
     */
    function initSearchModal() {
        const modal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        
        if (!modal || !searchInput) return;

        // Open modal with Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearchModal();
            }
        });

        // Close modal with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSearchModal();
            }
        });

        // Search on Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                    closeSearchModal();
                }
            }
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSearchModal();
            }
        });
    }

    /**
     * Open search modal
     */
    function openSearchModal() {
        const modal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        
        if (modal) {
            modal.classList.remove('hidden');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }

    /**
     * Close search modal
     */
    function closeSearchModal() {
        const modal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        
        if (modal) {
            modal.classList.add('hidden');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }

    // ============================================================================
    // DEVICE DETECTION
    // ============================================================================

    /**
     * Comprehensive device detection with device type identification
     * Detects: Android 🐶, iPhone 🍎, Apple devices 🍏, Windows 🪟, Others 👽
     * @returns {Object} Device information
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
     * Legacy function for backward compatibility
     * Detect if device is mobile
     * @returns {boolean} Is mobile
     */
    function isMobileDevice() {
        const device = detectDevice();
        return device.isMobile || device.isTablet;
    }

    /**
     * Initialize mobile-specific features
     * Adds appropriate CSS class and sets up mobile search functionality
     */
    function initMobile() {
        // Detect device type and apply appropriate styling
        if (isMobileDevice()) {
            document.body.classList.add('is-mobile');
            
            // Get the mobile search input element (fixed at bottom for mobile devices)
            const mobileSearchInput = document.getElementById('mobile-search-input');
            if (mobileSearchInput) {
                // Search on Enter key press
                mobileSearchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const query = e.target.value.trim();
                        if (query) {
                            performSearch(query);
                        }
                    }
                });
                
                // Also support real-time search with debounce to avoid excessive searches
                // This provides a smooth search-as-you-type experience
                const debouncedSearch = debounce((e) => {
                    const query = e.target.value.trim();
                    if (query && query.length >= CONFIG.minSearchLength) {
                        performSearch(query);
                    }
                }, CONFIG.searchDelay);
                
                mobileSearchInput.addEventListener('input', debouncedSearch);
            }
        }
    }

    // ============================================================================
    // STATS PAGE (HIDDEN FEATURE)
    // ============================================================================

    /**
     * Stats page data tracker
     * Tracks various usage statistics for the application
     */
    const stats = {
        visits: 0,
        searches: 0,
        deviceInfo: null,
        lastSearch: null,
        sessionStart: Date.now()
    };

    /**
     * Show hidden stats page
     * Displays device information, usage statistics, and session data
     */
    function showStatsPage() {
        const output = document.getElementById('output');
        if (!output) return;

        // Get current device info
        const device = detectDevice();
        stats.deviceInfo = device;
        
        // Calculate session duration
        const sessionDuration = Math.floor((Date.now() - stats.sessionStart) / 1000);
        const minutes = Math.floor(sessionDuration / 60);
        const seconds = sessionDuration % 60;
        
        // Generate stats HTML
        const statsHtml = `
            <div class="line">
                <span class="comment"># ================================================</span>
            </div>
            <div class="line">
                <span class="highlight">#  📊 STATISTICS PAGE (Hidden Feature)</span>
            </div>
            <div class="line">
                <span class="comment"># ================================================</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># 🖥️  DEVICE INFORMATION:</span>
            </div>
            <div class="line">
                <span class="comment">#   Device Type: ${device.emoji} ${escapeHtml(device.type)}</span>
            </div>
            <div class="line">
                <span class="comment">#   Operating System: ${escapeHtml(device.os)}</span>
            </div>
            <div class="line">
                <span class="comment">#   Browser: ${escapeHtml(device.browser)}</span>
            </div>
            <div class="line">
                <span class="comment">#   Mobile: ${device.isMobile ? 'Yes' : 'No'}</span>
            </div>
            <div class="line">
                <span class="comment">#   Tablet: ${device.isTablet ? 'Yes' : 'No'}</span>
            </div>
            <div class="line">
                <span class="comment">#   Desktop: ${device.isDesktop ? 'Yes' : 'No'}</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># 📈 USAGE STATISTICS:</span>
            </div>
            <div class="line">
                <span class="comment">#   Total Searches: ${stats.searches}</span>
            </div>
            <div class="line">
                <span class="comment">#   Session Duration: ${minutes}m ${seconds}s</span>
            </div>
            <div class="line">
                <span class="comment">#   Last Search: ${stats.lastSearch || 'None'}</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># 🌐 BROWSER DETAILS:</span>
            </div>
            <div class="line">
                <span class="comment">#   Screen: ${window.screen.width}x${window.screen.height}</span>
            </div>
            <div class="line">
                <span class="comment">#   Viewport: ${window.innerWidth}x${window.innerHeight}</span>
            </div>
            <div class="line">
                <span class="comment">#   User Agent: ${escapeHtml(navigator.userAgent)}</span>
            </div>
            <div class="line">
                <span class="comment"># </span>
            </div>
            <div class="line">
                <span class="comment"># Press F5 to refresh and return to main page</span>
            </div>
            <div class="line">
                <span class="comment"># ================================================</span>
            </div>
        `;
        
        output.innerHTML = statsHtml;
    }

    /**
     * Initialize hidden stats page feature
     * Activated by pressing F + S keys simultaneously for 2+ seconds
     */
    function initStatsPage() {
        let fKeyPressed = false;
        let sKeyPressed = false;
        let keyPressTimer = null;
        
        // Track F key press
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'f') {
                fKeyPressed = true;
                checkStatsActivation();
            } else if (e.key.toLowerCase() === 's') {
                sKeyPressed = true;
                checkStatsActivation();
            }
        });
        
        // Track key release
        document.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'f') {
                fKeyPressed = false;
                clearTimeout(keyPressTimer);
                keyPressTimer = null;
            } else if (e.key.toLowerCase() === 's') {
                sKeyPressed = false;
                clearTimeout(keyPressTimer);
                keyPressTimer = null;
            }
        });
        
        /**
         * Check if both F and S keys are pressed and start timer
         */
        function checkStatsActivation() {
            if (fKeyPressed && sKeyPressed && !keyPressTimer) {
                // Start 2-second timer
                keyPressTimer = setTimeout(() => {
                    // Both keys held for 2 seconds - show stats page
                    showStatsPage();
                }, 2000);
            }
        }
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize application
     * Sets up all features including terminal, search, mobile support, and stats page
     */
    function init() {
        console.log('Initializing Papers Portal (Static Demo)...');
        
        // Initialize all features
        initTerminal();        // Initialize terminal display with welcome message
        initSearchModal();     // Set up desktop search modal (Ctrl+K)
        initMobile();          // Configure mobile-specific features
        initStatsPage();       // Enable hidden stats page (F+S for 2 seconds)
        
        console.log('Papers Portal initialized');
        console.log('Hidden feature: Press and hold F+S for 2 seconds to view stats');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

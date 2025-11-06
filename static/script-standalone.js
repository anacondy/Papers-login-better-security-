/**
 * Previous Year Papers Portal - Standalone Client-side JavaScript
 * This is a static demo version for GitHub Pages
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    
    const CONFIG = {
        searchDelay: 300, // Debounce delay in ms
        maxSearchLength: 100,
        minSearchLength: 2
    };

    // Mock papers data for demo
    const MOCK_PAPERS = [
        {
            class: 'MCA',
            subject: 'Data Structures',
            semester: 1,
            exam_year: 2025,
            url: '#'
        },
        {
            class: 'MCA',
            subject: 'Computer Networks',
            semester: 2,
            exam_year: 2024,
            url: '#'
        },
        {
            class: 'BCA',
            subject: 'Programming in C',
            semester: 1,
            exam_year: 2025,
            url: '#'
        },
        {
            class: 'BSc',
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
            class: 'BA',
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
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Validate search query
     * @param {string} query - Search query
     * @returns {boolean} Is valid
     */
    function validateSearchQuery(query) {
        if (!query || query.length < CONFIG.minSearchLength) {
            return false;
        }
        if (query.length > CONFIG.maxSearchLength) {
            return false;
        }
        // Allow only alphanumeric, spaces, and basic punctuation
        const validPattern = /^[a-zA-Z0-9\s\-_.]+$/;
        return validPattern.test(query);
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ============================================================================
    // SEARCH FUNCTIONALITY
    // ============================================================================

    /**
     * Search papers in mock data
     * @param {string} query - Search query
     * @returns {Array} Filtered papers
     */
    function searchPapers(query) {
        if (!query) {
            return MOCK_PAPERS;
        }
        
        const queryLower = query.toLowerCase();
        return MOCK_PAPERS.filter(paper => 
            paper.subject.toLowerCase().includes(queryLower) ||
            paper.class.toLowerCase().includes(queryLower) ||
            paper.exam_year.toString().includes(queryLower)
        );
    }

    /**
     * Perform search (static version)
     * @param {string} query - Search query
     */
    function performSearch(query) {
        if (!validateSearchQuery(query)) {
            displayError('Invalid search query. Please use alphanumeric characters only.');
            return;
        }

        const results = searchPapers(query);
        
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
     */
    function initTerminal() {
        const output = document.getElementById('output');
        if (!output) return;

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
    // MOBILE DETECTION
    // ============================================================================

    /**
     * Detect if device is mobile
     * @returns {boolean} Is mobile
     */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Initialize mobile-specific features
     */
    function initMobile() {
        if (isMobileDevice()) {
            document.body.classList.add('is-mobile');
            
            const mobileSearchInput = document.getElementById('mobile-search-input');
            if (mobileSearchInput) {
                mobileSearchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const query = e.target.value.trim();
                        if (query) {
                            performSearch(query);
                        }
                    }
                });
                
                // Also support real-time search with debounce
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
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize application
     */
    function init() {
        console.log('Initializing Papers Portal (Static Demo)...');
        
        // Initialize features
        initTerminal();
        initSearchModal();
        initMobile();
        
        console.log('Papers Portal initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

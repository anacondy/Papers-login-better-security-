/**
 * Previous Year Papers Portal - Client-side JavaScript
 * Security: This file implements secure client-side functionality
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
     * Get CSRF token from meta tag or cookie
     * @returns {string} CSRF token
     */
    function getCSRFToken() {
        // Try to get from meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        // Try to get from cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrf_token') {
                return decodeURIComponent(value);
            }
        }
        
        return '';
    }

    /**
     * Perform search request
     * @param {string} query - Search query
     */
    async function performSearch(query) {
        if (!validateSearchQuery(query)) {
            console.warn('Invalid search query');
            return;
        }

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    displayError('Rate limit exceeded. Please try again later.');
                } else {
                    displayError('Search failed. Please try again.');
                }
                return;
            }

            const data = await response.json();
            displayResults(data.results);
        } catch (error) {
            console.error('Search error:', error);
            displayError('An error occurred. Please try again.');
        }
    }

    /**
     * Display search results
     * @param {Array} results - Search results
     */
    function displayResults(results) {
        const output = document.getElementById('output');
        if (!output) return;

        const resultsHtml = results.map(result => {
            const title = escapeHtml(result.title || 'Untitled');
            const subject = escapeHtml(result.subject || 'Unknown');
            const year = escapeHtml(result.year || 'N/A');
            const url = escapeHtml(result.url || '#');
            
            return `
                <div class="line search-result">
                    <a href="${url}" rel="noopener noreferrer">
                        ${title} - ${subject} (${year})
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
                const debouncedSearch = debounce((e) => {
                    const query = e.target.value.trim();
                    if (query) {
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
        console.log('Initializing Papers Portal...');
        
        // Initialize features
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

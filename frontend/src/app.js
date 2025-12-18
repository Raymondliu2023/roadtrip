// Main Application - Car Rental Search Homepage

import { SearchForm } from './components/SearchForm.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';
import { ResultsList } from './components/ResultsList.js';
import { Pagination } from './components/Pagination.js';
import { search, isNetworkError } from './services/searchService.js';
import { getPaginationState, savePaginationState } from './services/storageService.js';

class RentalSearchApp {
  constructor() {
    this.currentResults = [];
    this.currentPage = 1;
    this.isSearching = false;

    // Initialize components
    this.searchForm = new SearchForm('search-section', (params) => this.handleSearch(params));
    this.loadingSpinner = new LoadingSpinner('results-section');
    this.resultsList = new ResultsList('results-section');
    this.pagination = new Pagination('results-section', (page) => this.handlePageChange(page));

    // Try to restore previous pagination state
    this.currentPage = getPaginationState();

    console.log('Rental Search App initialized');
  }

  /**
   * Handle search form submission
   * @param {object} searchParams - Search parameters from form
   */
  async handleSearch(searchParams) {
    if (this.isSearching) {
      return; // Prevent duplicate searches
    }

    this.isSearching = true;

    // Show loading spinner
    this.loadingSpinner.show();

    // Scroll to results section
    document.getElementById('results-section').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    try {
      // Call search API
      const response = await search(searchParams);

      // Store results
      this.currentResults = response.results;

      // Reset to page 1 for new search
      this.currentPage = 1;
      savePaginationState(1);

      // Display results
      this.displayResults();

      console.log(`Search completed: ${response.totalResults} results found`);

    } catch (error) {
      console.error('Search error:', error);

      // Hide loading spinner
      this.loadingSpinner.hide();

      // Determine error type and show appropriate message
      let errorMessage = error.message;

      if (isNetworkError(error)) {
        errorMessage = 'Unable to connect to rental services. Please check your connection and try again.';
      }

      // Display error
      this.resultsList.renderError(errorMessage);

    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Handle pagination page change
   * @param {number} newPage - New page number
   */
  handlePageChange(newPage) {
    this.currentPage = newPage;
    savePaginationState(newPage);

    // Scroll to top of results
    document.getElementById('results-section').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Re-render results for new page
    this.displayResults();

    console.log(`Page changed to: ${newPage}`);
  }

  /**
   * Display current results with pagination
   */
  displayResults() {
    // Hide loading spinner
    this.loadingSpinner.hide();

    // Render results for current page
    this.resultsList.render(this.currentResults, this.currentPage);

    // Render pagination controls
    this.pagination.render(this.currentResults.length, this.currentPage);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RentalSearchApp();
  });
} else {
  new RentalSearchApp();
}

// Export for testing
export { RentalSearchApp };

// ResultsList Component - Container for rental result cards

import { ResultCard } from './ResultCard.js';
import { PAGINATION } from '../utils/constants.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

export class ResultsList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  /**
   * Render the results list with pagination
   * @param {Array} results - Array of rental results
   * @param {number} currentPage - Current page number (1-indexed)
   */
  render(results, currentPage = 1) {
    // Clear loading spinner
    this.container.innerHTML = '';

    // Handle empty results
    if (!results || results.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;
    const endIndex = startIndex + PAGINATION.ITEMS_PER_PAGE;
    const pageResults = results.slice(startIndex, endIndex);

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-list';
    resultsContainer.setAttribute('data-testid', 'results-list');

    // Render each result card
    pageResults.forEach(result => {
      const card = new ResultCard(result);
      resultsContainer.appendChild(card.render());
    });

    this.container.appendChild(resultsContainer);
  }

  /**
   * Render empty state when no results found
   */
  renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.setAttribute('data-testid', 'empty-state');

    emptyState.innerHTML = `
      <svg class="empty-state__icon" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="empty-state__title">No Results Found</h2>
      <p class="empty-state__message">${ERROR_MESSAGES.NO_RESULTS}</p>
    `;

    this.container.appendChild(emptyState);
  }

  /**
   * Render error message
   * @param {string} errorMessage - Error message to display
   */
  renderError(errorMessage) {
    this.container.innerHTML = '';

    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.setAttribute('data-testid', 'error-message');

    errorContainer.innerHTML = `
      <div class="error-message">
        <svg class="error-message__icon" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="error-message__content">
          <h3 class="error-message__title">Search Error</h3>
          <p class="error-message__text">${errorMessage}</p>
        </div>
      </div>
    `;

    this.container.appendChild(errorContainer);
  }

  /**
   * Clear the results list
   */
  clear() {
    this.container.innerHTML = '';
  }
}

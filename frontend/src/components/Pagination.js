// Pagination Component - Page navigation controls

import { PAGINATION } from '../utils/constants.js';

export class Pagination {
  constructor(containerId, onPageChange) {
    this.container = document.getElementById(containerId);
    this.onPageChange = onPageChange; // Callback when page changes
  }

  /**
   * Render pagination controls
   * @param {number} totalResults - Total number of results
   * @param {number} currentPage - Current page number (1-indexed)
   */
  render(totalResults, currentPage = 1) {
    // Don't show pagination if results fit on one page
    if (totalResults <= PAGINATION.ITEMS_PER_PAGE) {
      this.hide();
      return;
    }

    const totalPages = Math.ceil(totalResults / PAGINATION.ITEMS_PER_PAGE);

    // Find or create pagination container
    let paginationElement = this.container.querySelector('[data-testid="pagination"]');

    if (!paginationElement) {
      paginationElement = document.createElement('div');
      paginationElement.className = 'pagination';
      paginationElement.setAttribute('data-testid', 'pagination');
      this.container.appendChild(paginationElement);
    }

    paginationElement.innerHTML = `
      <button
        class="pagination__button pagination__button--prev"
        data-testid="page-prev"
        ${currentPage === 1 ? 'disabled' : ''}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>

      <div class="pagination__info" data-testid="page-info">
        Page <span class="pagination__current">${currentPage}</span> of <span class="pagination__total">${totalPages}</span>
      </div>

      <button
        class="pagination__button pagination__button--next"
        data-testid="page-next"
        ${currentPage === totalPages ? 'disabled' : ''}
      >
        Next
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <div class="pagination__results-count">
        Showing ${Math.min((currentPage - 1) * PAGINATION.ITEMS_PER_PAGE + 1, totalResults)}–${Math.min(currentPage * PAGINATION.ITEMS_PER_PAGE, totalResults)} of ${totalResults} results
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners(currentPage, totalPages);
  }

  attachEventListeners(currentPage, totalPages) {
    const prevButton = this.container.querySelector('[data-testid="page-prev"]');
    const nextButton = this.container.querySelector('[data-testid="page-next"]');

    if (prevButton && currentPage > 1) {
      prevButton.addEventListener('click', () => {
        if (this.onPageChange) {
          this.onPageChange(currentPage - 1);
        }
      });
    }

    if (nextButton && currentPage < totalPages) {
      nextButton.addEventListener('click', () => {
        if (this.onPageChange) {
          this.onPageChange(currentPage + 1);
        }
      });
    }
  }

  /**
   * Hide pagination controls
   */
  hide() {
    const paginationElement = this.container.querySelector('[data-testid="pagination"]');
    if (paginationElement) {
      paginationElement.remove();
    }
  }
}

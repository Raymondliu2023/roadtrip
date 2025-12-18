// LocalStorage Service for UI State Persistence

const STORAGE_KEYS = {
  PAGINATION_PAGE: 'roadtrip_current_page',
  EXPANDED_CARD: 'roadtrip_expanded_card'
};

/**
 * Save current pagination page to localStorage
 * @param {number} page - Current page number (1-indexed)
 */
export function savePaginationState(page) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGINATION_PAGE, String(page));
  } catch (error) {
    console.warn('Failed to save pagination state:', error);
  }
}

/**
 * Get saved pagination page from localStorage
 * @returns {number} Saved page number or 1 if not found
 */
export function getPaginationState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGINATION_PAGE);
    const page = saved ? parseInt(saved, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  } catch (error) {
    console.warn('Failed to get pagination state:', error);
    return 1;
  }
}

/**
 * Save currently expanded card ID to localStorage
 * @param {string|null} cardId - Card ID or null to clear
 */
export function saveExpandedCard(cardId) {
  try {
    if (cardId === null) {
      localStorage.removeItem(STORAGE_KEYS.EXPANDED_CARD);
    } else {
      localStorage.setItem(STORAGE_KEYS.EXPANDED_CARD, cardId);
    }
  } catch (error) {
    console.warn('Failed to save expanded card state:', error);
  }
}

/**
 * Get currently expanded card ID from localStorage
 * @returns {string|null} Card ID or null if none expanded
 */
export function getExpandedCard() {
  try {
    return localStorage.getItem(STORAGE_KEYS.EXPANDED_CARD);
  } catch (error) {
    console.warn('Failed to get expanded card state:', error);
    return null;
  }
}

/**
 * Clear all saved state from localStorage
 */
export function clearState() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear state:', error);
  }
}

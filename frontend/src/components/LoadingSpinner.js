// LoadingSpinner Component - Animated loading indicator

export class LoadingSpinner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  show() {
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    spinner.setAttribute('data-testid', 'loading-spinner');
    spinner.innerHTML = `
      <div class="spinner">
        <div class="spinner__circle"></div>
        <p class="spinner__text">Searching for available rentals...</p>
      </div>
    `;

    // Clear container and add spinner
    this.container.innerHTML = '';
    this.container.appendChild(spinner);
    this.container.style.display = 'flex';
  }

  hide() {
    const spinner = this.container.querySelector('[data-testid="loading-spinner"]');
    if (spinner) {
      spinner.remove();
    }
  }
}

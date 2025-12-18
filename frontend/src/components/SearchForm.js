// SearchForm Component - Car rental search interface

import { EU_CITIES, DEFAULT_CITY } from '../utils/constants.js';
import { getCurrentDate, getTomorrowDate, formatDateForInput, formatTimeForInput, combineDateAndTime } from '../utils/dateHelpers.js';
import { validateSearchForm } from '../utils/validation.js';

export class SearchForm {
  constructor(containerId, onSearch) {
    this.container = document.getElementById(containerId);
    this.onSearch = onSearch; // Callback function when search is submitted
    this.defaultCity = DEFAULT_CITY;

    this.state = {
      city: this.defaultCity,
      pickupDate: getCurrentDate(),
      dropoffDate: getTomorrowDate()
    };

    this.render();
    this.attachEventListeners();
  }

  /**
   * Update default city (used by geolocation service)
   * @param {string} city - City name
   */
  setDefaultCity(city) {
    if (EU_CITIES.includes(city)) {
      this.defaultCity = city;
      this.state.city = city;
      this.render();
    }
  }

  render() {
    const pickupDateStr = formatDateForInput(this.state.pickupDate);
    const pickupTimeStr = formatTimeForInput(this.state.pickupDate);
    const dropoffDateStr = formatDateForInput(this.state.dropoffDate);
    const dropoffTimeStr = formatTimeForInput(this.state.dropoffDate);

    this.container.innerHTML = `
      <form class="search-form" data-testid="search-form">
        <div class="search-form__grid">
          <div class="form-group">
            <label for="city-select">City</label>
            <select id="city-select" data-testid="city-select" required>
              ${EU_CITIES.map(city => `
                <option value="${city}" ${city === this.state.city ? 'selected' : ''}>
                  ${city}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="pickup-date">Pick-up Date</label>
            <input
              type="date"
              id="pickup-date"
              data-testid="pickup-date"
              value="${pickupDateStr}"
              min="${formatDateForInput(new Date())}"
              required
            />
          </div>

          <div class="form-group">
            <label for="pickup-time">Pick-up Time</label>
            <input
              type="time"
              id="pickup-time"
              data-testid="pickup-time"
              value="${pickupTimeStr}"
              required
            />
          </div>

          <div class="form-group">
            <label for="dropoff-date">Drop-off Date</label>
            <input
              type="date"
              id="dropoff-date"
              data-testid="dropoff-date"
              value="${dropoffDateStr}"
              min="${pickupDateStr}"
              required
            />
          </div>

          <div class="form-group">
            <label for="dropoff-time">Drop-off Time</label>
            <input
              type="time"
              id="dropoff-time"
              data-testid="dropoff-time"
              value="${dropoffTimeStr}"
              required
            />
          </div>

          <div class="form-group form-group--button">
            <button
              type="submit"
              class="btn-primary"
              data-testid="search-button"
            >
              Search Rentals
            </button>
          </div>
        </div>

        <div id="validation-error" data-testid="validation-error" class="error-message" style="display: none;"></div>
      </form>
    `;
  }

  attachEventListeners() {
    const form = this.container.querySelector('form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Update state when inputs change
    const citySelect = this.container.querySelector('#city-select');
    citySelect.addEventListener('change', (e) => {
      this.state.city = e.target.value;
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    // Gather form values
    const city = this.container.querySelector('#city-select').value;
    const pickupDateStr = this.container.querySelector('#pickup-date').value;
    const pickupTimeStr = this.container.querySelector('#pickup-time').value;
    const dropoffDateStr = this.container.querySelector('#dropoff-date').value;
    const dropoffTimeStr = this.container.querySelector('#dropoff-time').value;

    // Combine date and time
    const pickupDate = combineDateAndTime(pickupDateStr, pickupTimeStr);
    const dropoffDate = combineDateAndTime(dropoffDateStr, dropoffTimeStr);

    // Validate form
    const validation = validateSearchForm({ city, pickupDate, dropoffDate });

    const errorElement = this.container.querySelector('#validation-error');

    if (!validation.valid) {
      // Display validation errors
      const errorMessages = Object.values(validation.errors).join('. ');
      errorElement.textContent = errorMessages;
      errorElement.style.display = 'block';
      return;
    }

    // Hide validation errors
    errorElement.style.display = 'none';

    // Trigger search callback
    if (this.onSearch) {
      this.onSearch({ city, pickupDateTime: pickupDate, dropoffDateTime: dropoffDate });
    }
  }
}

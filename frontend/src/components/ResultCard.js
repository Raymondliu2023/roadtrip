// ResultCard Component - Individual rental result card

import { PLACEHOLDERS } from '../utils/constants.js';

export class ResultCard {
  constructor(result) {
    this.result = result;
  }

  render() {
    const { id, provider, price, carModel, routeInfo } = this.result;

    const cardElement = document.createElement('div');
    cardElement.className = 'result-card';
    cardElement.setAttribute('data-testid', `result-card-${id}`);

    // Handle image loading errors with placeholders
    const carImageUrl = carModel.imageUrl || PLACEHOLDERS.CAR_IMAGE;
    const routeImageUrl = routeInfo.thumbnailUrl || PLACEHOLDERS.ROUTE_THUMBNAIL;

    cardElement.innerHTML = `
      <div class="result-card__images">
        <img
          src="${carImageUrl}"
          alt="${carModel.name}"
          class="result-card__car-image"
          data-testid="card-car-image"
          onerror="this.src='${PLACEHOLDERS.CAR_IMAGE}'"
        />
        <img
          src="${routeImageUrl}"
          alt="Route preview"
          class="result-card__route-thumbnail"
          data-testid="card-route-thumbnail"
          onerror="this.src='${PLACEHOLDERS.ROUTE_THUMBNAIL}'"
        />
      </div>

      <div class="result-card__content">
        <div class="result-card__header">
          <h3 class="result-card__provider" data-testid="card-provider">${provider}</h3>
          <div class="result-card__price" data-testid="card-price">
            <span class="price__amount">€${price.amount.toFixed(2)}</span>
            <span class="price__period">/ day</span>
          </div>
        </div>

        <div class="result-card__details">
          <div class="detail-item">
            <span class="detail-item__label">Car Model:</span>
            <span class="detail-item__value">${carModel.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Category:</span>
            <span class="detail-item__value">${carModel.category}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Passengers:</span>
            <span class="detail-item__value">${carModel.passengers}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Transmission:</span>
            <span class="detail-item__value">${carModel.transmission}</span>
          </div>
        </div>

        <div class="result-card__route-info">
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/>
            </svg>
            <span>${routeInfo.estimatedDuration.hours}h ${routeInfo.estimatedDuration.minutes}m</span>
          </div>
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M2 4l6 4 6-4v8l-6 4-6-4V4z"/>
            </svg>
            <span>${routeInfo.totalDistance.value} ${routeInfo.totalDistance.unit}</span>
          </div>
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
            </svg>
            <span>${routeInfo.attractions.length} attractions</span>
          </div>
        </div>

        ${this.result.availability
          ? '<span class="availability-badge availability-badge--available">Available</span>'
          : '<span class="availability-badge availability-badge--unavailable">Unavailable</span>'
        }
      </div>
    `;

    return cardElement;
  }
}

(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const _=["Amsterdam","Athens","Berlin","Brussels","Bucharest","Budapest","Copenhagen","Dublin","Helsinki","Lisbon","Ljubljana","London","Luxembourg","Madrid","Nicosia","Paris","Prague","Riga","Rome","Sofia","Stockholm","Tallinn","Valletta","Vienna","Vilnius","Warsaw","Zagreb","Barcelona","Bologna","Bordeaux","Bratislava","Bruges","Cologne","Cork","Dresden","Edinburgh","Florence","Frankfurt","Geneva","Granada","Hamburg","Heidelberg","Innsbruck","Krakow","Leipzig","Lyon","Manchester","Marseille","Milan","Munich","Naples","Nice","Oxford","Porto","Salzburg","Seville","Strasbourg","Toledo","Venice","Verona","Zurich"].sort(),I="London",f={PICKUP_HOUR:10,PICKUP_MINUTE:0,DROPOFF_HOUR:10,DROPOFF_MINUTE:0},u={ITEMS_PER_PAGE:10},g={BASE_URL:"/api/v1",ENDPOINTS:{SEARCH:"/search"},TIMEOUT:3e4},o={NO_RESULTS:"No rental cars found for your search criteria. Try adjusting your dates or city.",BACKEND_ERROR:"Unable to connect to rental services. Please try again later.",INVALID_DATE_RANGE:"Drop-off date/time must be after pick-up date/time.",PAST_DATE:"Pick-up date/time cannot be in the past.",INVALID_CITY:"Please select a valid EU city.",NETWORK_ERROR:"Network error occurred. Please check your connection and try again."},h={CAR_IMAGE:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e2e8f0" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ECar Image%3C/text%3E%3C/svg%3E',ROUTE_THUMBNAIL:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e2e8f0" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ERoute Map%3C/text%3E%3C/svg%3E'};function N(){const t=new Date;return t.setHours(f.PICKUP_HOUR,f.PICKUP_MINUTE,0,0),t}function D(){const t=new Date;return t.setDate(t.getDate()+1),t.setHours(f.DROPOFF_HOUR,f.DROPOFF_MINUTE,0,0),t}function E(t){if(!(t instanceof Date)||isNaN(t))throw new Error("Invalid date provided to formatDateTime");return t.toISOString()}function v(t){if(!(t instanceof Date)||isNaN(t))return"";const e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${r}`}function y(t){if(!(t instanceof Date)||isNaN(t))return"";const e=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0");return`${e}:${a}`}function S(t,e){if(!t||!e)throw new Error("Both date and time are required");const[a,r]=e.split(":").map(Number),i=new Date(t);return i.setHours(a,r,0,0),i}function w(t,e){return!(t instanceof Date)||!(e instanceof Date)||isNaN(t)||isNaN(e)?!1:e>t}function A(t){return!(t instanceof Date)||isNaN(t)?!1:t<new Date}function C(t){if(!t||typeof t!="string")return{valid:!1,error:o.INVALID_CITY};const e=t.trim();return e===""||!_.includes(e)?{valid:!1,error:o.INVALID_CITY}:{valid:!0,error:null}}function P(t){return!t||!(t instanceof Date)||isNaN(t)?{valid:!1,error:"Invalid date provided"}:A(t)?{valid:!1,error:o.PAST_DATE}:{valid:!0,error:null}}function L(t,e){return!t||!e?{valid:!1,error:"Both pickup and dropoff dates are required"}:!(t instanceof Date)||!(e instanceof Date)?{valid:!1,error:"Invalid date objects provided"}:isNaN(t)||isNaN(e)?{valid:!1,error:"Invalid date values provided"}:w(t,e)?{valid:!0,error:null}:{valid:!1,error:o.INVALID_DATE_RANGE}}function M(t){const e={};let a=!0;const r=C(t.city);r.valid||(e.city=r.error,a=!1);const i=P(t.pickupDate);i.valid||(e.pickupDate=i.error,a=!1);const s=L(t.pickupDate,t.dropoffDate);return s.valid||(e.dateRange=s.error,a=!1),{valid:a,errors:e}}class O{constructor(e,a){this.container=document.getElementById(e),this.onSearch=a,this.defaultCity=I,this.state={city:this.defaultCity,pickupDate:N(),dropoffDate:D()},this.render(),this.attachEventListeners()}setDefaultCity(e){_.includes(e)&&(this.defaultCity=e,this.state.city=e,this.render())}render(){const e=v(this.state.pickupDate),a=y(this.state.pickupDate),r=v(this.state.dropoffDate),i=y(this.state.dropoffDate);this.container.innerHTML=`
      <form class="search-form" data-testid="search-form">
        <div class="search-form__grid">
          <div class="form-group">
            <label for="city-select">City</label>
            <select id="city-select" data-testid="city-select" required>
              ${_.map(s=>`
                <option value="${s}" ${s===this.state.city?"selected":""}>
                  ${s}
                </option>
              `).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="pickup-date">Pick-up Date</label>
            <input
              type="date"
              id="pickup-date"
              data-testid="pickup-date"
              value="${e}"
              min="${v(new Date)}"
              required
            />
          </div>

          <div class="form-group">
            <label for="pickup-time">Pick-up Time</label>
            <input
              type="time"
              id="pickup-time"
              data-testid="pickup-time"
              value="${a}"
              required
            />
          </div>

          <div class="form-group">
            <label for="dropoff-date">Drop-off Date</label>
            <input
              type="date"
              id="dropoff-date"
              data-testid="dropoff-date"
              value="${r}"
              min="${e}"
              required
            />
          </div>

          <div class="form-group">
            <label for="dropoff-time">Drop-off Time</label>
            <input
              type="time"
              id="dropoff-time"
              data-testid="dropoff-time"
              value="${i}"
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
    `}attachEventListeners(){this.container.querySelector("form").addEventListener("submit",r=>this.handleSubmit(r)),this.container.querySelector("#city-select").addEventListener("change",r=>{this.state.city=r.target.value})}handleSubmit(e){e.preventDefault();const a=this.container.querySelector("#city-select").value,r=this.container.querySelector("#pickup-date").value,i=this.container.querySelector("#pickup-time").value,s=this.container.querySelector("#dropoff-date").value,n=this.container.querySelector("#dropoff-time").value,c=S(r,i),l=S(s,n),m=M({city:a,pickupDate:c,dropoffDate:l}),d=this.container.querySelector("#validation-error");if(!m.valid){const p=Object.values(m.errors).join(". ");d.textContent=p,d.style.display="block";return}d.style.display="none",this.onSearch&&this.onSearch({city:a,pickupDateTime:c,dropoffDateTime:l})}}class ${constructor(e){this.container=document.getElementById(e)}show(){const e=document.createElement("div");e.className="loading",e.setAttribute("data-testid","loading-spinner"),e.innerHTML=`
      <div class="spinner">
        <div class="spinner__circle"></div>
        <p class="spinner__text">Searching for available rentals...</p>
      </div>
    `,this.container.innerHTML="",this.container.appendChild(e),this.container.style.display="flex"}hide(){const e=this.container.querySelector('[data-testid="loading-spinner"]');e&&e.remove()}}class k{constructor(e){this.result=e}render(){const{id:e,provider:a,price:r,carModel:i,routeInfo:s}=this.result,n=document.createElement("div");n.className="result-card",n.setAttribute("data-testid",`result-card-${e}`);const c=i.imageUrl||h.CAR_IMAGE,l=s.thumbnailUrl||h.ROUTE_THUMBNAIL;return n.innerHTML=`
      <div class="result-card__images">
        <img
          src="${c}"
          alt="${i.name}"
          class="result-card__car-image"
          data-testid="card-car-image"
          onerror="this.src='${h.CAR_IMAGE}'"
        />
        <img
          src="${l}"
          alt="Route preview"
          class="result-card__route-thumbnail"
          data-testid="card-route-thumbnail"
          onerror="this.src='${h.ROUTE_THUMBNAIL}'"
        />
      </div>

      <div class="result-card__content">
        <div class="result-card__header">
          <h3 class="result-card__provider" data-testid="card-provider">${a}</h3>
          <div class="result-card__price" data-testid="card-price">
            <span class="price__amount">€${r.amount.toFixed(2)}</span>
            <span class="price__period">/ day</span>
          </div>
        </div>

        <div class="result-card__details">
          <div class="detail-item">
            <span class="detail-item__label">Car Model:</span>
            <span class="detail-item__value">${i.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Category:</span>
            <span class="detail-item__value">${i.category}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Passengers:</span>
            <span class="detail-item__value">${i.passengers}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Transmission:</span>
            <span class="detail-item__value">${i.transmission}</span>
          </div>
        </div>

        <div class="result-card__route-info">
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/>
            </svg>
            <span>${s.estimatedDuration.hours}h ${s.estimatedDuration.minutes}m</span>
          </div>
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M2 4l6 4 6-4v8l-6 4-6-4V4z"/>
            </svg>
            <span>${s.totalDistance.value} ${s.totalDistance.unit}</span>
          </div>
          <div class="route-info__item">
            <svg class="icon" width="16" height="16" fill="currentColor">
              <path d="M8 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
            </svg>
            <span>${s.attractions.length} attractions</span>
          </div>
        </div>

        ${this.result.availability?'<span class="availability-badge availability-badge--available">Available</span>':'<span class="availability-badge availability-badge--unavailable">Unavailable</span>'}
      </div>
    `,n}}class B{constructor(e){this.container=document.getElementById(e)}render(e,a=1){if(this.container.innerHTML="",!e||e.length===0){this.renderEmptyState();return}const r=(a-1)*u.ITEMS_PER_PAGE,i=r+u.ITEMS_PER_PAGE,s=e.slice(r,i),n=document.createElement("div");n.className="results-list",n.setAttribute("data-testid","results-list"),s.forEach(c=>{const l=new k(c);n.appendChild(l.render())}),this.container.appendChild(n)}renderEmptyState(){const e=document.createElement("div");e.className="empty-state",e.setAttribute("data-testid","empty-state"),e.innerHTML=`
      <svg class="empty-state__icon" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="empty-state__title">No Results Found</h2>
      <p class="empty-state__message">${o.NO_RESULTS}</p>
    `,this.container.appendChild(e)}renderError(e){this.container.innerHTML="";const a=document.createElement("div");a.className="error-container",a.setAttribute("data-testid","error-message"),a.innerHTML=`
      <div class="error-message">
        <svg class="error-message__icon" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="error-message__content">
          <h3 class="error-message__title">Search Error</h3>
          <p class="error-message__text">${e}</p>
        </div>
      </div>
    `,this.container.appendChild(a)}clear(){this.container.innerHTML=""}}class U{constructor(e,a){this.container=document.getElementById(e),this.onPageChange=a}render(e,a=1){if(e<=u.ITEMS_PER_PAGE){this.hide();return}const r=Math.ceil(e/u.ITEMS_PER_PAGE);let i=this.container.querySelector('[data-testid="pagination"]');i||(i=document.createElement("div"),i.className="pagination",i.setAttribute("data-testid","pagination"),this.container.appendChild(i)),i.innerHTML=`
      <button
        class="pagination__button pagination__button--prev"
        data-testid="page-prev"
        ${a===1?"disabled":""}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>

      <div class="pagination__info" data-testid="page-info">
        Page <span class="pagination__current">${a}</span> of <span class="pagination__total">${r}</span>
      </div>

      <button
        class="pagination__button pagination__button--next"
        data-testid="page-next"
        ${a===r?"disabled":""}
      >
        Next
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <div class="pagination__results-count">
        Showing ${Math.min((a-1)*u.ITEMS_PER_PAGE+1,e)}–${Math.min(a*u.ITEMS_PER_PAGE,e)} of ${e} results
      </div>
    `,this.attachEventListeners(a,r)}attachEventListeners(e,a){const r=this.container.querySelector('[data-testid="page-prev"]'),i=this.container.querySelector('[data-testid="page-next"]');r&&e>1&&r.addEventListener("click",()=>{this.onPageChange&&this.onPageChange(e-1)}),i&&e<a&&i.addEventListener("click",()=>{this.onPageChange&&this.onPageChange(e+1)})}hide(){const e=this.container.querySelector('[data-testid="pagination"]');e&&e.remove()}}async function x(t){const{city:e,pickupDateTime:a,dropoffDateTime:r}=t,i={city:e,pickupDateTime:E(a),dropoffDateTime:E(r)},s=`${g.BASE_URL}${g.ENDPOINTS.SEARCH}`;try{const n=new AbortController,c=setTimeout(()=>n.abort(),g.TIMEOUT),l=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i),signal:n.signal});if(clearTimeout(c),l.ok){const p=await l.json();return{success:!0,results:p.results||[],totalResults:p.totalResults||0,timestamp:p.timestamp}}const d=(await l.json().catch(()=>({}))).error||{};switch(l.status){case 400:throw new Error(d.message||o.INVALID_DATE_RANGE);case 429:throw new Error(d.message||"Too many requests. Please try again later.");case 500:throw new Error(o.BACKEND_ERROR);case 503:throw new Error(o.BACKEND_ERROR);default:throw new Error(o.NETWORK_ERROR)}}catch(n){throw n.name==="AbortError"?new Error("Request timed out. Please try again."):n instanceof TypeError&&n.message.includes("fetch")?new Error(o.NETWORK_ERROR):n}}function H(t){return t.message===o.NETWORK_ERROR||t.message===o.BACKEND_ERROR||t.message.includes("timed out")}const R={PAGINATION_PAGE:"roadtrip_current_page",EXPANDED_CARD:"roadtrip_expanded_card"};function b(t){try{localStorage.setItem(R.PAGINATION_PAGE,String(t))}catch(e){console.warn("Failed to save pagination state:",e)}}function G(){try{const t=localStorage.getItem(R.PAGINATION_PAGE),e=t?parseInt(t,10):1;return isNaN(e)||e<1?1:e}catch(t){return console.warn("Failed to get pagination state:",t),1}}class T{constructor(){this.currentResults=[],this.currentPage=1,this.isSearching=!1,this.searchForm=new O("search-section",e=>this.handleSearch(e)),this.loadingSpinner=new $("results-section"),this.resultsList=new B("results-section"),this.pagination=new U("results-section",e=>this.handlePageChange(e)),this.currentPage=G(),console.log("Rental Search App initialized")}async handleSearch(e){if(!this.isSearching){this.isSearching=!0,this.loadingSpinner.show(),document.getElementById("results-section").scrollIntoView({behavior:"smooth",block:"start"});try{const a=await x(e);this.currentResults=a.results,this.currentPage=1,b(1),this.displayResults(),console.log(`Search completed: ${a.totalResults} results found`)}catch(a){console.error("Search error:",a),this.loadingSpinner.hide();let r=a.message;H(a)&&(r="Unable to connect to rental services. Please check your connection and try again."),this.resultsList.renderError(r)}finally{this.isSearching=!1}}}handlePageChange(e){this.currentPage=e,b(e),document.getElementById("results-section").scrollIntoView({behavior:"smooth",block:"start"}),this.displayResults(),console.log(`Page changed to: ${e}`)}displayResults(){this.loadingSpinner.hide(),this.resultsList.render(this.currentResults,this.currentPage),this.pagination.render(this.currentResults.length,this.currentPage)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new T}):new T;

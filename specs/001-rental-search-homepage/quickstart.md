# Quickstart Guide: Car Rental & Self-Drive Tour Search Homepage

**Feature**: 001-rental-search-homepage
**Date**: 2025-12-18
**Purpose**: Manual testing scenarios to validate implementation against specification

## Prerequisites

Before testing, ensure:
1. Frontend application is running and accessible (e.g., http://localhost:8080)
2. Backend API is available and returning mock or real data
3. Testing in a modern desktop browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
4. Browser window is at least 1024px wide

## Test Scenario 1: Basic Homepage Load (P1 - MVP)

**Goal**: Verify the homepage loads with default search parameters

**Steps**:
1. Open a new browser tab/window
2. Navigate to the application homepage
3. Observe the initial page state

**Expected Results**:
- ✅ Page loads within 3 seconds (SC-002)
- ✅ Search form is visible with three input fields: City, Pick-up Date/Time, Drop-off Date/Time
- ✅ City dropdown/field shows "London" as default (or your detected EU city if geolocation works)
- ✅ Pick-up date shows today's date with time 10:00 AM
- ✅ Drop-off date shows tomorrow's date with time 10:00 AM
- ✅ Search button is visible and enabled
- ✅ No results are displayed yet (below the fold or empty state)
- ✅ Visual design appears clean, modern, and professional (SC-008)

**Validation Checkpoints**:
- FR-001: Search form displayed ✓
- FR-002: Default values populated ✓
- SC-001: Can interact with form within 30 seconds ✓
- SC-003: Page displays correctly on desktop (1024px+) ✓

---

## Test Scenario 2: Modify Search Parameters (P1 - MVP)

**Goal**: Verify users can modify search parameters before searching

**Steps**:
1. From the homepage with defaults loaded
2. Click the City dropdown
3. Select "Paris" from the list
4. Click the pick-up date field and select 3 days from now
5. Change pick-up time to 2:00 PM
6. Click the drop-off date field and select 5 days from now
7. Change drop-off time to 6:00 PM
8. Observe the form state (do NOT submit yet)

**Expected Results**:
- ✅ City field updates to "Paris"
- ✅ Pick-up date updates to selected date (3 days from now)
- ✅ Pick-up time updates to 14:00 (2:00 PM)
- ✅ Drop-off date updates to selected date (5 days from now)
- ✅ Drop-off time updates to 18:00 (6:00 PM)
- ✅ Search button remains enabled
- ✅ No validation errors displayed (dates are valid)

**Validation Checkpoints**:
- FR-003: City selection works ✓
- User can modify date/time fields ✓

---

## Test Scenario 3: Submit Search and View Results (P1 - MVP)

**Goal**: Verify search executes and displays results correctly

**Steps**:
1. With search parameters configured (use defaults or Scenario 2 values)
2. Click the "Search" button
3. Observe loading state
4. Wait for results to load
5. Scroll down to view result cards

**Expected Results**:
- ✅ Loading indicator appears immediately after clicking Search (FR-006)
- ✅ Results display within 3 seconds (SC-002)
- ✅ Results appear below the search form on the same page (FR-007)
- ✅ Up to 10 result cards are visible (FR-008)
- ✅ Each card shows: Provider name, Price (€), Car model image, Route thumbnail (FR-009)
- ✅ If more than 10 results exist, pagination controls appear at the bottom (FR-010)
- ✅ All car images load or show placeholders if missing (FR-017)
- ✅ All route thumbnails load or show placeholders if missing (FR-017)

**Validation Checkpoints**:
- FR-006: Loading indicator shown ✓
- FR-007: Results on same page ✓
- FR-008: Max 10 cards displayed ✓
- FR-009: Card content complete ✓
- FR-010: Pagination present (if >10 results) ✓
- SC-002: Results within 3 seconds ✓
- SC-004: 90% of users successfully view results ✓

---

## Test Scenario 4: Navigate Pagination (P1 - MVP)

**Goal**: Verify pagination works correctly when more than 10 results exist

**Prerequisites**: Complete Scenario 3 with a search that returns >10 results (e.g., London, popular dates)

**Steps**:
1. With search results displayed (showing page 1 of N)
2. Scroll to the bottom where pagination controls are visible
3. Click "Next" or "Page 2" button
4. Observe the results update
5. Click "Previous" or "Page 1" button
6. Observe the results update again

**Expected Results**:
- ✅ Page 2 displays the next 10 results (results 11-20)
- ✅ Page loads without errors (SC-005)
- ✅ Pagination controls update to show current page (e.g., "Page 2 of 5")
- ✅ Clicking Previous returns to Page 1 showing results 1-10
- ✅ Previously expanded cards (if any) are collapsed when changing pages
- ✅ Pagination state persists if user refreshes the page (localStorage)

**Validation Checkpoints**:
- FR-010: Pagination controls functional ✓
- SC-005: Zero failed page loads ✓

---

## Test Scenario 5: Expand Result Card (P2 - Detail View)

**Goal**: Verify card expansion reveals detailed route information

**Prerequisites**: Complete Scenario 3 (search results displayed)

**Steps**:
1. With search results visible
2. Click anywhere on the first result card
3. Observe the card expansion animation
4. Review the expanded content

**Expected Results**:
- ✅ Card expands smoothly (FR-011)
- ✅ Expansion completes within 100ms (SC-002 performance goal)
- ✅ Detailed route information is visible including (FR-012):
  - Full itinerary (day-by-day stops)
  - Attraction details with descriptions
  - Estimated driving times
  - Self-drive recommendations
- ✅ Previously collapsed content remains visible (provider, price, car image, etc.)
- ✅ Card is visually distinguishable as expanded (e.g., border, shadow, background)

**Validation Checkpoints**:
- FR-011: Card expands on click ✓
- FR-012: Detailed information displayed ✓
- SC-004: 90% of users successfully expand card ✓

---

## Test Scenario 6: Accordion Behavior (P2 - Detail View)

**Goal**: Verify only one card is expanded at a time (accordion pattern)

**Prerequisites**: Complete Scenario 5 (one card expanded)

**Steps**:
1. With the first result card expanded
2. Click on a different result card (e.g., the third card)
3. Observe both cards' states
4. Click the currently expanded card again (or a collapse button if present)

**Expected Results**:
- ✅ When clicking the third card:
  - First card collapses back to summary view
  - Third card expands to show details
  - Only one card is expanded at a time (FR-013)
- ✅ When clicking the expanded card again:
  - Card collapses back to summary view
  - No cards are expanded

**Validation Checkpoints**:
- FR-013: Accordion behavior enforced ✓

---

## Test Scenario 7: Geolocation Detection (P3 - Enhancement)

**Goal**: Verify smart default location detection works

**Prerequisites**:
- Access the site from a location with geolocation enabled
- Alternatively, use browser dev tools to mock geolocation

**Steps**:
1. Clear browser localStorage (to reset any cached state)
2. Open the homepage in a fresh session
3. If prompted for location permission, click "Allow"
4. Observe the default city in the search form

**Expected Results**:
- ✅ If accessing from major EU city: City field defaults to detected city
- ✅ If accessing from outside EU: City field defaults to London
- ✅ If geolocation denied: City field defaults to London (no errors)
- ✅ If geolocation fails/times out: City field defaults to London (no errors)
- ✅ All EU cities remain available in the dropdown (can override detected city)

**Validation Checkpoints**:
- FR-002: Default city logic ✓
- SC-007: Detected city shown when applicable ✓

---

## Test Scenario 8: Validation - Invalid Date Range (Error Handling)

**Goal**: Verify the system prevents invalid searches

**Steps**:
1. From the homepage with defaults
2. Set pick-up date to December 25, 2025 at 2:00 PM
3. Set drop-off date to December 24, 2025 at 10:00 AM (day before pick-up)
4. Attempt to click "Search" button

**Expected Results**:
- ✅ Search button is disabled OR
- ✅ Clicking Search shows validation error message: "Drop-off date/time must be after pick-up date/time"
- ✅ Error message is user-friendly and clear (FR-016)
- ✅ No API request is made (validated client-side first per FR-004)

**Validation Checkpoints**:
- FR-004: Date validation enforced ✓
- FR-016: User-friendly error message ✓

---

## Test Scenario 9: Validation - Past Date Selection (Error Handling)

**Goal**: Verify the system prevents selecting past dates

**Steps**:
1. From the homepage with defaults
2. Attempt to set pick-up date to yesterday's date
3. Observe the date picker behavior

**Expected Results**:
- ✅ Past dates are disabled in the date picker OR
- ✅ If past date selected, validation error appears: "Pick-up date/time cannot be in the past"
- ✅ Search button is disabled or shows error before submission
- ✅ Error message is clear and actionable (FR-016)

**Validation Checkpoints**:
- FR-005: Past date prevention ✓
- FR-016: User-friendly error message ✓

---

## Test Scenario 10: Backend Error Handling (Error Handling)

**Goal**: Verify graceful handling of backend failures

**Prerequisites**: Backend API is offline, returning 503, or timing out

**Steps**:
1. Configure search parameters
2. Click "Search" button
3. Wait for backend response (or timeout)
4. Observe error state

**Expected Results**:
- ✅ Loading indicator appears initially
- ✅ After 5 seconds (or backend error), error message appears (SC-006)
- ✅ Error message is user-friendly: "Unable to connect to rental services. Please try again later." (FR-016)
- ✅ User can retry the search (search form remains functional)
- ✅ No broken UI elements or JavaScript errors in console

**Validation Checkpoints**:
- FR-016: Backend error handling ✓
- SC-006: Error displayed within 5 seconds ✓

---

## Test Scenario 11: Empty Results (Edge Case)

**Goal**: Verify handling of searches with no results

**Prerequisites**: Backend configured to return zero results for a specific search

**Steps**:
1. Configure search parameters that will return no results (e.g., obscure city, far future dates)
2. Click "Search" button
3. Observe the results area

**Expected Results**:
- ✅ Loading indicator appears and completes
- ✅ Empty state message appears: "No rental cars found for your search criteria. Try adjusting your dates or city." (FR-015)
- ✅ Message is friendly and actionable
- ✅ Search form remains functional for retry

**Validation Checkpoints**:
- FR-015: Empty results handling ✓

---

## Test Scenario 12: Image Loading Failures (Edge Case)

**Goal**: Verify graceful handling of missing images

**Prerequisites**: Backend returns URLs for images that don't exist or fail to load

**Steps**:
1. Perform a search
2. Observe result cards with missing car images or route thumbnails
3. Expand a card with missing attraction thumbnails

**Expected Results**:
- ✅ Missing car images show placeholder (e.g., generic car icon or gray box with "Image unavailable")
- ✅ Missing route thumbnails show placeholder (e.g., map icon or gray box)
- ✅ Missing attraction thumbnails show placeholder
- ✅ Layout remains stable (no broken images or layout shifts)
- ✅ Card functionality is unaffected (expand/collapse still works)

**Validation Checkpoints**:
- FR-017: Image failure handling ✓

---

## Performance Testing

### SC-001: Quick Search Completion
1. Start timer when landing on homepage
2. Modify one parameter (e.g., change city)
3. Click Search
4. **Target**: Complete within 30 seconds

### SC-002: Fast Results Display
1. Click Search button (start timer)
2. Wait for results to display
3. **Target**: Results visible within 3 seconds (95% of attempts)

### SC-003: Desktop Compatibility
1. Test on viewport widths: 1024px, 1366px, 1920px, 2560px
2. **Target**: All elements visible and functional at each width

### SC-004: Expand Success Rate
1. Have 10 testers attempt to expand a result card on first try
2. **Target**: 9 out of 10 (90%) succeed without confusion

### SC-008: Visual Design Quality
1. Show homepage to 10 testers
2. Ask: "Does this design appear clean, modern, and professional?"
3. **Target**: 8 out of 10 (80%) respond positively

---

## Browser Compatibility Testing

Test all scenarios on each target browser:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Focus on desktop experience. Mobile testing is out of scope for this feature (per Assumption #7).

---

## Test Completion Checklist

- [ ] All 12 functional scenarios pass
- [ ] All validation checkpoints satisfied
- [ ] All performance targets met
- [ ] All 4 target browsers tested
- [ ] No console errors during testing
- [ ] Visual design approved by stakeholders

---

## Notes for Testers

1. **Test with Real Data**: If possible, use a backend with realistic rental and route data for authentic testing
2. **Mock Responses**: For contract testing, use mock API responses that match the OpenAPI spec in `contracts/search-api.yaml`
3. **Edge Cases**: Actively try to break the application - unusual cities, extreme dates, rapid clicking, etc.
4. **Accessibility**: While not formally specified, test keyboard navigation (Tab, Enter) as a quality check
5. **Console Monitoring**: Keep browser DevTools open to catch any JavaScript errors or warnings

---

## Troubleshooting Common Issues

**Issue**: Default city not appearing
- **Check**: Geolocation permission in browser settings
- **Fix**: Manually grant permission or clear localStorage and reload

**Issue**: Results not loading
- **Check**: Backend API availability (network tab in DevTools)
- **Fix**: Verify API endpoint URL in searchService.js configuration

**Issue**: Pagination not working
- **Check**: localStorage quota not exceeded
- **Fix**: Clear localStorage or use incognito mode

**Issue**: Images not loading
- **Check**: Image URLs returned by API (network tab)
- **Fix**: Verify CDN availability or image paths

**Issue**: Validation errors not appearing
- **Check**: JavaScript console for errors in validation.js
- **Fix**: Ensure validation logic is correct and triggered on form submission

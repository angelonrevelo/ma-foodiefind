# Foodie Find - Research Findings

## Google Maps API Integration

### Nearby Search API (New)
The Google Maps Nearby Search API is the primary tool for restaurant discovery in Foodie Find.

**Key Capabilities:**
- Search for places within a specified circular area (radius 0-50km)
- Filter by place types (e.g., "restaurant", "cafe", "bar")
- Return detailed place information including ratings, photos, opening hours
- Support for multiple search types and primary types filtering

**Request Format:**
- POST request to `https://places.googleapis.com/v1/places:searchNearby`
- Required parameters: `includedTypes`, `locationRestriction`, `FieldMask`
- Returns JSON with array of Place objects

**Available Fields:**
- Basic: `displayName`, `formattedAddress`, `location`, `types`, `photos`
- Pro SKU: `businessStatus`, `googleMapsUri`, `rating`, `userRatingCount`
- Enterprise SKU: `currentOpeningHours`, `priceLevel`, `websiteUri`, `internationalPhoneNumber`
- Enterprise + Atmosphere: `delivery`, `dineIn`, `takeout`, `reservable`, `curbsidePickup`

**Advantages:**
- No feature limitations for the Manus proxy (automatic authentication)
- Supports advanced filtering by place types
- Returns rich metadata including delivery/dine-in capabilities
- Can search by keywords and type restrictions simultaneously

**Implementation Strategy:**
- Use the Manus proxy for Google Maps API (no user API keys needed)
- Request fields: `places.displayName`, `places.formattedAddress`, `places.location`, `places.photos`, `places.rating`, `places.userRatingCount`, `places.websiteUri`, `places.delivery`, `places.dineIn`, `places.takeout`
- Calculate center point from all room members' locations
- Use radius parameter to define search area (suggest 5-10km for city areas)

---

## Delivery Service Integration

### Grab (GrabFood)
**Current Status:** Limited direct API access for restaurant search
- GrabMaps provides mapping data but not restaurant discovery API
- GrabFood integration available through POS middleware (for restaurants)
- No public consumer API for searching restaurants by delivery availability

**Alternative Approach:**
- Detect Grab availability by checking restaurant's website/Google Maps listing for Grab link
- Use web scraping or manual verification for Grab presence

### Foodpanda
**Current Status:** POS Integration API available (for restaurants, not consumers)
- Foodpanda Integration API is designed for POS systems to manage orders
- Requires NDA and formal partnership agreement
- Not suitable for consumer-facing restaurant discovery

**Alternative Approach:**
- Similar to Grab: detect Foodpanda availability through restaurant website/Google Maps
- Check restaurant's Google Business Profile for delivery service mentions

---

## Recommended Implementation Strategy

### Phase 1: MVP (Google Maps + Manual Detection)
1. Use Google Maps Nearby Search API to find restaurants
2. Detect delivery availability through:
   - Google Maps `delivery` and `dineIn` fields (if available in response)
   - Manual verification by checking restaurant website for Grab/Foodpanda links
   - User feedback and crowdsourced data

### Phase 2: Enhanced Detection
1. Parse restaurant websites for delivery service mentions
2. Implement web scraping for Grab/Foodpanda presence (with proper rate limiting)
3. Build database of restaurants with known delivery services

### Phase 3: Direct Integration
1. Explore official Grab and Foodpanda APIs once business partnerships are established
2. Implement real-time delivery availability checks
3. Integrate with restaurant ordering systems

---

## Technical Notes

- **Authentication:** Use Manus proxy for Google Maps (automatic, no API key needed)
- **Rate Limiting:** Implement caching for search results (5-15 minute TTL)
- **Location Accuracy:** Use geolocation API for user location, calculate centroid for group searches
- **Privacy:** Store location data temporarily, delete after search completion
- **Fallback:** If delivery detection fails, show all restaurants with user-selectable filters

---

## Philippines-Specific Considerations

1. **Major Delivery Platforms:** Grab Food and Foodpanda are the dominant services
2. **Restaurant Coverage:** Most restaurants in Metro Manila and major cities are on at least one platform
3. **Dine-in vs Delivery:** Both services now offer dine-in reservations (as of 2023)
4. **User Preference:** Many Filipino users prefer delivery over dine-in, especially in urban areas
5. **Integration Challenges:** Direct APIs require formal partnerships; web detection is more practical for MVP


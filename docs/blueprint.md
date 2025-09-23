# **App Name**: TransitSage

## Core Features:

- Itinerary Search: Allows users to input a start and destination to find the best transit routes using the /itinerary/routes API. Defaults to current location for start if available, otherwise accepts text input.
- GPS Integration: Uses the device's GPS to get the user's current location for itinerary searches. When the app has the user's location, the user interface should indicate that the gps location will be used for searching for itineraties.
- Bus Line Browser: Displays a list of cities and their respective bus lines, retrieved from the /station/lines API. Includes a hardcoded list of cities as a fallback until the /station/cities API is implemented.
- Line Details View: Shows detailed information about a selected bus line, including a map with the route polyline and a timeline of stops fetched from /station/stops. Allows optional browsing of lines by stop via the /station/lines-by-stop endpoint
- Real-time Delay Prediction: Uses generative AI to analyze real-time traffic and historical data, using internal tool use to make estimations about whether a given route will be delayed and for how long. Displays estimated delays or alternate routes directly within the Itinerary Search results or Line Details.
- Error Handling and Retry Logic: Implements robust error handling, particularly for API cold starts and network timeouts, with user-friendly messages and retry mechanisms.  Handles GPS permission denials gracefully by keeping the location input fields editable.
- Offline Support: Implements intelligent data caching using local storage to allow for continued use when a network is unreliable, and to generally provide immediate results. Cache expiry is refreshed by use or based on network activity, depending on settings.

## Style Guidelines:

- Primary color: Deep blue (#1A237E), evoking trust and reliability, like a dependable transit system.
- Background color: Light gray (#F5F5F5), providing a neutral backdrop that enhances readability and reduces visual fatigue.
- Accent color: Bright orange (#FF9800), highlighting interactive elements and CTAs, making them pop against the primary and background colors.
- Body and headline font: 'PT Sans', a clean and modern sans-serif font, provides excellent legibility for both headlines and body text.
- Code font: 'Source Code Pro' for displaying any code snippets, such as API calls, to preserve formatting and readability.
- Use clear, vector-based icons for cities, bus lines, and stops to enhance usability and visual appeal. The selected set should follow Material Design guidelines to ensure consistency and clarity.
- Employ a card-based layout with soft shadows and rounded corners (16px radius) to create a modern and touch-friendly interface. Ensure consistent 12px inner padding for all cards.
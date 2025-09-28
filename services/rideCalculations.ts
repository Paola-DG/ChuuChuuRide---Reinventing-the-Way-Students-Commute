// --- Pricing Constants for Miami-Dade Area ---
// These constants simulate regional data to calculate fair ride prices.

// For Student Carpool Pricing - Calibrated for affordability to students.
// The goal is to cover the driver's gas and basic vehicle costs, not to be a major income source.
const STUDENT_BASE_FARE = 1.25; // A small base to cover the driver's inconvenience.
const STUDENT_PER_MILE_RATE = 0.30; // Covers gas and some wear-and-tear.
const STUDENT_PER_MINUTE_RATE = 0.04; // A small amount to account for time in traffic.

// For Uber Estimate Simulation
const UBER_BASE_FARE = 2.60;
const UBER_PER_MILE_RATE = 1.20;
const UBER_PER_MINUTE_RATE = 0.22;
const UBER_MINIMUM_FARE = 8.50;

/**
 * Calculates a fair price for a ride per seat.
 * This aims to be significantly cheaper than Uber/Lyft but fair to the student driver.
 * It now includes a time component to account for traffic.
 * @param distance The distance of the ride in miles.
 * @param departureTime The time of departure to estimate traffic.
 * @returns The calculated price for a single seat.
 */
export const calculateRidePrice = (distance: number, departureTime?: Date): number => {
  if (distance <= 0) return 0;

  let minutesPerMile = 2.4; // Average speed ~25 mph
  if (departureTime) {
      const hour = departureTime.getHours();
      const day = departureTime.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const isRushHour = isWeekday && ((hour >= 7 && hour < 10) || (hour >= 16 && hour < 19));
      if (isRushHour) {
          minutesPerMile = 3.5; // Slower speed during heavy traffic
      }
  }
  const estimatedMinutes = distance * minutesPerMile;

  const price = STUDENT_BASE_FARE + (distance * STUDENT_PER_MILE_RATE) + (estimatedMinutes * STUDENT_PER_MINUTE_RATE);
  // Round to nearest quarter for simplicity in payments.
  return parseFloat((Math.round(price * 4) / 4).toFixed(2));
};

/**
 * Provides a more realistic, simulated estimate for an UberX ride in the Miami area,
 * considering time of day and location zones.
 *
 * @param distanceMiles The distance of the ride in miles.
 * @param departureTime The date and time of the departure.
 * @param origin The starting point of the ride.
 * @param destination The destination of the ride.
 * @returns A formatted string representing the estimated price range (e.g., "~$18-24").
 */
export const calculateUberEstimate = (distanceMiles: number, departureTime: Date, origin: string, destination: string): string => {
  let surgeMultiplier = 1.0;
  let zoneFee = 0;

  const hour = departureTime.getHours();
  const day = departureTime.getDay(); // Sunday = 0, Saturday = 6

  // 1. More granular time-based surge simulation
  const isWeekday = day >= 1 && day <= 5;

  if (isWeekday) {
    if (hour >= 7 && hour < 10) surgeMultiplier = 1.6; // Morning Rush
    else if (hour >= 16 && hour < 19) surgeMultiplier = 1.8; // Evening Rush
    else if (hour >= 1 && hour < 5) surgeMultiplier = 1.2; // Late Night
    else if (hour >= 19 && hour < 22) surgeMultiplier = 1.1; // Post-work evening
  } else { // Weekend
    const isFridayNight = day === 5 && hour >= 19;
    const isSaturdayEarlyAm = day === 6 && hour < 3;
    const isSaturdayNight = day === 6 && hour >= 19;
    const isSundayEarlyAm = day === 0 && hour < 3;

    if (isFridayNight || isSaturdayEarlyAm || isSaturdayNight || isSundayEarlyAm) {
        surgeMultiplier = 2.2; // Peak weekend entertainment hours
    } else if (hour >= 12 && hour < 18) {
        surgeMultiplier = 1.15; // Weekend afternoon activity
    }
  }

  // 2. More granular zone-based fee simulation
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();
  const locationString = `${originLower} ${destLower}`;

  // Tiers of zone fees
  if (locationString.includes('airport')) {
      zoneFee += 3.50; // Airport surcharge
  }
  if (locationString.includes('south beach') || locationString.includes('port of miami')) {
      zoneFee += 5.50; // High-demand tourist/port areas
  }
  if (locationString.includes('brickell') || locationString.includes('wynwood')) {
      zoneFee += 4.00; // High-demand business/entertainment areas
  }
  // Event venue fee during typical event times
  if (locationString.includes('hard rock stadium') || locationString.includes('kaseya center')) {
      if ((isWeekday && hour > 17) || !isWeekday) { // If it's an evening or weekend
          zoneFee += 6.00;
      }
  }


  // 3. Core fare calculation
  // Assume an average speed of ~25 mph in city traffic (2.4 minutes per mile).
  // During rush hour, this could be slower, let's adjust.
  let minutesPerMile = 2.4;
  if (surgeMultiplier > 1.5) {
      minutesPerMile = 3.5; // Slower speed during heavy traffic
  }
  const estimatedMinutes = distanceMiles * minutesPerMile;
  const fareBeforeSurge = UBER_BASE_FARE + (UBER_PER_MILE_RATE * distanceMiles) + (UBER_PER_MINUTE_RATE * estimatedMinutes);
  
  const estimatedFare = (fareBeforeSurge * surgeMultiplier) + zoneFee;
  
  const lowEnd = Math.max(UBER_MINIMUM_FARE, estimatedFare);
  
  // High end accounts for slightly worse traffic or higher demand within the surge window
  const highEnd = lowEnd * 1.35;

  return `~$${Math.round(lowEnd)}-${Math.round(highEnd)}`;
};


/**
 * Calculates the estimated kilograms of CO2 saved by carpooling.
 * @param distanceMiles The distance of the ride in miles.
 * @returns The estimated CO2 saved in kg, to one decimal place.
 */
export const calculateCO2Saved = (distanceMiles: number): number => {
    // A typical passenger vehicle emits about 404 grams of CO2 per mile.
    const co2Kg = distanceMiles * 0.404;
    return parseFloat(co2Kg.toFixed(1));
};
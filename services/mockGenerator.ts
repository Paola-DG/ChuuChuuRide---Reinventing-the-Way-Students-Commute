import type { UserProfile, CommuteProvider, RideRequestDetails, Ride, RideRequest } from '../types';
import { calculateRidePrice, calculateCO2Saved, calculateUberEstimate } from './rideCalculations';


// --- Data for Mock Generation ---
const FIRST_NAMES = ['Emily', 'Jacob', 'Sophia', 'Michael', 'Isabella', 'Ethan', 'Olivia', 'William', 'Ava', 'James', 'Mia', 'Benjamin', 'Charlotte', 'Daniel'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson'];
const SERVICE_TIERS: ('Standard' | 'Premium' | 'Plus')[] = ['Standard', 'Premium', 'Plus'];
const CHATTINESS: ('Quiet' | 'Chatty' | 'Depends')[] = ['Quiet', 'Chatty', 'Depends'];
const MUSIC_PREFS = ['Pop', 'Indie Rock', 'Hip Hop', 'Classical', 'EDM', 'Country', 'Podcasts'];

const MOCK_GENERATOR_LOCATIONS = {
    origins: ['Brickell, Miami', 'Kendall, FL', 'Doral, FL', 'South Miami, FL', 'Pinecrest, FL', 'Hialeah, FL', 'Coral Gables, FL'],
    destinations: ['FIU MMC Campus', 'FIU Engineering Center', 'FIU PG6 Tech Station', 'FIU Green Library', 'FIU Graham Center'],
};

// --- More Realistic, Path-Based Simulation Logic ---
const locations = {
    // Origins
    KENDALL: '8800 SW 107th Ave, Miami, FL 33176', // The Palms at Town & Country
    PINECREST: '12645 Pinecrest Pkwy, Pinecrest, FL 33156',
    COUNTRY_WALK: '13701 SW 152nd St, Miami, FL 33177',
    SOUTH_MIAMI: '6130 Sunset Dr, South Miami, FL 33143',
    BRICKELL: '1110 S Miami Ave, Miami, FL 33130',
    DORAL: '8400 NW 36th St, Doral, FL 33166',

    // Waypoints
    CROSSINGS: 'The Crossings Shopping Village, Miami, FL',
    KENDALL_DR_TURNPIKE: "Florida's Turnpike @ SW 88th St, Miami",
    SUNSET_DR_PALMETTO: "Palmetto Expy @ Sunset Dr, Miami",
    DON_SHULA_US1: 'Don Shula Expy @ US-1, South Miami',
    PALMETTO_CORALWAY: 'Palmetto Expy & Coral Way, Miami',
    TURNPIKE_8TH_ST: "Florida's Turnpike @ SW 8th St, Miami",

    // Destination
    FIU_DEST: 'FIU Engineering Center, Miami, FL',
};

const MAIN_ROUTES: Record<string, string[]> = {
    KENDALL_TURNPIKE: [locations.KENDALL, locations.CROSSINGS, locations.KENDALL_DR_TURNPIKE, locations.TURNPIKE_8TH_ST, locations.FIU_DEST],
    PINECREST_PALMETTO: [locations.PINECREST, locations.DON_SHULA_US1, locations.SUNSET_DR_PALMETTO, locations.PALMETTO_CORALWAY, locations.FIU_DEST],
    SOUTH_MIAMI_PALMETTO: [locations.SOUTH_MIAMI, locations.SUNSET_DR_PALMETTO, locations.PALMETTO_CORALWAY, locations.FIU_DEST],
};

const FEEDER_ROUTES: { [mergePoint: string]: { [origin: string]: string[] } } = {
    [locations.CROSSINGS]: { 'The Hammocks, FL': ['The Hammocks, FL', 'SW 120th St & 137th Ave', locations.CROSSINGS], },
    [locations.KENDALL_DR_TURNPIKE]: { [locations.COUNTRY_WALK]: [locations.COUNTRY_WALK, "SW 152nd St & Turnpike Ramp", locations.KENDALL_DR_TURNPIKE], },
    [locations.SUNSET_DR_PALMETTO]: { 'Dadeland Mall, Miami, FL': ['Dadeland Mall, Miami, FL', 'Kendall Dr & Palmetto Expy', locations.SUNSET_DR_PALMETTO], },
};

const SEGMENT_DURATIONS: { [key: string]: number } = {
    [`${locations.KENDALL}-${locations.CROSSINGS}`]: 5,
    [`${locations.CROSSINGS}-${locations.KENDALL_DR_TURNPIKE}`]: 5,
    [`${locations.KENDALL_DR_TURNPIKE}-${locations.TURNPIKE_8TH_ST}`]: 4,
    [`${locations.TURNPIKE_8TH_ST}-${locations.FIU_DEST}`]: 3,
    [`${locations.PINECREST}-${locations.DON_SHULA_US1}`]: 6,
    [`${locations.DON_SHULA_US1}-${locations.SUNSET_DR_PALMETTO}`]: 3,
    [`${locations.SUNSET_DR_PALMETTO}-${locations.PALMETTO_CORALWAY}`]: 5,
    [`${locations.PALMETTO_CORALWAY}-${locations.FIU_DEST}`]: 6,
    [`${locations.SOUTH_MIAMI}-${locations.SUNSET_DR_PALMETTO}`]: 2,
    ['The Hammocks, FL-SW 120th St & 137th Ave']: 5,
    [`SW 120th St & 137th Ave-${locations.CROSSINGS}`]: 2,
    [`${locations.COUNTRY_WALK}-SW 152nd St & Turnpike Ramp`]: 6,
    [`SW 152nd St & Turnpike Ramp-${locations.KENDALL_DR_TURNPIKE}`]: 3,
    ['Dadeland Mall, Miami, FL-Kendall Dr & Palmetto Expy']: 4,
    [`Kendall Dr & Palmetto Expy-${locations.SUNSET_DR_PALMETTO}`]: 2,
};

const ALL_POSSIBLE_DRIVER_ROUTES: string[][] = [];
for (const key in MAIN_ROUTES) { ALL_POSSIBLE_DRIVER_ROUTES.push([...MAIN_ROUTES[key]]); }
for (const mergePoint in FEEDER_ROUTES) {
    const mainRouteContainingMerge = Object.values(MAIN_ROUTES).find(route => route.includes(mergePoint));
    if (mainRouteContainingMerge) {
        const feedersForMergePoint = FEEDER_ROUTES[mergePoint];
        for (const origin in feedersForMergePoint) {
            const feederPath = feedersForMergePoint[origin];
            const mainPathAfterMerge = mainRouteContainingMerge.slice(mainRouteContainingMerge.indexOf(mergePoint));
            const compositeRoute = [...feederPath.slice(0, -1), ...mainPathAfterMerge];
            ALL_POSSIBLE_DRIVER_ROUTES.push(compositeRoute);
        }
    }
}
const shuffleArray = <T>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const PEAK_HOUR_MULTIPLIER = 1.4;

const calculatePathDuration = (path: string[], timeOfDay: 'peak' | 'off-peak' = 'off-peak'): number => {
    let totalDuration = 0;
    if (path.length < 2) return 0;
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];
        const key1 = `${start}-${end}`;
        const key2 = `${end}-${start}`;
        let duration = SEGMENT_DURATIONS[key1] || SEGMENT_DURATIONS[key2] || 7;
        if (timeOfDay === 'peak') { duration *= PEAK_HOUR_MULTIPLIER; }
        totalDuration += duration;
    }
    return Math.round(totalDuration);
};

const getUserRoute = (origin: string): string[] => {
    const o = origin.toLowerCase();
    if (o.includes('pinecrest')) return MAIN_ROUTES.PINECREST_PALMETTO;
    if (o.includes('south miami')) return MAIN_ROUTES.SOUTH_MIAMI_PALMETTO;
    return MAIN_ROUTES.KENDALL_TURNPIKE;
};

const calculatePathMatchDetails = (userPath: string[], driverPath: string[]): { percentage: number, driverUnsharedPath: string[] } => {
    if (userPath.length < 2 || driverPath.length < 2) return { percentage: 0, driverUnsharedPath: driverPath };
    let commonWaypoints = 0;
    const reversedUserPath = [...userPath].reverse();
    const reversedDriverPath = [...driverPath].reverse();
    for (let i = 0; i < Math.min(reversedUserPath.length, reversedDriverPath.length); i++) {
        if (reversedUserPath[i] === reversedDriverPath[i]) { commonWaypoints++; } else { break; }
    }
    const sharedSegments = commonWaypoints > 1 ? commonWaypoints - 1 : 0;
    const driverTotalSegments = driverPath.length - 1;
    if (driverTotalSegments <= 0) return { percentage: 30, driverUnsharedPath: driverPath };
    const rawPercentage = (sharedSegments / driverTotalSegments) * 100;
    const mergeIndexDriver = driverPath.length - commonWaypoints;
    const driverUnsharedPath = driverPath.slice(0, mergeIndexDriver + 1);
    const finalPercentage = Math.round(Math.max(40, Math.min(98, rawPercentage)));
    return { percentage: finalPercentage, driverUnsharedPath };
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number, decimals: number = 2): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
};

const generateRandomProfile = (idSuffix: string, role: 'Owner' | 'Poolee'): UserProfile => {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    return {
        id: `user_random_${idSuffix}`,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fiu.edu`,
        avatarUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/100/100`,
        university: 'Florida International University',
        role,
        preferences: { music: getRandomItem(MUSIC_PREFS), chattiness: getRandomItem(CHATTINESS) },
        rating: getRandomNumber(4.5, 5.0, 1),
        serviceTier: getRandomItem(SERVICE_TIERS),
        classSchedule: [],
    };
};

export const generateMockRides = (count: number, currentUser: UserProfile): Ride[] => {
    const rides: Ride[] = [];
    for (let i = 0; i < count; i++) {
        const distanceMiles = getRandomNumber(5, 25, 1);
        const departure = new Date();
        departure.setHours(departure.getHours() + i + 1);
        departure.setMinutes(getRandomItem([0, 15, 30, 45]));
        const driver = generateRandomProfile(`${Date.now()}_${i}`, 'Owner');
        if (i % 3 === 0 && currentUser.classSchedule && currentUser.classSchedule.length > 0) {
            driver.classSchedule = [getRandomItem(currentUser.classSchedule)];
        }
        const origin = getRandomItem(MOCK_GENERATOR_LOCATIONS.origins);
        const destination = getRandomItem(MOCK_GENERATOR_LOCATIONS.destinations);
        const newRide: Ride = {
            id: `ride_gen_${Date.now()}_${i}`,
            driver,
            origin,
            destination,
            departureTime: departure,
            availableSeats: getRandomNumber(1, 4, 0),
            price: calculateRidePrice(distanceMiles, departure),
            co2SavedKg: calculateCO2Saved(distanceMiles),
            distanceMiles: distanceMiles,
            uberEstimate: calculateUberEstimate(distanceMiles, departure, origin, destination),
        };
        rides.push(newRide);
    }
    return rides;
};

export const generateMockRideRequests = (count: number): RideRequest[] => {
    const requests: RideRequest[] = [];
    const detailsOptions = [
        'Need to get to my morning lecture.',
        'Looking for a ride for my evening lab session.',
        'Anyone heading to campus from the south?',
        'My car is in the shop, need a ride for a couple of days.',
        'Hoping to carpool to save on gas!'
    ];
    for (let i = 0; i < count; i++) {
        const poolee = generateRandomProfile(`req_${Date.now()}_${i}`, 'Poolee');
        const newRequest: RideRequest = {
            id: `req_gen_${Date.now()}_${i}`,
            poolee,
            origin: getRandomItem(MOCK_GENERATOR_LOCATIONS.origins),
            destination: getRandomItem(MOCK_GENERATOR_LOCATIONS.destinations),
            type: 'Regular Basis',
            details: getRandomItem(detailsOptions),
            requestDateTime: new Date(Date.now() + (i * 10 * 60000)), // Requests are fresh
        };
        requests.push(newRequest);
    }
    return requests;
};

export const generateMockProviders = (
    count: number = 3,
    requestDetails: RideRequestDetails,
    currentUser: UserProfile,
): { providers: CommuteProvider[] } => {
    const providers: CommuteProvider[] = [];
    let timeOfDay: 'peak' | 'off-peak' = 'off-peak';
    if (requestDetails.arriveBy) {
        try {
            const [hour] = requestDetails.arriveBy.split(':').map(Number);
            if (hour >= 7 && hour < 10) { timeOfDay = 'peak'; }
        } catch (e) { console.error("Could not parse 'arriveBy' time:", requestDetails.arriveBy); }
    }
    const userRoutePath = getUserRoute(requestDetails.origin);
    const finalUserRoute = [requestDetails.origin, ...userRoutePath.slice(1)];
    finalUserRoute[finalUserRoute.length - 1] = requestDetails.destination;
    const riderTripDurationMinutes = calculatePathDuration(userRoutePath, timeOfDay);
    const availableRoutes = shuffleArray(ALL_POSSIBLE_DRIVER_ROUTES);
    for (let i = 0; i < count; i++) {
        const idSuffix = `${Date.now()}_${i}`;
        const user = generateRandomProfile(idSuffix, 'Owner');
        if (i === 0 && currentUser.classSchedule && currentUser.classSchedule.length > 0) {
            user.classSchedule = [getRandomItem(currentUser.classSchedule)];
        }
        let driverRoute = availableRoutes.pop() || getRandomItem(ALL_POSSIBLE_DRIVER_ROUTES);
        driverRoute = [...driverRoute];
        driverRoute[driverRoute.length - 1] = requestDetails.destination;
        const { percentage: routeOverlapPercentage, driverUnsharedPath } = calculatePathMatchDetails(finalUserRoute, driverRoute);
        const driverOriginalDurationMinutes = calculatePathDuration(driverRoute, timeOfDay);
        const driverApproachDuration = calculatePathDuration(driverUnsharedPath, timeOfDay);
        const PICKUP_BUFFER_MINUTES = 3;
        const driverCombinedDurationMinutes = driverApproachDuration + riderTripDurationMinutes + PICKUP_BUFFER_MINUTES;
        const provider: CommuteProvider = {
            id: `prov_random_${idSuffix}`,
            user,
            routeOverlapPercentage,
            estimatedCost: getRandomNumber(4.00, 6.50, 2),
            routeOrigin: driverRoute[0],
            routeDestination: driverRoute[driverRoute.length - 1],
            driverOriginalDurationMinutes,
            driverCombinedDurationMinutes,
        };
        providers.push(provider);
    }
    const sortedProviders = providers.sort((a, b) => b.routeOverlapPercentage - a.routeOverlapPercentage);
    return { providers: sortedProviders };
};

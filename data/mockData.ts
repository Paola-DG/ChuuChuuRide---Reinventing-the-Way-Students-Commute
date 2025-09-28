
import type { UserProfile, Ride, AcademicEvent, ClassScheduleEntry, RideRequest, CommuteProvider, ChatMessage, FinancialTransaction, ChatSession } from '../types';
import { calculateRidePrice, calculateUberEstimate } from '../services/rideCalculations';

export const MOCK_CLASS_SCHEDULE: ClassScheduleEntry[] = [
  { id: 'cs1', courseCode: 'COP 4331', courseName: 'Programming III', days: 'MWF', time: '11:00 AM - 12:15 PM', location: 'PG-6 101' },
  { id: 'cs2', courseCode: 'CEN 4020', courseName: 'Software Engineering', days: 'TR', time: '2:00 PM - 3:15 PM', location: 'EC 110' },
];


export const MOCK_USER: UserProfile = {
  id: 'user_123',
  name: 'Alex Panther',
  email: 'alex.panther@fiu.edu',
  avatarUrl: 'https://picsum.photos/seed/alex/100/100',
  university: 'Florida International University',
  role: 'Poolee',
  preferences: {
    music: 'Indie Rock',
    chattiness: 'Chatty',
  },
  classSchedule: MOCK_CLASS_SCHEDULE,
  bio: 'Computer Science major with a passion for sustainable tech. Looking for a ride to campus for my morning classes. I enjoy listening to podcasts during my commute. Let\'s save the planet one ride at a time!',
  interests: ['Hiking', 'Video Games', 'AI/ML', 'Startups', 'Coffee'],
  paymentMethods: [
    { id: 'pm_1', type: 'Credit Card', details: 'Visa **** 4242' },
    { id: 'pm_2', type: 'Cash', details: 'Pay in person' },
    { id: 'pm_3', type: 'Zelle', details: 'alex.panther@fiu.edu'},
  ],
  commuteSchedule: [
    { day: 'Monday', arriveBy: '10:30', leaveAt: '17:00', enabled: true },
    { day: 'Tuesday', arriveBy: '13:30', leaveAt: '16:00', enabled: true },
    { day: 'Wednesday', arriveBy: '10:30', leaveAt: '17:00', enabled: true },
    { day: 'Thursday', arriveBy: '13:30', leaveAt: '16:00', enabled: true },
    { day: 'Friday', arriveBy: '10:30', leaveAt: '13:00', enabled: true },
    { day: 'Saturday', arriveBy: '', leaveAt: '', enabled: false },
    { day: 'Sunday', arriveBy: '', leaveAt: '', enabled: false },
  ],
};

const otherUsers: UserProfile[] = [
  {
    id: 'user_456',
    name: 'Maria Garcia',
    email: 'maria.garcia@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/maria/100/100',
    university: 'Florida International University',
    role: 'Owner',
    preferences: { music: 'Pop', chattiness: 'Quiet' },
    rating: 4.9,
    serviceTier: 'Premium',
    classSchedule: [
      { id: 'cs_maria1', courseCode: 'COP 4331', courseName: 'Programming III', days: 'TR', time: '10:00 AM - 11:15 AM', location: 'PG-6 105' },
    ],
  },
  {
    id: 'user_789',
    name: 'Ben Carter',
    email: 'ben.carter@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/ben/100/100',
    university: 'Florida International University',
    role: 'Poolee',
    preferences: { music: 'Hip Hop', chattiness: 'Depends' },
    classSchedule: [
       { id: 'cs3', courseCode: 'CAP 4730', courseName: 'Computer Graphics', days: 'MW', time: '5:00 PM - 6:15 PM', location: 'ECS 135' },
    ],
  },
   {
    id: 'user_101',
    name: 'David Chen',
    email: 'david.chen@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/david/100/100',
    university: 'Florida International University',
    role: 'Owner',
    preferences: { music: 'Classical', chattiness: 'Quiet' },
    rating: 4.8,
    serviceTier: 'Plus',
  },
  {
    id: 'user_102',
    name: 'Samantha Jones',
    email: 'samantha.jones@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/samantha/100/100',
    university: 'Florida International University',
    role: 'Owner',
    preferences: { music: 'EDM', chattiness: 'Chatty' },
    rating: 5.0,
    serviceTier: 'Standard',
  },
  {
    id: 'user_103',
    name: 'Jessica Lee',
    email: 'jessica.lee@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/jessica/100/100',
    university: 'Florida International University',
    role: 'Owner',
    preferences: { music: 'Lo-fi', chattiness: 'Depends' },
    rating: 4.7,
    serviceTier: 'Standard',
  }
];

export const MOCK_INIT_ORGANIZATION: UserProfile = {
    id: 'org_init',
    name: 'INIT - Society of Computing and Info. Sciences',
    email: 'init@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/init/100/100',
    university: 'Florida International University',
    role: 'Organization',
    preferences: { music: 'N/A', chattiness: 'Depends' },
};

export const MOCK_UCF_ORGANIZATION: UserProfile = {
    id: 'org_ucf',
    name: 'UCF Knight Hacks',
    email: 'events@ucf.edu',
    avatarUrl: 'https://picsum.photos/seed/ucf/100/100',
    university: 'University of Central Florida',
    role: 'Organization',
    preferences: { music: 'N/A', chattiness: 'Depends' },
};

export const MOCK_USF_ORGANIZATION: UserProfile = {
    id: 'org_usf',
    name: 'University of South Florida',
    email: 'rideshare@usf.edu',
    avatarUrl: 'https://picsum.photos/seed/usf/100/100',
    university: 'University of South Florida',
    role: 'Organization',
    preferences: { music: 'N/A', chattiness: 'Depends' },
};


export const MOCK_ORGANIZATION_USER: UserProfile = {
    id: 'org_001',
    name: 'FIU Student Affairs',
    email: 'sga@fiu.edu',
    avatarUrl: 'https://picsum.photos/seed/fiu/100/100',
    university: 'Florida International University',
    role: 'Organization',
    preferences: { music: 'N/A', chattiness: 'Depends' },
};


export const MOCK_RIDES: Ride[] = [
  // --- Rides for ShellHacks (eventId: 'event_1') ---
  {
    id: 'ride_4',
    driver: otherUsers[2], // David Chen
    origin: 'Kendall, FL',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T08:00:00'),
    availableSeats: 3,
    distanceMiles: 5,
    price: calculateRidePrice(5, new Date('2025-09-28T08:00:00')),
    co2SavedKg: 2.0,
    uberEstimate: calculateUberEstimate(5, new Date('2025-09-28T08:00:00'), 'Kendall, FL', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_7',
    driver: otherUsers[0], // Maria Garcia
    origin: 'Hialeah, FL',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T07:30:00'),
    availableSeats: 2,
    distanceMiles: 10,
    price: calculateRidePrice(10, new Date('2025-09-28T07:30:00')),
    co2SavedKg: 4.0,
    uberEstimate: calculateUberEstimate(10, new Date('2025-09-28T07:30:00'), 'Hialeah, FL', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_8',
    driver: otherUsers[3], // Samantha Jones
    origin: 'Coral Gables, FL',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T08:15:00'),
    availableSeats: 1,
    distanceMiles: 8,
    price: calculateRidePrice(8, new Date('2025-09-28T08:15:00')),
    co2SavedKg: 3.2,
    uberEstimate: calculateUberEstimate(8, new Date('2025-09-28T08:15:00'), 'Coral Gables, FL', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_9',
    driver: otherUsers[2], // David Chen
    origin: 'Homestead, FL',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T07:00:00'),
    availableSeats: 4,
    distanceMiles: 25,
    price: calculateRidePrice(25, new Date('2025-09-28T07:00:00')),
    co2SavedKg: 10.1,
    uberEstimate: calculateUberEstimate(25, new Date('2025-09-28T07:00:00'), 'Homestead, FL', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_10',
    driver: otherUsers[3], // Samantha Jones
    origin: 'Fort Lauderdale, FL',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T07:45:00'),
    availableSeats: 2,
    distanceMiles: 30,
    price: calculateRidePrice(30, new Date('2025-09-28T07:45:00')),
    co2SavedKg: 12.1,
    uberEstimate: calculateUberEstimate(30, new Date('2025-09-28T07:45:00'), 'Fort Lauderdale, FL', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_11',
    driver: MOCK_UCF_ORGANIZATION,
    origin: 'UCF Campus',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T06:00:00'),
    availableSeats: 30,
    distanceMiles: 230,
    price: 0, // Org ride, fixed price
    co2SavedKg: 92.9,
    uberEstimate: calculateUberEstimate(230, new Date('2025-09-28T06:00:00'), 'UCF Campus', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  {
    id: 'ride_12',
    driver: MOCK_USF_ORGANIZATION,
    origin: 'USF Campus',
    destination: 'FIU Graham Center',
    departureTime: new Date('2025-09-28T05:30:00'),
    availableSeats: 25,
    distanceMiles: 270,
    price: 15.00, // Org ride, fixed price
    co2SavedKg: 109.1,
    uberEstimate: calculateUberEstimate(270, new Date('2025-09-28T05:30:00'), 'USF Campus', 'FIU Graham Center'),
    eventId: 'event_1',
  },
  // --- Rides for FIU All Majors Career Fair (eventId: 'event_2') ---
  {
    id: 'ride_5',
    driver: otherUsers[0], // Maria Garcia
    origin: 'Sweetwater, FL',
    destination: 'FIU Ocean Bank Convocation Center',
    departureTime: new Date('2025-09-29T09:30:00'), // Weekday rush hour
    availableSeats: 2,
    distanceMiles: 1.5,
    price: calculateRidePrice(1.5, new Date('2025-09-29T09:30:00')),
    co2SavedKg: 0.6,
    uberEstimate: calculateUberEstimate(1.5, new Date('2025-09-29T09:30:00'), 'Sweetwater, FL', 'FIU Ocean Bank Convocation Center'),
    eventId: 'event_2',
  },
  {
    id: 'ride_13',
    driver: otherUsers[3], // Samantha Jones
    origin: 'Coral Gables, FL',
    destination: 'FIU Ocean Bank Convocation Center',
    departureTime: new Date('2025-09-29T09:15:00'), // Weekday rush hour
    availableSeats: 2,
    distanceMiles: 8,
    price: calculateRidePrice(8, new Date('2025-09-29T09:15:00')),
    co2SavedKg: 3.2,
    uberEstimate: calculateUberEstimate(8, new Date('2025-09-29T09:15:00'), 'Coral Gables, FL', 'FIU Ocean Bank Convocation Center'),
    eventId: 'event_2',
  },
  // --- Ride for KnightHacks (eventId: 'event_3') ---
  {
    id: 'ride_6',
    driver: MOCK_INIT_ORGANIZATION,
    origin: 'FIU MMC Campus',
    destination: 'University of Central Florida',
    departureTime: new Date('2025-10-24T07:00:00'), // For KnightHacks 2025
    availableSeats: 20,
    distanceMiles: 230,
    price: 0, // Org ride, fixed price
    co2SavedKg: 92.9,
    uberEstimate: calculateUberEstimate(230, new Date('2025-10-24T07:00:00'), 'FIU MMC Campus', 'University of Central Florida'),
    eventId: 'event_3',
  },
];

export const MOCK_EVENTS: AcademicEvent[] = [
  {
    id: 'event_1',
    name: 'ShellHacks 2025',
    location: 'FIU Graham Center',
    date: new Date('2025-09-28T09:00:00'),
    ridesNeeded: 28,
  },
  {
    id: 'event_2',
    name: 'FIU All Majors Career Fair',
    location: 'FIU Ocean Bank Convocation Center',
    date: new Date('2025-09-29T10:00:00'),
    ridesNeeded: 12,
  },
  {
    id: 'event_3',
    name: 'KnightHacks 2025',
    location: 'University of Central Florida',
    date: new Date('2025-10-24T10:00:00'),
    ridesNeeded: 40,
  },
];

// Initial ride requests are cleared to allow for dynamic generation.
export const MOCK_RIDE_REQUESTS: RideRequest[] = [];

export const MOCK_PROVIDERS: CommuteProvider[] = [
  { id: 'prov_1', user: otherUsers[0], routeOverlapPercentage: 92, estimatedCost: 4.50, routeOrigin: 'The Palms at Town & Country, Miami', routeDestination: 'FIU School of International and Public Affairs', driverOriginalDurationMinutes: 20, driverCombinedDurationMinutes: 25 },
  { id: 'prov_2', user: otherUsers[2], routeOverlapPercentage: 85, estimatedCost: 5.00, routeOrigin: 'Country Walk, Miami, FL', routeDestination: 'FIU Green Library', driverOriginalDurationMinutes: 30, driverCombinedDurationMinutes: 38 },
  { id: 'prov_3', user: otherUsers[3], routeOverlapPercentage: 78, estimatedCost: 4.75, routeOrigin: 'South Miami, FL', routeDestination: 'FIU MMC Campus', driverOriginalDurationMinutes: 22, driverCombinedDurationMinutes: 29 },
  { id: 'prov_4', user: otherUsers[4], routeOverlapPercentage: 88, estimatedCost: 3.50, routeOrigin: 'Kendall, FL', routeDestination: 'FIU PG6 Tech Station', driverOriginalDurationMinutes: 15, driverCombinedDurationMinutes: 20 },
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  // Tentative (starting point)
  {
    id: 'chat_2',
    provider: MOCK_PROVIDERS[1],
    poolee: MOCK_USER,
    status: 'Tentative',
    messages: [
      { id: 'm2_1', senderId: MOCK_PROVIDERS[1].user.id, text: 'Hi, I can give you a ride to the engineering center.', timestamp: new Date(Date.now() - 10 * 60000) },
      { id: 'm2_2', senderId: MOCK_USER.id, text: 'Awesome, thank you! What time works best for you?', timestamp: new Date(Date.now() - 9 * 60000) },
    ],
  },
  // Provider has confirmed, waiting for user
  {
    id: 'chat_4',
    provider: MOCK_PROVIDERS[3],
    poolee: MOCK_USER,
    status: 'ProviderConfirmed',
    messages: [
      { id: 'm4_1', senderId: MOCK_PROVIDERS[3].user.id, text: 'Hey, I can definitely give you that ride. I\'ve confirmed on my end, just let me know if you\'re ready to book!', timestamp: new Date(Date.now() - 2 * 60000) },
    ],
    selectedPaymentMethod: 'Credit Card',
  },
  // Fully confirmed
  {
    id: 'chat_1',
    provider: MOCK_PROVIDERS[0],
    poolee: MOCK_USER,
    status: 'Confirmed',
    messages: [
      { id: 'm1_1', senderId: MOCK_PROVIDERS[0].user.id, text: 'Hey! Looks like our routes match up pretty well. I can pick you up around 8:15 AM.', timestamp: new Date(Date.now() - 5 * 60000) },
      { id: 'm1_2', senderId: MOCK_USER.id, text: 'That sounds perfect! Is it cool if I bring a backpack with my laptop?', timestamp: new Date(Date.now() - 4 * 60000) },
      { id: 'm1_3', senderId: MOCK_PROVIDERS[0].user.id, text: 'No problem at all, plenty of space. See you then!', timestamp: new Date(Date.now() - 3 * 60000) },
    ],
  },
  // Cancelled
  {
    id: 'chat_3',
    provider: MOCK_PROVIDERS[2],
    poolee: MOCK_USER,
    status: 'Cancelled',
    messages: [
      { id: 'm3_1', senderId: MOCK_USER.id, text: 'Hey, are you still available for the ride tomorrow?', timestamp: new Date(Date.now() - 24 * 60 * 60000) },
    ],
  },
];

export const MOCK_PASSENGER_TRANSACTIONS: FinancialTransaction[] = [
    { id: 'pt1', type: 'Payment', date: new Date('2024-07-20'), amount: 4.50, description: 'Ride with Maria G.'},
    { id: 'pt2', type: 'Payment', date: new Date('2024-07-18'), amount: 5.00, description: 'Ride with David C.'},
    { id: 'pt3', type: 'Refund', date: new Date('2024-07-15'), amount: 3.75, description: 'Cancelled ride'},
    { id: 'pt4', type: 'Payment', date: new Date('2024-07-12'), amount: 4.75, description: 'Ride with Samantha J.'},
];

export const MOCK_PROVIDER_TRANSACTIONS: FinancialTransaction[] = [
    { id: 'dpt1', type: 'Ride Earning', date: new Date('2024-07-21'), amount: 12.50, description: '3 passengers to FIU'},
    { id: 'dpt2', type: 'Gas Reimbursement', date: new Date('2024-07-20'), amount: 45.33, description: 'Shell Gas Station'},
    { id: 'dpt3', type: 'Ride Earning', date: new Date('2024-07-19'), amount: 8.00, description: '2 passengers to Brickell'},
    { id: 'dpt4', type: 'Ride Earning', date: new Date('2024-07-18'), amount: 4.00, description: '1 passenger from Doral'},
];

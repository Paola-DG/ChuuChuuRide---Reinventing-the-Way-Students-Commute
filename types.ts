
export type UserRole = 'Poolee' | 'Owner' | 'Organization';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type DayOfWeekFullName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface CommuteScheduleEntry {
  day: DayOfWeekFullName;
  arriveBy: string;
  leaveAt: string;
  enabled: boolean;
}

export type PaymentMethodType = 'Credit Card' | 'Cash' | 'Zelle' | 'Venmo';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  details: string;
}

export interface ClassScheduleEntry {
  id: string;
  courseCode: string;
  courseName: string;
  days: string; // "MWF", "TR"
  time: string; // "11:00 AM - 12:15 PM"
  location: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  university: string;
  role: UserRole;
  preferences: {
    music: string;
    chattiness: 'Quiet' | 'Chatty' | 'Depends' | 'N/A';
  };
  classSchedule?: ClassScheduleEntry[];
  bio?: string;
  interests?: string[];
  paymentMethods?: PaymentMethod[];
  commuteSchedule?: CommuteScheduleEntry[];
  rating?: number;
  serviceTier?: 'Standard' | 'Premium' | 'Plus';
}

export interface Ride {
  id: string;
  driver: UserProfile;
  origin: string;
  destination: string;
  departureTime: Date;
  availableSeats: number;
  price: number;
  co2SavedKg: number;
  distanceMiles: number;
  uberEstimate: string;
  eventId?: string;
}

export interface AcademicEvent {
  id: string;
  name: string;
  location: string;
  date: Date;
  imageUrl?: string;
  ridesNeeded: number;
}

export type RideRequestType = 'Regular Basis' | 'Event Based';

export interface RideRequest {
  id: string;
  poolee: UserProfile;
  origin: string;
  destination: string;
  type: RideRequestType;
  details: string;
  requestDateTime: Date;
}

export interface CommuteProvider {
    id: string;
    user: UserProfile;
    routeOverlapPercentage: number;
    estimatedCost: number;
    routeOrigin: string;
    routeDestination: string;
    driverOriginalDurationMinutes: number;
    driverCombinedDurationMinutes: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

export type BookingStatus = 'Tentative' | 'UserConfirmed' | 'ProviderConfirmed' | 'Confirmed' | 'Cancelled';

export interface ChatSession {
  id: string;
  provider: CommuteProvider;
  poolee: UserProfile;
  messages: ChatMessage[];
  status: BookingStatus;
  selectedPaymentMethod?: PaymentMethodType;
}

export interface FinancialTransaction {
  id: string;
  type: 'Payment' | 'Refund' | 'Ride Earning' | 'Gas Reimbursement';
  date: Date;
  amount: number;
  description: string;
}

export interface NewRideFormData {
  origin: string;
  destination: string;
  departureTime: Date;
  availableSeats: number;
  price: number;
  eventId?: string;
}

export interface RideRequestDetails {
    origin: string;
    destination: string;
    type: RideRequestType;
    days?: DayOfWeek[];
    arriveBy?: string;
    leaveAt?: string;
    eventName?: string;
    eventDate?: string;
    details?: string;
}

export interface AIResponse {
  action: 'INITIATE_CHAT' | 'CREATE_RIDE_REQUEST' | 'GENERAL_QUERY';
  ride?: Ride; // For INITIATE_CHAT
  args?: { // For CREATE_RIDE_REQUEST
    origin: string;
    destination: string;
    details: string;
  };
  responseText: string;
}

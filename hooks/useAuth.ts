
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo, useEffect } from 'react';
import type { UserProfile } from '../types';
import { MOCK_USER } from '../data/mockData';

/**
 * Custom hook to manage authentication state and logic,
 * using the official Auth0 React hook. Enforces .edu email addresses.
 */
export const useAuth = () => {
  const { 
    isAuthenticated: isAuth0Authenticated, 
    isLoading: isAuthenticating, 
    user: auth0User, 
    loginWithRedirect, 
    logout: auth0Logout 
  } = useAuth0();

  // A user is only truly authenticated in our app if they are authenticated with Auth0
  // AND have a valid .edu email address.
  const isValidEduEmail = auth0User?.email?.endsWith('.edu');
  const isAuthenticated = isAuth0Authenticated && isValidEduEmail;
  
  /**
   * Logs the user out and returns them to the home page.
   */
  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  useEffect(() => {
    // If the user is authenticated via Auth0 but their email is not a valid .edu address,
    // we set an error message and immediately log them out.
    if (isAuth0Authenticated && !isAuthenticating && !isValidEduEmail) {
      sessionStorage.setItem('authError', 'Access denied. Only users with a .edu email address are permitted.');
      logout();
    }
  }, [isAuth0Authenticated, isAuthenticating, isValidEduEmail]);

  // Map the Auth0 user object to our internal UserProfile format.
  // We use useMemo to prevent re-creating the user object on every render.
  const user: UserProfile | null = useMemo(() => {
    // Only create the user profile if fully authenticated (including .edu check).
    if (isAuthenticated && auth0User && auth0User.email) {
      return {
        id: auth0User.sub || `auth0|${Date.now()}`,
        name: auth0User.name || 'User',
        email: auth0User.email,
        avatarUrl: auth0User.picture || `https://picsum.photos/seed/${auth0User.name}/100/100`,
        university: 'Florida International University', // Default value
        
        // Inherit defaults from mock user for a consistent demo experience
        role: MOCK_USER.role,
        preferences: MOCK_USER.preferences,
        classSchedule: MOCK_USER.classSchedule,
        bio: MOCK_USER.bio,
        interests: MOCK_USER.interests,
        paymentMethods: MOCK_USER.paymentMethods,
        commuteSchedule: MOCK_USER.commuteSchedule,
      };
    }
    return null;
  }, [isAuthenticated, auth0User]);

  /**
   * Initiates the Auth0 login flow.
   */
  const login = () => {
    loginWithRedirect();
  };

  return {
    isAuthenticated,
    isAuthenticating,
    user,
    login,
    logout,
  };
};

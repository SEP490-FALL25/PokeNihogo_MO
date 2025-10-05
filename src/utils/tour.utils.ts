import { useUserStore } from '@stores/user/user.config';

/**
 * Utility functions for tour guide management
 */

/**
 * Reset the tour guide for testing purposes
 * This sets isFirstTimeLogin back to true
 */
export const resetTourGuide = () => {
  useUserStore.getState().setIsFirstTimeLogin(true);
};

/**
 * Complete the tour guide (set isFirstTimeLogin to false)
 */
export const completeTourGuide = () => {
  useUserStore.getState().setIsFirstTimeLogin(false);
};

/**
 * Check if tour guide should be shown
 */
export const shouldShowTourGuide = (): boolean => {
  return useUserStore.getState().isFirstTimeLogin === true;
};

/**
 * Get tour guide status
 */
export const getTourGuideStatus = () => {
  const { isFirstTimeLogin, starterId, email } = useUserStore.getState();
  return {
    isFirstTimeLogin,
    starterId,
    email,
    shouldShow: isFirstTimeLogin === true,
  };
};

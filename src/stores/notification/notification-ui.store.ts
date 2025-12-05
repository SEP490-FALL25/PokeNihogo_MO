import { create } from 'zustand';

type NotificationType = 'REWARD' | 'LESSON' | 'EXERCISE' | 'DEFAULT';

interface NotificationToastState {
  isVisible: boolean;
  id?: number;
  title: string;
  message: string;
  type: NotificationType;
  showToast: (data: { id?: number; title: string; message: string; type?: string }) => void;
  hideToast: () => void;
}

export const useNotificationToastStore = create<NotificationToastState>((set) => ({
  isVisible: false,
  id: undefined,
  title: '',
  message: '',
  type: 'DEFAULT',
  showToast: ({ id, title, message, type = 'DEFAULT' }) => {
    set({ 
      isVisible: true,
      id,
      title, 
      message, 
      type: type as NotificationType 
    });
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      set({ isVisible: false });
    }, 4000);
  },
  hideToast: () => set({ isVisible: false }),
}));

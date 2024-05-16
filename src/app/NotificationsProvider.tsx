import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Notification {
  show: boolean;
  message: string;
  description: string;
}

interface NotificationContextType extends Notification {
  showNotification: (message: string, description: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  show: false,
  message: "",
  description: "",
  showNotification: () => {},
  hideNotification: () => {}
});

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', description: '' });

  const showNotification = useCallback((message: string, description: string) => {
    setNotification({ show: true, message, description });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification({ show: false, message: '', description: '' });
  }, []);

  return (
    <NotificationContext.Provider value={{ ...notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

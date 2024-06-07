import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Notification {
  show: boolean;
  message: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

interface NotificationContextType extends Notification {
  showNotification: (message: string, description: string, icon: ReactNode, className?: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  show: false,
  message: "",
  description: "",
  showNotification: () => {},
  hideNotification: () => {},
  icon: <></>
});

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', description: '', icon:<></> });

  const showNotification = useCallback((message: string, description: string, icon: ReactNode, className?: string) => {
    setNotification({ show: true, message, description, icon: icon, className });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification({ show: false, message: '', description: '', icon: <></> });
  }, []);

  return (
    <NotificationContext.Provider value={{ ...notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

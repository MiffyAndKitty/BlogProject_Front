import React, { createContext, useState, useContext, ReactNode } from 'react';

// NotificationContext 생성
interface NotificationContextType {
  hasNoti: boolean;
  setHasNoti: (value: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode; // children 타입을 명시적으로 정의
}

// NotificationProvider 컴포넌트
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [hasNoti, setHasNoti] = useState<boolean>(false);

  return (
    <NotificationContext.Provider value={{ hasNoti, setHasNoti }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Context를 사용하는 훅
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

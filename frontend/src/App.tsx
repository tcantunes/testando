import React, { useState, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from './routes';
import SplashScreen from './components/SplashScreen';
import { ToastProvider } from './contexts/ToastContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
};

export default App;

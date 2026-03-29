import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nProvider } from './src/utils/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { hasDemoData, seedDemoData } from './src/db';

function AuthGate() {
  const [volunteer, setVolunteer] = useState(undefined); // undefined = loading

  useEffect(() => {
    AsyncStorage.getItem('fchv-session').then((val) => {
      setVolunteer(val ? JSON.parse(val) : null);
    });
  }, []);

  function handleLogin(vol) {
    setVolunteer(vol);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('fchv-session');
    setVolunteer(null);
  }

  if (volunteer === undefined) return null; // brief loading
  if (!volunteer) return <LoginScreen onLogin={handleLogin} />;
  return <AppNavigator volunteer={volunteer} onLogout={handleLogout} />;
}

export default function App() {
  useEffect(() => {
    try {
      if (!hasDemoData()) seedDemoData();
    } catch {}
  }, []);

  return (
    <I18nProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </I18nProvider>
  );
}

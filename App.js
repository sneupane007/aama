import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nProvider } from './src/utils/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import './src/db'; // eagerly initialize DB and seed demo data

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

  if (volunteer === undefined) return <View style={{ flex: 1, backgroundColor: '#f0fdf4' }} />;
  if (!volunteer) return <LoginScreen onLogin={handleLogin} />;
  return <AppNavigator volunteer={volunteer} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <I18nProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </I18nProvider>
  );
}

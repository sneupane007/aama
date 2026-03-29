import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import NewVisitScreen from '../screens/NewVisitScreen';
import PatientsScreen from '../screens/PatientsScreen';
import VolunteerGuideScreen from '../screens/VolunteerGuideScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  NewVisit: { focused: 'add-circle', unfocused: 'add-circle-outline' },
  Patients: { focused: 'people', unfocused: 'people-outline' },
  Guide: { focused: 'book', unfocused: 'book-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

export default function AppNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: COLORS.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          },
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: SIZES.lg,
            color: COLORS.text,
          },
          headerTintColor: COLORS.text,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('navHome'),
            headerTitle: 'AAMA सखी',
            headerLeft: () => (
              <Ionicons
                name="heart"
                size={22}
                color={COLORS.primary}
                style={{ marginLeft: 16 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Patients"
          component={PatientsScreen}
          options={{
            tabBarLabel: t('navPatients'),
            headerTitle: t('navPatients'),
          }}
        />
        <Tab.Screen
          name="NewVisit"
          component={NewVisitScreen}
          options={{
            tabBarLabel: t('navNewVisit'),
            headerTitle: t('navNewVisit'),
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="add-circle"
                size={32}
                color={focused ? COLORS.primary : COLORS.primaryLight}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Guide"
          component={VolunteerGuideScreen}
          options={{
            tabBarLabel: t('navGuide'),
            headerTitle: t('guideTitle'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: t('navSettings'),
            headerTitle: t('settingsTitle'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

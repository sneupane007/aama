import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import NewVisitScreen from '../screens/NewVisitScreen';
import PatientsScreen from '../screens/PatientsScreen';
import VolunteerGuideScreen from '../screens/VolunteerGuideScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ConsultScreen from '../screens/ConsultScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  NewVisit: { focused: 'add-circle', unfocused: 'add-circle-outline' },
  Patients: { focused: 'people', unfocused: 'people-outline' },
  Guide: { focused: 'book', unfocused: 'book-outline' },
  Consult: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

function LangToggle() {
  const { lang, setLanguage } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.langToggle}
      onPress={() => setLanguage(lang === 'ne' ? 'en' : 'ne')}
    >
      <Text style={styles.langToggleText}>{lang === 'ne' ? 'EN' : 'ने'}</Text>
    </TouchableOpacity>
  );
}

function MainTabs({ onLogout, volunteer }) {
  const { t } = useTranslation();

  const SettingsWithProps = React.useCallback(
    (props) => <SettingsScreen {...props} onLogout={onLogout} volunteer={volunteer} navigation={props.navigation} />,
    [onLogout, volunteer],
  );

  const ConsultWithProps = React.useCallback(
    (props) => <ConsultScreen {...props} volunteer={volunteer} />,
    [volunteer],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
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
        headerRight: () => <LangToggle />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('navHome'),
          headerTitle: 'AAMA सखी',
          headerLeft: () => (
            <Ionicons name="heart" size={22} color={COLORS.primary} style={{ marginLeft: 16 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientsScreen}
        options={{ tabBarLabel: t('navPatients'), headerTitle: t('navPatients') }}
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
        options={{ tabBarLabel: t('navGuide'), headerTitle: t('guideTitle') }}
      />
      <Tab.Screen
        name="Consult"
        component={ConsultWithProps}
        options={{ tabBarLabel: t('consultTab'), headerTitle: t('consultTitle') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsWithProps}
        options={{ tabBarLabel: t('navProfile'), headerTitle: t('profileTitle') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ volunteer, onLogout }) {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
          {(props) => <MainTabs {...props} onLogout={onLogout} volunteer={volunteer} />}
        </Stack.Screen>
        <Stack.Screen
          name="PatientDetail"
          component={PatientDetailScreen}
          options={({ route }) => ({
            title: route.params?.patientName || t('patientDetails'),
            headerStyle: {
              backgroundColor: COLORS.surface,
            },
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: SIZES.lg,
              color: COLORS.text,
            },
            headerTintColor: COLORS.primary,
            headerBackTitle: '',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  langToggle: {
    marginRight: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#ccfbf1',
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

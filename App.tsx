import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import BookingPassScreen from './src/screens/BookingPassScreen';
import LoginScreen from './src/screens/LoginScreen';
import { RootStackParamList } from './src/navigation/types';
import { COLORS } from './src/theme/colors';
import { requestNotificationPermission } from './src/services/notificationService';
import { useBookingStore } from './src/store/useBookingStore';

import { Platform, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export default function App() {
  const { isLoggedIn } = useBookingStore();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={styles.webWrapper}>
          <View style={styles.appContainer}>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: COLORS.bg },
                  animation: 'slide_from_right',
                }}
              >
                {!isLoggedIn ? (
                  <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                  <>
                    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
                    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
                    <Stack.Screen name="BookingPass" component={BookingPassScreen} />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#070b14', // sleek modern dark ambient backdrop on wide desktop
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 520, // Perfect mobile/phablet width on laptop/desktop screens
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.6,
          shadowRadius: 30,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }
      : {}),
  },
});

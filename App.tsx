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
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

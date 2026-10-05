import { Room, BookingRecord } from '../types/booking';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  RoomDetail: { room: Room };
  BookingPass: { booking: BookingRecord };
};

export type BottomTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

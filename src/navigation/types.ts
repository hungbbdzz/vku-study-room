import { Room, BookingRecord } from '../types/booking';

export type RootStackParamList = {
  MainTabs: undefined;
  RoomDetail: { room: Room };
  BookingPass: { booking: BookingRecord };
};

export type BottomTabParamList = {
  Home: undefined;
  MyBookings: undefined;
};

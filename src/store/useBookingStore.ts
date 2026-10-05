import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingRecord, FilterParams, StudentSession } from '../types/booking';

// Initial mock bookings to simulate conflict checking
const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'init-1',
    roomId: 'room-b205',
    roomName: 'Phòng Seminar B205',
    building: 'B',
    floor: 2,
    date: new Date().toISOString().split('T')[0],
    slot: { id: 'slot1', label: '07:30 – 09:30', startHour: 7, startMinute: 30, endHour: 9, endMinute: 30 },
    bookedAt: new Date().toISOString(),
    status: 'upcoming',
    studentName: 'Sinh viên khác',
    studentId: 'SV000',
    studentClass: 'CNTT2022',
  },
  {
    id: 'init-2',
    roomId: 'room-v002',
    roomName: 'Lab V-KOREA 02',
    building: 'V',
    floor: 1,
    date: new Date().toISOString().split('T')[0],
    slot: { id: 'slot2', label: '09:30 – 11:30', startHour: 9, startMinute: 30, endHour: 11, endMinute: 30 },
    bookedAt: new Date().toISOString(),
    status: 'upcoming',
    studentName: 'Sinh viên khác',
    studentId: 'SV001',
    studentClass: 'HTTT2022',
  },
];

interface BookingState {
  user: StudentSession;
  isLoggedIn: boolean;
  bookings: BookingRecord[];
  filter: FilterParams;

  // Actions
  setUser: (user: StudentSession) => void;
  login: (user: StudentSession) => void;
  logout: () => void;
  createBooking: (booking: BookingRecord) => void;
  cancelBooking: (bookingId: string) => void;
  setFilter: (filter: Partial<FilterParams>) => void;
  resetFilter: () => void;
  isSlotBooked: (roomId: string, date: string, slotId: string) => boolean;
  getMyBookings: () => BookingRecord[];
}

const DEFAULT_FILTER: FilterParams = {
  searchText: '',
  building: 'ALL',
  minCapacity: 0,
  equipment: [],
};

const DEFAULT_USER: StudentSession = {
  name: 'Nguyễn Văn A',
  studentId: '22IT001',
  studentClass: 'CNTT2022A',
  email: '22it001@vku.udn.vn',
  faculty: 'Khoa Khoa học Máy tính',
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      isLoggedIn: true, // Default to true for instant demo, can be toggled via login/logout
      bookings: INITIAL_BOOKINGS,
      filter: DEFAULT_FILTER,

      setUser: (user) => set({ user }),

      login: (user) => set({ user, isLoggedIn: true }),

      logout: () => set({ isLoggedIn: false }),

      createBooking: (booking) =>
        set((state) => ({ bookings: [...state.bookings, booking] })),

      cancelBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        })),

      setFilter: (filter) =>
        set((state) => ({ filter: { ...state.filter, ...filter } })),

      resetFilter: () => set({ filter: DEFAULT_FILTER }),

      isSlotBooked: (roomId, date, slotId) => {
        const { bookings } = get();
        return bookings.some(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.slot.id === slotId &&
            b.status !== 'cancelled'
        );
      },

      getMyBookings: () => {
        const { bookings, user } = get();
        return bookings.filter((b) => b.studentId === user.studentId);
      },
    }),
    {
      name: 'vku-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        bookings: state.bookings,
      }),
    }
  )
);

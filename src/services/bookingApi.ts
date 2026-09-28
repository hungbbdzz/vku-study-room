import { supabase } from './supabase';
import { Room, BookingRecord, TimeSlot } from '../types/booking';
import { MOCK_ROOMS } from '../data/mockRooms';

export interface BookingResult {
  success: boolean;
  data?: BookingRecord;
  error?: string;
  isConflict?: boolean;
}

/**
 * Fetch all rooms from Supabase (fallback to MOCK_ROOMS on error)
 */
export async function fetchRooms(): Promise<Room[]> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Fallback to MOCK_ROOMS:', error?.message);
      return MOCK_ROOMS;
    }

    return data as Room[];
  } catch (err) {
    console.warn('[Supabase] Error fetching rooms, using fallback:', err);
    return MOCK_ROOMS;
  }
}

/**
 * Fetch list of booked slot IDs for a room on a given date (to disable already-booked slots)
 */
export async function fetchBookedSlots(roomId: string, date: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('slot_id')
      .eq('room_id', roomId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (error) {
      console.warn('[Supabase] fetchBookedSlots error:', error.message);
      return [];
    }

    return (data || []).map((row: { slot_id: string }) => row.slot_id);
  } catch (err) {
    console.warn('[Supabase] fetchBookedSlots exception:', err);
    return [];
  }
}

/**
 * Create a new booking with RACE CONDITION prevention.
 * If 2 users book the same room, date, and slot simultaneously:
 * The Postgres UNIQUE index prevents the second insert and returns error code 23505.
 */
export async function createBookingApi(booking: {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  floor: number;
  date: string;
  slot: TimeSlot;
  studentName: string;
  studentId: string;
  studentClass: string;
}): Promise<BookingResult> {
  try {
    const { data, error } = await supabase.from('bookings').insert([
      {
        id: booking.id,
        room_id: booking.roomId,
        room_name: booking.roomName,
        building: booking.building,
        floor: booking.floor,
        date: booking.date,
        slot_id: booking.slot.id,
        slot_label: booking.slot.label,
        student_name: booking.studentName,
        student_id: booking.studentId,
        student_class: booking.studentClass,
        status: 'upcoming',
      },
    ]).select();

    if (error) {
      // Postgres error code 23505: unique_violation (Race Condition detected!)
      if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('prevent_duplicate_booking')) {
        return {
          success: false,
          isConflict: true,
          error: 'Khung giờ này vừa có người khác đặt trước! Vui lòng chọn khung giờ khác.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    const createdRecord: BookingRecord = {
      id: booking.id,
      roomId: booking.roomId,
      roomName: booking.roomName,
      building: booking.building as any,
      floor: booking.floor,
      date: booking.date,
      slot: booking.slot,
      bookedAt: new Date().toISOString(),
      status: 'upcoming',
      studentName: booking.studentName,
      studentId: booking.studentId,
      studentClass: booking.studentClass,
    };

    return {
      success: true,
      data: createdRecord,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Lỗi kết nối khi đặt phòng.',
    };
  }
}

/**
 * Fetch all bookings for a student
 */
export async function fetchMyBookingsApi(studentId: string): Promise<BookingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchMyBookings error:', error?.message);
      return [];
    }

    return data.map((b: any) => ({
      id: b.id,
      roomId: b.room_id,
      roomName: b.room_name,
      building: b.building,
      floor: b.floor,
      date: b.date,
      slot: {
        id: b.slot_id,
        label: b.slot_label,
        startHour: parseInt(b.slot_label.split(':')[0], 10) || 7,
        startMinute: parseInt(b.slot_label.split(':')[1], 10) || 0,
        endHour: 9,
        endMinute: 30,
      },
      bookedAt: b.created_at,
      status: b.status,
      studentName: b.student_name,
      studentId: b.student_id,
      studentClass: b.student_class,
    }));
  } catch (err) {
    console.warn('[Supabase] fetchMyBookings exception:', err);
    return [];
  }
}

/**
 * Cancel a booking
 */
export async function cancelBookingApi(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.warn('[Supabase] cancelBooking error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] cancelBooking exception:', err);
    return false;
  }
}

export type Equipment = 'projector' | 'whiteboard' | 'high_spec_pc' | 'ac';
export type Building = 'A' | 'B' | 'C' | 'V';
export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  name: string;
  building: Building;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  status: RoomStatus;
  description: string;
  color: string; // background color for placeholder image
}

export interface TimeSlot {
  id: string;
  label: string; // e.g. "07:30 – 09:30"
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface BookingRecord {
  id: string;
  roomId: string;
  roomName: string;
  building: Building;
  floor: number;
  date: string; // ISO date string YYYY-MM-DD
  slot: TimeSlot;
  bookedAt: string; // ISO datetime
  status: 'upcoming' | 'completed' | 'cancelled';
  studentName: string;
  studentId: string;
  studentClass: string;
  notificationId?: string;
}

export interface FilterParams {
  searchText: string;
  building: Building | 'ALL';
  minCapacity: number;
  equipment: Equipment[];
}

export interface StudentSession {
  name: string;
  studentId: string;
  studentClass: string;
}

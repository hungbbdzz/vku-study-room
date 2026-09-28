/**
 * notificationService.ts
 * NOTE: expo-notifications push token registration was removed from Expo Go SDK 53+.
 * Local scheduled notifications require a Development Build.
 * This stub keeps the app functional in Expo Go for demo purposes.
 * In a production/dev build, replace this with full expo-notifications implementation.
 */

import { TimeSlot } from '../types/booking';

export async function requestNotificationPermission(): Promise<boolean> {
  // Stubbed for Expo Go SDK 53 compatibility
  return false;
}

export async function scheduleCheckInReminder(
  roomName: string,
  date: string,
  slot: TimeSlot,
  bookingId: string
): Promise<string | null> {
  // Stubbed - would schedule 15-min reminder in a Development Build
  console.log(`[Notification] Would remind: ${roomName} at ${slot.label} on ${date}`);
  return null;
}

export async function sendTestNotification(
  roomName: string,
  slotLabel: string
): Promise<void> {
  // Stubbed for Expo Go - would fire after 3s in a Development Build
  console.log(`[Notification] Test: ${roomName} - ${slotLabel}`);
}

export async function cancelNotification(notificationId: string): Promise<void> {
  console.log(`[Notification] Cancel: ${notificationId}`);
}

export const ROOM_IMAGES: Record<string, any> = {
  'room-a101': require('../../assets/rooms/lab_pc.jpg'),
  'room-a201': require('../../assets/rooms/lab_pc.jpg'),
  'room-b102': require('../../assets/rooms/library.jpg'),
  'room-b205': require('../../assets/rooms/seminar.jpg'),
  'room-c301': require('../../assets/rooms/lab_pc.jpg'),
  'room-c101': require('../../assets/rooms/library.jpg'),
  'room-v001': require('../../assets/rooms/vkorea.jpg'),
  'room-v002': require('../../assets/rooms/vkorea.jpg'),
  'room-a105': require('../../assets/rooms/library.jpg'),
  'room-b301': require('../../assets/rooms/lab_pc.jpg'),
};

export function getRoomImage(roomId: string) {
  return ROOM_IMAGES[roomId] || require('../../assets/rooms/lab_pc.jpg');
}

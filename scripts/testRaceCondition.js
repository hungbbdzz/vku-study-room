const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try reading .env if present
let envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) {
      if (k.trim() === 'EXPO_PUBLIC_SUPABASE_URL') envUrl = v.trim();
      if (k.trim() === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') envKey = v.trim();
    }
  });
} catch (_) {}

const SUPABASE_URL = envUrl;
const SUPABASE_KEY = envKey;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRaceCondition() {
  console.log('--- 1. Sinh viên 1 đặt phòng Lab A101, ngày 2026-10-01, Slot 1 ---');
  const res1 = await supabase.from('bookings').insert([
    {
      id: 'test-race-1',
      room_id: 'room-a101',
      room_name: 'Lab A101',
      building: 'A',
      floor: 1,
      date: '2026-10-01',
      slot_id: 'slot1',
      slot_label: '07:30 – 09:30',
      student_name: 'Nguyễn Văn A',
      student_id: '20IT001',
      student_class: 'CNTT2020A',
      status: 'upcoming',
    },
  ]).select();

  console.log('Kết quả SV1:', res1.error ? res1.error.message : 'SUCCESS!');

  console.log('--- 2. Sinh viên 2 CÙNG ĐẶT Lab A101, ngày 2026-10-01, Slot 1 (Race Condition) ---');
  const res2 = await supabase.from('bookings').insert([
    {
      id: 'test-race-2',
      room_id: 'room-a101',
      room_name: 'Lab A101',
      building: 'A',
      floor: 1,
      date: '2026-10-01',
      slot_id: 'slot1',
      slot_label: '07:30 – 09:30',
      student_name: 'Trần Văn B',
      student_id: '20IT002',
      student_class: 'CNTT2020B',
      status: 'upcoming',
    },
  ]).select();

  if (res2.error) {
    console.log('✅ BẢO VỆ THÀNH CÔNG! Database từ chối SV2:');
    console.log('Mã lỗi:', res2.error.code);
    console.log('Chi tiết:', res2.error.message);
  } else {
    console.log('❌ Lỗi: SV2 vẫn đặt được (chưa có ràng buộc UNIQUE)');
  }

  // Dọn dẹp bản ghi test
  console.log('--- 3. Dọn dẹp dữ liệu test ---');
  await supabase.from('bookings').delete().eq('id', 'test-race-1');
  await supabase.from('bookings').delete().eq('id', 'test-race-2');
  console.log('Done!');
}

testRaceCondition();

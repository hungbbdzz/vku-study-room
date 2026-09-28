const https = require('https');

const MOCK_ROOMS = [
  {
    id: 'room-a101',
    name: 'Lab A101',
    building: 'A',
    floor: 1,
    capacity: 30,
    equipment: ['high_spec_pc', 'projector', 'ac'],
    status: 'available',
    description: 'Phòng Lab máy tính cấu hình cao, phù hợp lập trình và đồ hoạ.',
    color: '#1a73e8',
  },
  {
    id: 'room-a201',
    name: 'Lab A201',
    building: 'A',
    floor: 2,
    capacity: 20,
    equipment: ['high_spec_pc', 'ac'],
    status: 'available',
    description: 'Phòng Lab A201 yên tĩnh, lý tưởng cho nghiên cứu.',
    color: '#0d47a1',
  },
  {
    id: 'room-b102',
    name: 'Phòng Tự Học B102',
    building: 'B',
    floor: 1,
    capacity: 10,
    equipment: ['whiteboard', 'ac'],
    status: 'available',
    description: 'Phòng học nhóm nhỏ, có bảng trắng và điều hoà.',
    color: '#2e7d32',
  },
  {
    id: 'room-b205',
    name: 'Phòng Seminar B205',
    building: 'B',
    floor: 2,
    capacity: 15,
    equipment: ['projector', 'whiteboard', 'ac'],
    status: 'occupied',
    description: 'Phòng họp nhóm có máy chiếu, phù hợp thuyết trình.',
    color: '#1b5e20',
  },
  {
    id: 'room-c301',
    name: 'Lab C301',
    building: 'C',
    floor: 3,
    capacity: 25,
    equipment: ['high_spec_pc', 'projector', 'ac'],
    status: 'available',
    description: 'Phòng Lab hiện đại tầng 3 khu C, PC cấu hình mạnh.',
    color: '#6a1b9a',
  },
  {
    id: 'room-c101',
    name: 'Phòng Học C101',
    building: 'C',
    floor: 1,
    capacity: 6,
    equipment: ['whiteboard'],
    status: 'available',
    description: 'Phòng tự học nhỏ yên tĩnh, không có điều hoà.',
    color: '#4a148c',
  },
  {
    id: 'room-v001',
    name: 'Lab V-KOREA 01',
    building: 'V',
    floor: 1,
    capacity: 20,
    equipment: ['high_spec_pc', 'projector', 'whiteboard', 'ac'],
    status: 'available',
    description: 'Phòng Lab V-Korea hiện đại, đầy đủ trang thiết bị cao cấp.',
    color: '#b71c1c',
  },
  {
    id: 'room-v002',
    name: 'Lab V-KOREA 02',
    building: 'V',
    floor: 1,
    capacity: 15,
    equipment: ['high_spec_pc', 'ac'],
    status: 'occupied',
    description: 'Phòng Lab thực hành kỹ thuật, có PC cấu hình cao.',
    color: '#c62828',
  },
  {
    id: 'room-a105',
    name: 'Phòng Đọc A105',
    building: 'A',
    floor: 1,
    capacity: 8,
    equipment: ['ac', 'whiteboard'],
    status: 'available',
    description: 'Phòng đọc tài liệu yên tĩnh, sức chứa nhỏ.',
    color: '#0277bd',
  },
  {
    id: 'room-b301',
    name: 'Lab B301',
    building: 'B',
    floor: 3,
    capacity: 20,
    equipment: ['high_spec_pc', 'projector', 'ac'],
    status: 'available',
    description: 'Phòng Lab lập trình đầy đủ tiện nghi tầng 3.',
    color: '#388e3c',
  },
];

const fs = require('fs');
const path = require('path');

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

const hostname = (envUrl || 'https://nhszacrzcenlfzbccnub.supabase.co').replace(/^https?:\/\//, '');
const apiKey = envKey || '';

const payload = JSON.stringify(MOCK_ROOMS);

const req = https.request({
  hostname: hostname,
  path: '/rest/v1/rooms',
  method: 'POST',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
    'Content-Length': Buffer.byteLength(payload),
  },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('SEED RESULT:', res.statusCode, data || 'SUCCESS');
  });
});

req.on('error', e => console.error('SEED ERROR:', e.message));
req.write(payload);
req.end();

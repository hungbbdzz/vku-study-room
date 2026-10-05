Mini-Project 2: Real-time Study Room Booking App (React Native & Expo)
Learning Objectives:
Construct a high-performance React Native & Expo app for campus study room reservations.
Manage global booking state, user session, and active filters using Zustand.
Optimize list rendering with FlatList (60fps scrolling) and memoized card components.
Implement time-slot conflict prevention and local notification reminders.
Prerequisites:
React Native, Expo SDK, TypeScript, Zustand, React Navigation
Mandatory Mini-Project Submission Package (3 Deliverables)
1. Live Demo URL
Live deployed URL (Cloudflare Pages, Vercel, Expo Snack / APK) or a 2–3 minute video demonstration.

2. GitHub Repository
Public repository with clean commit history, modular architecture, and setup instructions in README.md.

3. Short Report (PDF)
A concise 2 to 4-page PDF report adhering to the official template: Feature checklist, architecture & screenshots.

🎯 Project Overview & Problem Scenario
VKU students and study groups require a fast, reliable mobile app to check real-time availability and reserve campus computer labs and study rooms without physical door checks or booking collisions.

📋 Core Functional Specifications:
Room Discovery & Multi-Parameter Filter:
High-performance FlatList feed displaying rooms with photos, building/floor, capacity badges, and real-time status (Available Now vs Occupied).
Instant search and filter chips by building (A, B, C, V), capacity (2–20 students), and equipment (Projector, Whiteboard, High-spec PC, AC).
Interactive Time-Slot Selector & Conflict Engine:
7-day date selector with 2-hour discrete time slots (e.g. 07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00).
Visual conflict prevention: already-booked slots are disabled in real time.
Generates a unique booking pass with an interactive QR check-in modal.
Global State Management with Zustand:
Dedicated useBookingStore managing user session, active reservations, and cancellation actions.
Local storage persistence via @react-native-async-storage/async-storage.
Local Notifications:
Integrates expo-notifications to trigger a check-in alert 15 minutes before the booked slot starts.
Submission & Assessment Guide
📦 Mandatory Mini-Project Submission Package (3 Deliverables):
🌐 Live Demo & Video: Expo Snack / Expo Go QR code link + 2–3 minute video demo of reservation flows on a physical device.
💻 GitHub Repository: Public React Native (Expo) source repository with README.md setup instructions.
📄 Short Technical Report (PDF): A 2–4 page PDF report adhering to the standard template.

Study bookingroom
làm ứng dung đặt phòng học, ứng dung cho phép xem phòng, xem phòng available có thể đặt duoc, xem lai lịch sử các phòng đã đặt thành công, xem được kết quả tìm kiếm lọc kết quả thẻ phòng, phòng phải có ảnh,location, kích cỡ, trạng thái, available thì phải có booking, xem được profile, khi book lựa chọn ngày và hiển thị phòng trống theo ngày đó giờ đó rồi mới book, tìm kiem có sàn lọc đa tham so , kich co, trang thai, vi tri,... Xu ly van de 2 người cùng dat 1 phong do cung 1 thoi diem trang thai phong chua kip thay doi thi phai lam sao phai xu ly conflict ai la nguoi co quyen uu tien hon vi du co 1 nguoi dinh dat phong do nhung vua xong co 1 nguoi khac vua dat xong trang thai chua duoc cap nhat thi phai xu ly sao cho nguoi sau kia khong dat duoc nua

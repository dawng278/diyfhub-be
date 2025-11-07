// File: be/server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Render sẽ cung cấp port qua process.env.PORT
// Khi chạy local, nó sẽ dùng 3001
const PORT = process.env.PORT || 3001; 

// --- Cấu hình CORS (Quan trọng!) ---
// Khi deploy, bạn nên chỉ cho phép domain Vercel của bạn
// Tạm thời, chúng ta cho phép tất cả:
app.use(cors()); 
// SAU KHI DEPLOY: Bạn nên sửa lại thành:
// app.use(cors({ origin: 'https://ten-app-fe-cua-ban.vercel.app' }));

// ... (Các endpoint /api/phim-moi và /api/phim giữ nguyên) ...
app.get('/api/phim-moi', async (req, res) => {
    // ... (Giữ nguyên code)
});

app.get('/api/phim', async (req, res) => {
    // ... (Giữ nguyên code)
});

// Server phải lắng nghe trên '0.0.0.0' để chấp nhận kết nối từ bên ngoài
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server đang chạy ở port ${PORT}`);
});
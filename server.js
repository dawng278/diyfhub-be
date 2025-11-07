const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Cài đặt Caching ---
// Lưu trữ cache đơn giản trong bộ nhớ
const cache = new Map();
// Thời gian cache (ví dụ: 15 phút * 60 giây * 1000 ms)
const CACHE_DURATION = 15 * 60 * 1000; 
// -------------------------

app.use(cors());

// --- Endpoint 1: Lấy phim mới (ĐÃ CÓ CACHING) ---
app.get('/api/phim-moi', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const cacheKey = `phim-moi:${page}`; // Tạo key cho cache

        // 1. Kiểm tra cache
        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] Trả về dữ liệu cache cho ${cacheKey}`);
            return res.json(cache.get(cacheKey).data); // Trả về data từ cache
        }

        // 2. Nếu không có cache, gọi API
        console.log(`[Cache MISS] Gọi API thật cho ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/danh-sach/phim-moi-cap-nhat`, {
            params: { page: page }
        });

        // 3. Lưu vào cache
        const cacheData = {
            data: response.data,
            timestamp: Date.now() // Lưu thời gian lấy
        };
        cache.set(cacheKey, cacheData);

        // 4. Trả kết quả về
        res.json(response.data);

    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API phim-moi', details: error.message });
    }
});

// --- Endpoint 2: Lấy chi tiết phim (ĐÃ CÓ CACHING) ---
app.get('/api/phim', async (req, res) => {
    try {
        const slug = req.query.slug;
        if (!slug) {
            return res.status(400).json({ message: 'Cần có slug phim' });
        }
        
        const cacheKey = `phim:${slug}`; // Key cache cho chi tiết phim

        // 1. Kiểm tra cache
        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] Trả về dữ liệu cache cho ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        // 2. Nếu không có cache, gọi API
        console.log(`[Cache MISS] Gọi API thật cho ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/phim/${slug}`);

        // 3. Lưu vào cache
        const cacheData = {
            data: response.data,
            timestamp: Date.now()
        };
        cache.set(cacheKey, cacheData);
        
        // 4. Trả kết quả về
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API phim', details: error.message });
    }
});

// Khởi động máy chủ
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Express (Local) đang chạy ở http://localhost:${PORT}`);
    console.log('Caching đã được kích hoạt (15 phút)!');
});
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

// CORS configuration - Allow requests from Vercel frontend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://diyfhub-fe.vercel.app',
        'https://*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// --- Endpoint 2: Phim mới cập nhật V2 ---
app.get('/api/phim-moi-v2', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const cacheKey = `phim-moi-v2:${page}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v2`, {
            params: { page }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API phim-moi-v2', details: error.message });
    }
});

// --- Endpoint 3: Phim mới cập nhật V3 ---
app.get('/api/phim-moi-v3', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const cacheKey = `phim-moi-v3:${page}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3`, {
            params: { page }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API phim-moi-v3', details: error.message });
    }
});

// --- Endpoint 4: Lấy chi tiết phim theo slug ---
app.get('/api/phim/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const cacheKey = `phim:${slug}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/phim/${slug}`);

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API phim', details: error.message });
    }
});

// --- Endpoint 5: Lấy thông tin phim theo TMDB ID ---
app.get('/api/tmdb/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const cacheKey = `tmdb:${type}:${id}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/tmdb/${type}/${id}`);

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API TMDB', details: error.message });
    }
});

// --- Endpoint 6: Danh sách tổng hợp ---
app.get('/api/danh-sach/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { page, sort_field, sort_type, sort_lang, category, country, year, limit } = req.query;
        
        const cacheKey = `danh-sach:${type}:${JSON.stringify(req.query)}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/v1/api/danh-sach/${type}`, {
            params: { page, sort_field, sort_type, sort_lang, category, country, year, limit }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API danh-sach', details: error.message });
    }
});

// --- Endpoint 7: Tìm kiếm phim ---
app.get('/api/tim-kiem', async (req, res) => {
    try {
        const { keyword, page, sort_field, sort_type, sort_lang, category, country, year, limit } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ message: 'Cần có keyword để tìm kiếm' });
        }

        const cacheKey = `tim-kiem:${JSON.stringify(req.query)}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/v1/api/tim-kiem`, {
            params: { keyword, page, sort_field, sort_type, sort_lang, category, country, year, limit }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API tim-kiem', details: error.message });
    }
});

// --- Endpoint 8: Lấy danh sách thể loại ---
app.get('/api/the-loai', async (req, res) => {
    try {
        const cacheKey = 'the-loai';

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/the-loai`);

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API the-loai', details: error.message });
    }
});

// --- Endpoint 9: Chi tiết thể loại ---
app.get('/api/the-loai/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { page, sort_field, sort_type, sort_lang, country, year, limit } = req.query;
        
        const cacheKey = `the-loai:${slug}:${JSON.stringify(req.query)}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/v1/api/the-loai/${slug}`, {
            params: { page, sort_field, sort_type, sort_lang, country, year, limit }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API the-loai chi tiết', details: error.message });
    }
});

// --- Endpoint 10: Lấy danh sách quốc gia ---
app.get('/api/quoc-gia', async (req, res) => {
    try {
        const cacheKey = 'quoc-gia';

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/quoc-gia`);

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API quoc-gia', details: error.message });
    }
});

// --- Endpoint 11: Chi tiết quốc gia ---
app.get('/api/quoc-gia/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { page, sort_field, sort_type, sort_lang, category, year, limit } = req.query;
        
        const cacheKey = `quoc-gia:${slug}:${JSON.stringify(req.query)}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/v1/api/quoc-gia/${slug}`, {
            params: { page, sort_field, sort_type, sort_lang, category, year, limit }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API quoc-gia chi tiết', details: error.message });
    }
});

// --- Endpoint 12: Lấy phim theo năm ---
app.get('/api/nam/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const { page, sort_field, sort_type, sort_lang, category, country, limit } = req.query;
        
        const cacheKey = `nam:${year}:${JSON.stringify(req.query)}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.json(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const response = await axios.get(`https://phimapi.com/v1/api/nam/${year}`, {
            params: { page, sort_field, sort_type, sort_lang, category, country, limit }
        });

        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gọi API nam', details: error.message });
    }
});

// --- Endpoint 13: Chuyển đổi ảnh sang WEBP ---
app.get('/api/image', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ message: 'Cần có URL ảnh' });
        }

        const cacheKey = `image:${url}`;

        if (cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
            console.log(`[Cache HIT] ${cacheKey}`);
            return res.redirect(cache.get(cacheKey).data);
        }

        console.log(`[Cache MISS] ${cacheKey}`);
        const imageUrl = `https://phimapi.com/image.php?url=${encodeURIComponent(url)}`;
        
        cache.set(cacheKey, { data: imageUrl, timestamp: Date.now() });
        res.redirect(imageUrl);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi chuyển đổi ảnh', details: error.message });
    }
});

// Khởi động máy chủ
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Express (Local) đang chạy ở http://localhost:${PORT}`);
    console.log('Caching đã được kích hoạt (15 phút)!');
});
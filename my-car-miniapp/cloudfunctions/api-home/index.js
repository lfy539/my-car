const axios = require('axios');

const API_BASE = process.env.ADMIN_API_BASE_URL || 'http://192.168.31.9:8000/api/v1';
const PUBLIC_TOKEN = process.env.ADMIN_PUBLIC_TOKEN || '';

function headers() {
  const h = {};
  if (PUBLIC_TOKEN) {
    h.Authorization = `Bearer ${PUBLIC_TOKEN}`;
  }
  return h;
}

exports.main = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/home`, {
      headers: headers(),
      timeout: 10000,
    });
    return {
      code: 0,
      message: 'success',
      data,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('api-home proxy error:', err?.message || err);
    return {
      code: 5001,
      message: '获取首页数据失败',
      data: null,
      timestamp: Date.now(),
    };
  }
};

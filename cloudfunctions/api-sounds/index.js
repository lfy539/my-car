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

exports.main = async (event, context) => {
  const { action, ...params } = event;

  switch (action) {
    case 'list':
      return getList(params);
    case 'detail':
      return getDetail(params);
    default:
      return { code: 1001, message: '未知操作', data: null, timestamp: Date.now() };
  }
};

async function getList({ page = 1, pageSize = 10, brandId, modelId, soundType, sortBy = 'latest' }) {
  try {
    const { data } = await axios.get(`${API_BASE}/public/sounds`, {
      headers: headers(),
      timeout: 10000,
      params: {
        page,
        pageSize,
        brandId: brandId || '',
        modelId: modelId || '',
        soundType: soundType || '',
        sortBy,
      },
    });

    return {
      code: 0,
      message: 'success',
      data,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getList proxy error:', err?.message || err);
    return { code: 5001, message: '获取音效列表失败', data: null, timestamp: Date.now() };
  }
}

async function getDetail({ id }) {
  if (!id) {
    return { code: 1001, message: '缺少音效ID', data: null, timestamp: Date.now() };
  }

  try {
    const { data } = await axios.get(`${API_BASE}/public/sounds/${id}`, {
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
    if (err?.response?.status === 404) {
      return { code: 3001, message: '音效不存在', data: null, timestamp: Date.now() };
    }
    console.error('getDetail proxy error:', err?.message || err);
    return { code: 5001, message: '获取音效详情失败', data: null, timestamp: Date.now() };
  }
}

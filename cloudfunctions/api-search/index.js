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
    case 'suggest':
      return getSuggestions(params);
    case 'search':
      return doSearch(params);
    case 'hot':
      return getHotKeywords();
    default:
      return { code: 1001, message: '未知操作', data: null, timestamp: Date.now() };
  }
};

/**
 * 获取搜索建议
 */
async function getSuggestions({ keyword }) {
  try {
    if (!keyword || keyword.length < 1) {
      return { code: 0, message: 'success', data: { suggestions: [] }, timestamp: Date.now() };
    }
    const { data } = await axios.get(`${API_BASE}/public/search/suggest`, {
      headers: headers(),
      timeout: 10000,
      params: { keyword },
    });

    return {
      code: 0,
      message: 'success',
      data,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getSuggestions proxy error:', err?.message || err);
    return { code: 5001, message: '获取搜索建议失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 执行搜索
 */
async function doSearch({ keyword, type = 'all', page = 1, pageSize = 20 }) {
  if (!keyword) {
    return { code: 1001, message: '请输入搜索关键词', data: null, timestamp: Date.now() };
  }

  try {
    const { data } = await axios.get(`${API_BASE}/public/search`, {
      headers: headers(),
      timeout: 10000,
      params: { keyword, type, page, pageSize },
    });

    return {
      code: 0,
      message: 'success',
      data,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('doSearch proxy error:', err?.message || err);
    return { code: 5001, message: '搜索失败', data: null, timestamp: Date.now() };
  }
}

/**
 * 获取热门搜索关键词
 */
async function getHotKeywords() {
  try {
    const { data } = await axios.get(`${API_BASE}/public/search/hot`, {
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
    console.error('getHotKeywords proxy error:', err?.message || err);
    return {
      code: 0,
      message: 'success',
      data: { keywords: [] },
      timestamp: Date.now(),
    };
  }
}

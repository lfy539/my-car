/**
 * 收藏相关云函数
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;

  if (!OPENID) {
    return { code: 2001, message: '未登录', data: null, timestamp: Date.now() };
  }

  const { action, ...params } = event;

  switch (action) {
    case 'add':
      return addFavorite(OPENID, params);
    case 'remove':
      return removeFavorite(OPENID, params);
    case 'list':
      return getFavorites(OPENID, params);
    case 'check':
      return checkFavorite(OPENID, params);
    default:
      return { code: 1001, message: '未知操作', data: null, timestamp: Date.now() };
  }
};

async function addFavorite(userId, { targetType, targetId }) {
  if (!targetType || !targetId) {
    return { code: 1001, message: '参数错误', data: null, timestamp: Date.now() };
  }

  try {
    const existing = await db.collection('user_favorites')
      .where({ userId, targetType, targetId })
      .limit(1)
      .get();

    if (existing.data.length > 0) {
      return { code: 3002, message: '已收藏', data: existing.data[0], timestamp: Date.now() };
    }

    const result = await db.collection('user_favorites').add({
      data: {
        userId,
        targetType,
        targetId,
        createdAt: Date.now(),
      },
    });

    return {
      code: 0,
      message: 'success',
      data: { _id: result._id, targetType, targetId },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('addFavorite error:', err);
    return { code: 5001, message: '收藏失败', data: null, timestamp: Date.now() };
  }
}

async function removeFavorite(userId, { id, targetType, targetId }) {
  try {
    if (id) {
      await db.collection('user_favorites').doc(id).remove();
    } else if (targetType && targetId) {
      await db.collection('user_favorites')
        .where({ userId, targetType, targetId })
        .remove();
    } else {
      return { code: 1001, message: '参数错误', data: null, timestamp: Date.now() };
    }

    return { code: 0, message: 'success', data: null, timestamp: Date.now() };
  } catch (err) {
    console.error('removeFavorite error:', err);
    return { code: 5001, message: '取消收藏失败', data: null, timestamp: Date.now() };
  }
}

async function getFavorites(userId, { page = 1, pageSize = 20, targetType }) {
  try {
    const where = { userId };
    if (targetType) where.targetType = targetType;

    const countRes = await db.collection('user_favorites').where(where).count();
    const total = countRes.total;

    const listRes = await db.collection('user_favorites')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      message: 'success',
      data: { list: listRes.data, total, page, pageSize },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getFavorites error:', err);
    return { code: 5001, message: '获取收藏列表失败', data: null, timestamp: Date.now() };
  }
}

async function checkFavorite(userId, { targetType, targetId }) {
  if (!targetType || !targetId) {
    return { code: 1001, message: '参数错误', data: null, timestamp: Date.now() };
  }

  try {
    const res = await db.collection('user_favorites')
      .where({ userId, targetType, targetId })
      .limit(1)
      .get();

    const isFavorite = res.data.length > 0;

    return {
      code: 0,
      message: 'success',
      data: {
        isFavorite,
        favoriteId: isFavorite ? res.data[0]._id : null,
      },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('checkFavorite error:', err);
    return { code: 5001, message: '检查收藏状态失败', data: null, timestamp: Date.now() };
  }
}
